"""Memory API models."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator


MemoryCategory = Literal[
    "people",
    "meetings",
    "commitments",
    "follow-ups",
    "preferences",
    "important-context",
]
MemoryStatus = Literal["Pending", "Resolved", "Noted"]


class MemoryCreateRequest(BaseModel):
    contact_name: str = Field(min_length=1, max_length=120)
    company: str = Field(min_length=1, max_length=200)
    role: str | None = Field(default=None, max_length=120)
    content: str = Field(min_length=1, max_length=10000)

    @field_validator("contact_name", "company", "content", "role")
    @classmethod
    def values_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("value must not be blank")
        return value


class MemoryCreateResponse(BaseModel):
    status: str
    message: str


class MemoryReference(BaseModel):
    text: str
    type: str = "experience"


class MemorySearchItem(MemoryReference):
    pass


class MemorySearchResponse(BaseModel):
    query: str
    memories: list[MemorySearchItem]


class MemoryRecord(BaseModel):
    id: str
    body: str
    contact_name: str | None = None
    company: str | None = None
    category: MemoryCategory = "meetings"
    contact_id: str | None = None
    company_id: str | None = None
    status: MemoryStatus = "Noted"
    type: str = "meeting"


class MemoryListResponse(BaseModel):
    memories: list[MemoryRecord]


class HindsightStatusResponse(BaseModel):
    status: Literal["connected", "unavailable"]
    provider: str = "Hindsight"
    bank_id: str
