"""Meeting preparation orchestration across Hindsight and the LLM."""

import re

from app.demo_data import CONTACTS
from app.models.meeting import MeetingPreparationDetails
from app.services.hindsight_service import hindsight_service
from app.services.llm_service import llm_service


class MeetingAgent:
    async def prepare(
        self,
        *,
        contact: dict[str, str | int],
        meeting_context: dict[str, str],
        message: str,
    ) -> tuple[MeetingPreparationDetails, list[dict[str, str]]]:
        memories = await self.recall_memories(contact=contact, message=message)
        preparation = await self.generate_preparation(
            contact=contact,
            meeting_context=meeting_context,
            message=message,
            memories=memories,
        )
        return preparation, memories

    async def recall_memories(
        self,
        *,
        contact: dict[str, str | int],
        message: str,
    ) -> list[dict[str, str]]:
        name = str(contact["name"])
        company = str(contact["company"])
        recall_query = (
            f"Previous meetings, discussions, requirements, commitments, pending follow-ups, "
            f"preferences and concerns related to {name} from {company}. "
            f"Meeting request: {message}"
        )
        return await hindsight_service.recall(recall_query)

    async def generate_preparation(
        self,
        *,
        contact: dict[str, str | int],
        meeting_context: dict[str, str],
        message: str,
        memories: list[dict[str, str]],
    ) -> MeetingPreparationDetails:
        return await llm_service.generate_meeting_preparation(
            meeting_context={
                **meeting_context,
                "contact_name": str(contact["name"]),
                "company": str(contact["company"]),
                "role": str(contact["role"]),
                "user_request": message,
            },
            memories=memories,
        )

    @staticmethod
    def identify_contact(message: str) -> dict[str, str | int] | None:
        normalized = message.casefold()
        for contact in CONTACTS:
            full_name = str(contact["name"]).casefold()
            first_name = str(contact["name"]).split()[0].casefold()
            company = str(contact["company"]).casefold()
            if re.search(rf"\b{re.escape(full_name)}\b", normalized):
                return contact
            if re.search(rf"\b{re.escape(first_name)}\b", normalized) or re.search(
                rf"\b{re.escape(company)}\b", normalized
            ):
                return contact
        return None


meeting_agent = MeetingAgent()
