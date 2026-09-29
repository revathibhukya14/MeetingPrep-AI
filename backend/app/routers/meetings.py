"""Meeting data, preparation, and post-meeting learning endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.demo_data import CONTACTS, MEETINGS, enrich_meeting, get_contact, get_meeting
from app.models import (
    MeetingOutcomeRequest,
    MeetingOutcomeResponse,
    MeetingPreparationRequest,
    MeetingPreparationResponse,
    MeetingResponse,
    MemoryReference,
)
from app.services.hindsight_service import HindsightServiceError, hindsight_service
from app.services.llm_service import LLMServiceError
from app.services.meeting_agent import meeting_agent

router = APIRouter(tags=["meetings"])


@router.get("/meetings", response_model=list[MeetingResponse])
async def list_meetings() -> list[MeetingResponse]:
    return [
        MeetingResponse(**enriched)
        for meeting in MEETINGS
        if (enriched := enrich_meeting(meeting)) is not None
    ]


@router.post(
    "/meetings/{meeting_id}/prepare",
    response_model=MeetingPreparationResponse,
)
async def prepare_meeting(
    meeting_id: str,
    request: MeetingPreparationRequest,
) -> MeetingPreparationResponse:
    meeting = get_meeting(meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")

    contact = get_contact(str(meeting["contact_id"]))
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting contact not found.")

    try:
        preparation, memories = await meeting_agent.prepare(
            contact=contact,
            meeting_context={
                "meeting_id": meeting_id,
                "date": str(meeting["date"]),
                "time": str(meeting["time"]),
                "meeting_type": str(meeting["type"]),
                "last_interaction": str(meeting["last_interaction"]),
            },
            message=request.message,
        )
    except (HindsightServiceError, LLMServiceError) as error:
        detail = (
            "I can't access your saved meeting memories right now."
            if isinstance(error, HindsightServiceError)
            else "I found your meeting memories, but I'm unable to generate the full preparation right now."
        )
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail) from error

    return MeetingPreparationResponse(
        meeting_id=meeting_id,
        preparation=preparation,
        memories_used=[MemoryReference(**memory) for memory in memories],
    )


@router.post(
    "/meetings/{meeting_id}/outcome",
    response_model=MeetingOutcomeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def record_meeting_outcome(
    meeting_id: str,
    request: MeetingOutcomeRequest,
) -> MeetingOutcomeResponse:
    meeting = get_meeting(meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")

    contact = get_contact(str(meeting["contact_id"]))
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting contact not found.")

    try:
        await hindsight_service.retain_meeting(
            contact_name=str(contact["name"]),
            company=str(contact["company"]),
            role=str(contact["role"]),
            meeting_id=meeting_id,
            content=f"After the meeting: {request.summary}",
        )
    except HindsightServiceError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error

    return MeetingOutcomeResponse(status="stored", message="Meeting outcome saved to memory.")
