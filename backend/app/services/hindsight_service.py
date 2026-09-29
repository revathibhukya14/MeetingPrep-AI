"""Async Hindsight client lifecycle and memory operations."""

import asyncio
import logging
import re
from urllib.parse import urlsplit

from hindsight_client import Hindsight
from hindsight_client_api.exceptions import NotFoundException

from app.config import settings

logger = logging.getLogger(__name__)

_RESPONSE_HEADERS_RE = re.compile(
    r"HTTP response headers:.*?(?=HTTP response body:|$)",
    flags=re.IGNORECASE | re.DOTALL,
)
_SENSITIVE_VALUE_RE = re.compile(
    r"([\"']?(?:authorization|x[-_ ]?api[-_ ]?key|api[-_ ]?key)[\"']?\s*[:=]\s*[\"']?)"
    r"(?:bearer\s+)?[^\"'\s,;}\]]+",
    flags=re.IGNORECASE,
)


def _safe_exception_message(error: Exception) -> str:
    message = str(error)
    message = _RESPONSE_HEADERS_RE.sub("[response headers omitted]\n", message)
    message = _SENSITIVE_VALUE_RE.sub(r"\1[REDACTED]", message)
    if settings.hindsight_api_key:
        message = message.replace(settings.hindsight_api_key, "[REDACTED]")
    return message.strip()[:1000] or "No error detail was provided."


def _log_hindsight_failure(operation: str, error: Exception) -> None:
    logger.error(
        "Hindsight %s failed (%s): %s",
        operation,
        type(error).__name__,
        _safe_exception_message(error),
    )


def _is_not_found(error: Exception) -> bool:
    if isinstance(error, NotFoundException):
        return True
    status = getattr(error, "status", None) or getattr(error, "status_code", None)
    try:
        return int(status) == 404
    except (TypeError, ValueError):
        return False


class HindsightServiceError(Exception):
    """Base class for safe errors returned by Hindsight operations."""


class HindsightConfigurationError(HindsightServiceError):
    """Raised when required Hindsight configuration is missing or invalid."""


class HindsightUnavailableError(HindsightServiceError):
    """Raised when Hindsight cannot complete an operation."""


class HindsightService:
    def __init__(self) -> None:
        self._client: Hindsight | None = None
        self._bank_ready = False
        self._bank_lock = asyncio.Lock()

    def _get_client(self) -> Hindsight:
        if not settings.hindsight_api_key:
            raise HindsightConfigurationError(
                "Hindsight is not configured. Set HINDSIGHT_API_KEY in backend/.env."
            )

        parsed_url = urlsplit(settings.hindsight_base_url)
        if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
            raise HindsightConfigurationError(
                "HINDSIGHT_BASE_URL must be an absolute HTTP or HTTPS URL."
            )

        if self._client is None:
            try:
                self._client = Hindsight(
                    base_url=settings.hindsight_base_url.rstrip("/"),
                    api_key=settings.hindsight_api_key,
                )
            except Exception as error:
                _log_hindsight_failure("client initialization", error)
                raise HindsightUnavailableError(
                    "Hindsight could not initialize the client. Check the service URL and configuration."
                ) from error
        return self._client

    async def _ensure_bank(self) -> Hindsight:
        client = self._get_client()
        if self._bank_ready:
            return client

        async with self._bank_lock:
            if self._bank_ready:
                return client

            try:
                await client.aget_bank_config(settings.hindsight_bank_id)
            except Exception as lookup_error:
                if not _is_not_found(lookup_error):
                    _log_hindsight_failure("memory bank lookup", lookup_error)
                    raise HindsightUnavailableError(
                        "Hindsight is unavailable. Check the service URL and API credentials."
                    ) from lookup_error

                try:
                    await client.acreate_bank(
                        bank_id=settings.hindsight_bank_id,
                        name="MeetingPrep AI",
                    )
                except Exception as create_error:
                    # A second process may have created the bank between the read and create.
                    try:
                        await client.aget_bank_config(settings.hindsight_bank_id)
                    except Exception as verify_error:
                        _log_hindsight_failure("memory bank creation", create_error)
                        _log_hindsight_failure("memory bank verification", verify_error)
                        raise HindsightUnavailableError(
                            "Hindsight could not initialize the memory bank. Check the service and configuration."
                        ) from create_error

            self._bank_ready = True
            return client

    async def retain_meeting(
        self,
        *,
        contact_name: str,
        company: str,
        content: str,
        role: str | None = None,
        meeting_id: str | None = None,
        document_id: str | None = None,
        update_mode: str | None = None,
    ) -> None:
        client = await self._ensure_bank()
        contact_description = f"{contact_name}, {role}" if role else contact_name
        context = f"Meeting with {contact_description} at {company}"
        memory_content = f"{context}.\n\n{content}"
        metadata = {
            "contact_name": contact_name,
            "company": company,
            "type": "meeting",
        }
        if role:
            metadata["role"] = role
        if meeting_id:
            metadata["meeting_id"] = meeting_id

        try:
            retain_options = {
                "bank_id": settings.hindsight_bank_id,
                "content": memory_content,
                "context": context,
                "metadata": metadata,
            }
            if document_id:
                retain_options["document_id"] = document_id
            if update_mode:
                retain_options["update_mode"] = update_mode
            await client.aretain(**retain_options)
        except Exception as error:
            _log_hindsight_failure("retain", error)
            raise HindsightUnavailableError(
                "Hindsight could not store the meeting memory."
            ) from error

    async def recall(self, query: str) -> list[dict[str, str]]:
        client = await self._ensure_bank()

        try:
            response = await client.arecall(
                bank_id=settings.hindsight_bank_id,
                query=query,
            )
        except Exception as error:
            _log_hindsight_failure("recall", error)
            raise HindsightUnavailableError(
                "Hindsight could not retrieve meeting memories."
            ) from error

        return [
            {"text": memory.text, "type": memory.type or "experience"}
            for memory in response.results
        ]

    async def list_meetings(self) -> list[dict[str, object]]:
        client = await self._ensure_bank()
        try:
            response = await asyncio.to_thread(
                client.documents.list_documents,
                bank_id=settings.hindsight_bank_id,
                limit=100,
                offset=0,
            )
            documents = await asyncio.gather(
                *(
                    asyncio.to_thread(
                        client.documents.get_document,
                        bank_id=settings.hindsight_bank_id,
                        document_id=item.id,
                    )
                    for item in response.items
                )
            )
        except Exception as error:
            _log_hindsight_failure("document listing", error)
            raise HindsightUnavailableError(
                "Hindsight could not list meeting memories."
            ) from error

        return [
            {
                "id": document.id,
                "text": document.original_text,
                "metadata": document.document_metadata or {},
                "created_at": document.created_at,
            }
            for document in documents
        ]

    async def check_status(self) -> None:
        await self._ensure_bank()

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            self._bank_ready = False


hindsight_service = HindsightService()