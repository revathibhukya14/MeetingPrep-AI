"""Small in-memory contact and meeting dataset for the demo."""

from datetime import date

CONTACTS = [
    {
        "id": "rahul",
        "name": "Rahul Sharma",
        "company": "ABC Technologies",
        "company_id": "abc",
        "role": "CTO",
        "last_interaction": "Discussed API integration and security requirements.",
        "initials": "RS",
        "pending_followups": 2,
    },
    {
        "id": "sarah",
        "name": "Sarah Williams",
        "company": "Acme Corporation",
        "company_id": "acme",
        "role": "Product Director",
        "last_interaction": "Aligned on the Q4 product discussion.",
        "initials": "SW",
        "pending_followups": 1,
    },
    {
        "id": "david",
        "name": "David Chen",
        "company": "TechNova Solutions",
        "company_id": "technova",
        "role": "VP Engineering",
        "last_interaction": "Reviewed engineering capacity for the rollout.",
        "initials": "DC",
        "pending_followups": 0,
    },
]

MEETINGS = [
    {
        "id": "meet-abc-today",
        "contact_id": "rahul",
        "date": "2026-10-02",
        "time": "10:30",
        "type": "Technical Strategy Discussion",
        "status": "follow-up",
        "last_interaction": "Discussed API integration and security requirements.",
        "pending_followups": 2,
    },
    {
        "id": "meet-acme-today",
        "contact_id": "sarah",
        "date": "2026-10-02",
        "time": "14:30",
        "type": "Product discussion",
        "status": "upcoming",
        "last_interaction": "Reviewed roadmap priorities and launch sequencing.",
        "pending_followups": 1,
    },
    {
        "id": "meet-technova-today",
        "contact_id": "david",
        "date": "2026-10-02",
        "time": "16:15",
        "type": "Technical review",
        "status": "upcoming",
        "last_interaction": "Walked through architecture constraints for the integration.",
        "pending_followups": 0,
    },
    {
        "id": "meet-abc-tomorrow",
        "contact_id": "rahul",
        "date": "2026-10-03",
        "time": "10:00",
        "type": "Technical follow-up",
        "status": "follow-up",
        "last_interaction": "API documentation and the technical demo are still pending.",
        "pending_followups": 2,
    },
    {
        "id": "meet-acme-thu",
        "contact_id": "sarah",
        "date": "2026-10-08",
        "time": "11:00",
        "type": "Working session",
        "status": "upcoming",
        "last_interaction": "Requested a clearer view of implementation trade-offs.",
        "pending_followups": 0,
    },
    {
        "id": "meet-abc-pricing",
        "contact_id": "rahul",
        "date": "2026-09-18",
        "time": "15:00",
        "type": "Pricing",
        "status": "completed",
        "last_interaction": "Discussed pricing and the scope of a technical demo.",
        "pending_followups": 0,
    },
    {
        "id": "meet-abc-security",
        "contact_id": "rahul",
        "date": "2026-09-11",
        "time": "09:30",
        "type": "Security review",
        "status": "completed",
        "last_interaction": "Discussed security requirements in detail.",
        "pending_followups": 0,
    },
]


def get_contact(contact_id: str) -> dict[str, str | int]:
    return next((contact for contact in CONTACTS if contact["id"] == contact_id), None)


def get_meeting(meeting_id: str) -> dict[str, str | int]:
    return next((meeting for meeting in MEETINGS if meeting["id"] == meeting_id), None)


def enrich_meeting(meeting: dict[str, str | int]) -> dict[str, str | int] | None:
    contact = get_contact(str(meeting["contact_id"]))
    if contact is None:
        return None
    return {
        **meeting,
        "contact_name": contact["name"],
        "company": contact["company"],
        "company_id": contact["company_id"],
        "role": contact["role"],
        "memory_count": 0,
    }


def contact_response(contact: dict[str, str | int], memory_count: int = 0) -> dict[str, str | int]:
    related_meetings = [meeting for meeting in MEETINGS if meeting["contact_id"] == contact["id"]]
    return {
        **contact,
        "meeting_count": len(related_meetings),
        "memory_count": memory_count,
        "pending_followups": int(contact["pending_followups"]),
    }


def meeting_is_upcoming(meeting: dict[str, str | int]) -> bool:
    return date.fromisoformat(str(meeting["date"])) >= date.today()
