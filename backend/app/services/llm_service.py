"""Groq chat-completions client for structured meeting preparation."""

import json

import httpx

from app.config import settings
from app.models.assistant import AgentIntent
from app.models.meeting import MeetingPreparationDetails


class LLMServiceError(Exception):
    """Base class for sanitized LLM service failures."""


class LLMConfigurationError(LLMServiceError):
    """Raised when the selected provider is not configured."""


class LLMUnavailableError(LLMServiceError):
    """Raised when the provider request fails or returns invalid data."""


SYSTEM_INSTRUCTIONS = """You are MeetingPrep AI, a professional meeting preparation assistant.
Your job is to help a professional prepare for an upcoming meeting using relevant historical memories.
Use only the supplied meeting context and retrieved memories. Do not invent facts.
Clearly distinguish known information from suggestions. Prioritize previous discussions, unresolved issues,
commitments, pending follow-ups, preferences, concerns, decisions, and opportunities.
Generate concise, actionable preparation. Return only a JSON object with contact (name, company, role), quick_context,
previous_discussions, pending_followups, key_insights, suggested_agenda, and suggested_questions. Every list field
must be an array of strings.
If no memories were supplied, say so in quick_context and do not imply historical facts are known."""


class LLMService:
    async def classify_intent(self, message: str) -> AgentIntent | None:
        if settings.llm_provider.lower() != "groq" or not settings.groq_api_key:
            return None

        request_body = {
            "model": settings.llm_model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "Classify the user's message. Return JSON with one intent field, exactly one of "
                    "GENERAL_CONVERSATION, LIST_MEETINGS, RECALL_MEMORY, PREPARE_MEETING, STORE_MEMORY. "
                    "Store intent is only for useful new professional meeting information.",
                },
                {"role": "user", "content": message},
            ],
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                    json=request_body,
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
            intent = json.loads(content).get("intent")
            if intent in {
                "GENERAL_CONVERSATION",
                "LIST_MEETINGS",
                "RECALL_MEMORY",
                "PREPARE_MEETING",
                "STORE_MEMORY",
            }:
                return intent
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
            return None
        return None

    async def generate_meeting_preparation(
        self,
        *,
        meeting_context: dict[str, str],
        memories: list[dict[str, str]],
    ) -> MeetingPreparationDetails:
        if settings.llm_provider.lower() != "groq":
            raise LLMConfigurationError("The configured LLM provider is not supported.")
        if not settings.groq_api_key:
            raise LLMConfigurationError("LLM is not configured. Set GROQ_API_KEY in backend/.env.")

        request_body = {
            "model": settings.llm_model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": SYSTEM_INSTRUCTIONS},
                {
                    "role": "user",
                    "content": json.dumps(
                        {"meeting_context": meeting_context, "memories": memories},
                        ensure_ascii=True,
                    ),
                },
            ],
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                    json=request_body,
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
            return MeetingPreparationDetails.model_validate_json(content)
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
            raise LLMUnavailableError("The meeting preparation service is unavailable or returned an invalid response.") from error


llm_service = LLMService()
