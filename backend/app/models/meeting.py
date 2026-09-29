"""Meeting and preparation API models."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.memory import MemoryReference


MeetingStatus = Literal["upcoming", "completed", "follow-up"]


class MeetingResponse(BaseModel):
    id: str
    contact_id: str
    company_id: str
    contact_name: str
    company: str
    role: str
    date: str
    time: str
    type: str
    status: MeetingStatus
    last_interaction: str
    pending_followups: int = 0
    memory_count: int = 0


class MeetingPreparationContact(BaseModel):
    name: str
    company: str
    role: str


class MeetingPreparationDetails(BaseModel):
    contact: MeetingPreparationContact
    quick_context: str
    previous_discussions: list[str] = Field(default_factory=list)
    pending_followups: list[str] = Field(default_factory=list)
    key_insights: list[str] = Field(default_factory=list)
    suggested_agenda: list[str] = Field(default_factory=list)
    suggested_questions: list[str] = Field(default_factory=list)


class MeetingPreparationRequest(BaseModel):
    message: str = Field(default="Prepare me for this meeting", max_length=2000)

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        return value.strip() or "Prepare me for this meeting"


class MeetingPreparationResponse(BaseModel):
    meeting_id: str
    preparation: MeetingPreparationDetails
    memories_used: list["MemoryReference"]


class MeetingOutcomeRequest(BaseModel):
    summary: str = Field(min_length=1, max_length=10000)

    @field_validator("summary")
    @classmethod
    def summary_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("summary must not be blank")
        return value


class MeetingOutcomeResponse(BaseModel):
    status: str
    message: str


