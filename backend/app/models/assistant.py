"""Assistant API models."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.meeting import MeetingPreparationDetails
from app.models.meeting import MeetingResponse
from app.models.memory import MemoryReference


AgentIntent = Literal[
    "GENERAL_CONVERSATION",
    "LIST_MEETINGS",
    "RECALL_MEMORY",
    "PREPARE_MEETING",
    "STORE_MEMORY",
]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: str | None = Field(default=None, min_length=1, max_length=120)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("message must not be blank")
        return value

    @field_validator("conversation_id")
    @classmethod
    def normalize_conversation_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ChatResponse(BaseModel):
    intent: AgentIntent
    conversation_id: str
    message: str
    memories_used: list[MemoryReference] = Field(default_factory=list)
    preparation: MeetingPreparationDetails | None = None
    meetings: list[MeetingResponse] | None = None
