"""Pydantic request and response model exports."""

from pydantic import BaseModel

from app.models.assistant import ChatRequest, ChatResponse
from app.models.contact import ContactResponse
from app.models.meeting import (
    MeetingOutcomeRequest,
    MeetingOutcomeResponse,
    MeetingPreparationDetails,
    MeetingPreparationRequest,
    MeetingPreparationResponse,
    MeetingResponse,
)
from app.models.memory import (
    HindsightStatusResponse,
    MemoryCreateRequest,
    MemoryCreateResponse,
    MemoryListResponse,
    MemoryRecord,
    MemoryReference,
    MemorySearchItem,
    MemorySearchResponse,
)


class RootResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str


__all__ = [
    "ChatRequest",
    "ChatResponse",
    "ContactResponse",
    "HealthResponse",
    "HindsightStatusResponse",
    "MeetingOutcomeRequest",
    "MeetingOutcomeResponse",
    "MeetingPreparationDetails",
    "MeetingPreparationRequest",
    "MeetingPreparationResponse",
    "MeetingResponse",
    "MemoryCreateRequest",
    "MemoryCreateResponse",
    "MemoryListResponse",
    "MemoryRecord",
    "MemoryReference",
    "MemorySearchItem",
    "MemorySearchResponse",
    "RootResponse",
]
