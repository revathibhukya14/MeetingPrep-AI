"""Hindsight-backed memory storage, listing, and recall endpoints."""

from fastapi import APIRouter, HTTPException, Query, status

from app.config import settings
from app.demo_data import CONTACTS
from app.models import (
    HindsightStatusResponse,
    MemoryCreateRequest,
    MemoryCreateResponse,
    MemoryListResponse,
    MemoryRecord,
    MemorySearchItem,
    MemorySearchResponse,
)
from app.services.hindsight_service import (
    HindsightServiceError,
    hindsight_service,
)

router = APIRouter(tags=["memories"])


@router.get("/memories", response_model=MemoryListResponse)
async def list_memories() -> MemoryListResponse:
    try:
        documents = await hindsight_service.list_meetings()
    except HindsightServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="I can't access saved meeting memories right now.",
        ) from error

    records = []
    for document in documents:
        text = str(document.get("text") or "").strip()
        if not text:
            continue
        metadata = document.get("metadata")
        metadata = metadata if isinstance(metadata, dict) else {}
        contact_name = str(metadata.get("contact_name", ""))
        company = str(metadata.get("company", ""))
        contact = next(
            (
                item
                for item in CONTACTS
                if contact_name.casefold() in {str(item["name"]).casefold(), str(item["name"]).split()[0].casefold()}
            ),
            None,
        )
        lowered = text.casefold()
        category = (
            "preferences" if "prefer" in lowered else
            "commitments" if any(term in lowered for term in ("promised", "agreed", "committed")) else
            "follow-ups" if any(term in lowered for term in ("pending", "follow-up", "follow up", "still needs")) else
            "important-context" if any(term in lowered for term in ("security", "requirement", "concern")) else
            "meetings"
        )
        status_label = "Pending" if any(term in lowered for term in ("promised", "pending", "follow-up", "follow up", "still needs")) else "Noted"
        records.append(
            MemoryRecord(
                id=str(document.get("id", "")),
                body=text,
                contact_name=contact_name or None,
                company=company or None,
                category=category,
                contact_id=str(contact["id"]) if contact else None,
                company_id=str(contact["company_id"]) if contact else None,
                status=status_label,
                type=str(metadata.get("type", "meeting")),
            )
        )
    return MemoryListResponse(memories=records)


@router.post("/memories", response_model=MemoryCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_memory(request: MemoryCreateRequest) -> MemoryCreateResponse:
    try:
        await hindsight_service.retain_meeting(
            contact_name=request.contact_name,
            company=request.company,
            role=request.role,
            content=request.content,
        )
    except HindsightServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="I couldn't save that memory right now. Please try again.",
        ) from error

    return MemoryCreateResponse(status="stored", message="Meeting memory stored.")


@router.post("/memories/test", response_model=MemoryCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_test_memories() -> MemoryCreateResponse:
    try:
        await hindsight_service.retain_meeting(
            contact_name="Rahul",
            company="ABC Technologies",
            role="CTO",
            content=(
                "Rahul Sharma is the CTO and is evaluating API integration for ABC Technologies. "
                "The company has strict security requirements. Rahul prefers technical discussions "
                "over high-level marketing presentations. Our team promised to send API documentation, "
                "and a technical demo is still pending."
            ),
            document_id="meetingprep-demo-rahul-abc",
            update_mode="replace",
        )
    except HindsightServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="I couldn't save that memory right now. Please try again.",
        ) from error

    return MemoryCreateResponse(status="stored", message="Rahul demo meeting memory stored.")


@router.get("/memories/search", response_model=MemorySearchResponse)
async def search_memories(q: str = Query(min_length=1, max_length=1000)) -> MemorySearchResponse:
    query = q.strip()
    if not query:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Query must not be blank.")

    try:
        results = await hindsight_service.recall(query)
    except HindsightServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="I can't access your saved meeting memories right now.",
        ) from error

    return MemorySearchResponse(
        query=query,
        memories=[MemorySearchItem(**memory) for memory in results],
    )


@router.get("/memories/status", response_model=HindsightStatusResponse)
async def memory_status() -> HindsightStatusResponse:
    try:
        await hindsight_service.check_status()
    except HindsightServiceError:
        return HindsightStatusResponse(status="unavailable", bank_id=settings.hindsight_bank_id)

    return HindsightStatusResponse(
        status="connected",
        provider="Hindsight",
        bank_id=settings.hindsight_bank_id,
    )
