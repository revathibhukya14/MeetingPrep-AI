"""Contact API models."""

from pydantic import BaseModel


class ContactResponse(BaseModel):
    id: str
    name: str
    company: str
    company_id: str
    role: str
    last_interaction: str
    memory_count: int = 0
    meeting_count: int = 0
    pending_followups: int = 0
    initials: str
