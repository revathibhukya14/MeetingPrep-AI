"""Rule-first MeetingPrep AI agent with optional LLM intent classification."""

import re
from dataclasses import dataclass
from datetime import date
from uuid import uuid4

from app.demo_data import CONTACTS, MEETINGS, enrich_meeting, meeting_is_upcoming
from app.models.assistant import AgentIntent, ChatRequest, ChatResponse
from app.models.meeting import MeetingPreparationDetails, MeetingResponse
from app.models.memory import MemoryReference
from app.services.hindsight_service import HindsightServiceError, hindsight_service
from app.services.llm_service import LLMServiceError, llm_service
from app.services.meeting_agent import meeting_agent


@dataclass
class ConversationContext:
    contact_id: str | None = None
    confirmation_contact_id: str | None = None


class MeetingPrepAgent:
    _greetings = {
        "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
        "what can you do", "help",
    }
    _affirmations = {"yes", "yes please", "yeah", "yep", "that's right", "correct"}
    _store_markers = re.compile(
        r"\b(asked|requested|prefers?|promised|agreed|decided|mentioned|confirmed|wants?|needs?|requires?|"
        r"pending|follow[- ]?up|interested|discussed|said|is from|is the (?:cto|ceo|director|lead))\b",
        re.IGNORECASE,
    )
    _recall_markers = re.compile(
        r"\b(remember|recall|previous discussions?|previous conversations?|what did .+ discuss|"
        r"what do we know|what did .+ (?:ask|request|promise|say))\b",
        re.IGNORECASE,
    )
    _prepare_markers = re.compile(
        r"\b(prepare|prep|brief|meeting brief|what should i know|before (?:i )?meet|"
        r"get me ready|help me get ready)\b",
        re.IGNORECASE,
    )
    _meeting_list_markers = re.compile(
        r"\b(meeting list|meetings do i have|show (?:my )?(?:upcoming )?meetings|"
        r"check (?:my )?meetings|list (?:my )?meetings|upcoming meetings)\b",
        re.IGNORECASE,
    )

    def __init__(self) -> None:
        self._conversations: dict[str, ConversationContext] = {}

    async def handle_message(self, request: ChatRequest) -> ChatResponse:
        conversation_id = request.conversation_id or str(uuid4())
        context = self._conversations.setdefault(conversation_id, ConversationContext())
        if len(self._conversations) > 500:
            oldest_id = next(iter(self._conversations))
            if oldest_id != conversation_id:
                self._conversations.pop(oldest_id, None)

        message = request.message.strip()
        normalized = re.sub(r"[.!?]+$", "", message.casefold()).strip()

        if context.confirmation_contact_id and normalized in self._affirmations:
            contact = self._find_contact(context.confirmation_contact_id)
            context.contact_id = context.confirmation_contact_id
            context.confirmation_contact_id = None
            return self._response(
                "GENERAL_CONVERSATION",
                conversation_id,
                f"Got it. I'll use what I've remembered about {contact['name']} from {contact['company']}. Say 'do it' when you're ready for a brief.",
            )

        contact = meeting_agent.identify_contact(message)
        if contact is not None:
            context.contact_id = str(contact["id"])

        if normalized in self._greetings:
            return self._response(
                "GENERAL_CONVERSATION",
                conversation_id,
                "Hey! I'm MeetingPrep AI. I can help you prepare for meetings, remember important details from previous conversations, and keep track of follow-ups.",
            )

        intent = self._rule_intent(normalized, message, context)
        if intent is None:
            intent = await llm_service.classify_intent(message) or "GENERAL_CONVERSATION"

        if intent == "LIST_MEETINGS":
            return self._list_meetings(conversation_id)

        if intent == "GENERAL_CONVERSATION":
            return self._general_response(conversation_id, message)

        contact = contact or self._find_contact(context.contact_id)
        if contact is None:
            unknown_name = self._extract_contact_name(message)
            if unknown_name:
                text = f"I couldn't find {unknown_name} in your contacts or meetings. Could you share the company name?"
            else:
                text = "Who is the meeting with? Share the contact's name or company and I can find the right context."
            return self._response(intent, conversation_id, text)

        if intent == "RECALL_MEMORY":
            return await self._recall_memory(conversation_id, contact, message)
        if intent == "STORE_MEMORY":
            return await self._store_memory(conversation_id, contact, message)
        if intent == "PREPARE_MEETING":
            return await self._prepare_meeting(conversation_id, contact, message)

        return self._general_response(conversation_id, message)

    def _rule_intent(
        self,
        normalized: str,
        message: str,
        context: ConversationContext,
    ) -> AgentIntent | None:
        if self._meeting_list_markers.search(normalized):
            return "LIST_MEETINGS"
        if normalized in {"do it", "go ahead", "prepare", "prepare me", "let's do it"} and context.contact_id:
            return "PREPARE_MEETING"
        if self._prepare_markers.search(normalized):
            return "PREPARE_MEETING"
        if self._recall_markers.search(normalized):
            return "RECALL_MEMORY"
        if self._store_markers.search(message):
            return "STORE_MEMORY"

        identified = meeting_agent.identify_contact(message)
        if identified and re.search(r"\b(i am|i'm) meeting\b|\bmeeting with\b", normalized):
            context.confirmation_contact_id = str(identified["id"])
            return "GENERAL_CONVERSATION"
        return None

    async def _recall_memory(
        self,
        conversation_id: str,
        contact: dict[str, str | int],
        message: str,
    ) -> ChatResponse:
        query = self._recall_query(contact, message)
        try:
            memories = await hindsight_service.recall(query)
        except HindsightServiceError:
            return self._response(
                "RECALL_MEMORY",
                conversation_id,
                "I can't access your saved meeting memories right now.",
            )

        references = [MemoryReference(**memory) for memory in memories]
        name = str(contact["name"])
        if not references:
            message_text = f"I don't have saved memories about {name} yet."
        else:
            memory_lines = "\n".join(f"- {memory.text}" for memory in references)
            count = len(references)
            message_text = f"I found these relevant memories about {name}:\n\n{memory_lines}\n\n{count} relevant memories found."
        return self._response(
            "RECALL_MEMORY",
            conversation_id,
            message_text,
            memories_used=references,
        )

    async def _store_memory(
        self,
        conversation_id: str,
        contact: dict[str, str | int],
        message: str,
    ) -> ChatResponse:
        meeting = self._find_meeting(contact, message)
        try:
            await hindsight_service.retain_meeting(
                contact_name=str(contact["name"]),
                company=str(contact["company"]),
                role=str(contact["role"]),
                meeting_id=str(meeting["id"]) if meeting else None,
                content=message.rstrip(" .!?"),
            )
        except HindsightServiceError:
            return self._response(
                "STORE_MEMORY",
                conversation_id,
                "I couldn't save that memory right now. Please try again.",
            )

        return self._response(
            "STORE_MEMORY",
            conversation_id,
            f"Got it. I've remembered this about {contact['name']}: {message.rstrip('.!?')}.",
        )

    async def _prepare_meeting(
        self,
        conversation_id: str,
        contact: dict[str, str | int],
        message: str,
    ) -> ChatResponse:
        meeting = self._find_meeting(contact, message)
        meeting_context = {
            "meeting_id": str(meeting["id"]) if meeting else "",
            "date": str(meeting["date"]) if meeting else "",
            "time": str(meeting["time"]) if meeting else "",
            "meeting_type": str(meeting["type"]) if meeting else "Meeting preparation",
            "last_interaction": str(meeting["last_interaction"]) if meeting else str(contact["last_interaction"]),
        }

        try:
            memories = await meeting_agent.recall_memories(contact=contact, message=message)
        except HindsightServiceError:
            return self._response(
                "PREPARE_MEETING",
                conversation_id,
                "I can't access your saved meeting memories right now.",
            )

        references = [MemoryReference(**memory) for memory in memories]
        try:
            preparation = await meeting_agent.generate_preparation(
                contact=contact,
                meeting_context=meeting_context,
                message=message,
                memories=memories,
            )
        except LLMServiceError:
            return self._response(
                "PREPARE_MEETING",
                conversation_id,
                "I found your meeting memories, but I'm unable to generate the full preparation right now.",
                memories_used=references,
            )

        return self._response(
            "PREPARE_MEETING",
            conversation_id,
            f"I found {len(references)} relevant memories about {contact['name']} and prepared your meeting brief.",
            memories_used=references,
            preparation=preparation,
        )

    def _list_meetings(self, conversation_id: str) -> ChatResponse:
        upcoming = [
            item
            for item in MEETINGS
            if item["status"] != "completed" and meeting_is_upcoming(item)
        ]
        response_meetings = []
        lines = []
        for index, meeting in enumerate(upcoming, start=1):
            enriched = enrich_meeting(meeting)
            if enriched is None:
                continue
            response_meetings.append(MeetingResponse(**enriched))
            parsed_date = date.fromisoformat(str(meeting["date"]))
            readable_date = parsed_date.strftime("%B %d").replace(" 0", " ")
            lines.append(
                f"{index}. {enriched['contact_name']} - {enriched['company']}\n"
                f"   {enriched['role']} | {enriched['type']}\n"
                f"   {readable_date}, {meeting['time']}"
            )

        if not lines:
            text = "You don't have any upcoming meetings scheduled."
        else:
            text = f"You have {len(lines)} upcoming meetings:\n\n" + "\n\n".join(lines)
        return self._response(
            "LIST_MEETINGS",
            conversation_id,
            text,
            meetings=response_meetings,
        )

    def _general_response(self, conversation_id: str, message: str) -> ChatResponse:
        identified = meeting_agent.identify_contact(message)
        if identified and re.search(r"\b(i am|i'm) meeting\b|\bmeeting with\b", message, re.IGNORECASE):
            return self._response(
                "GENERAL_CONVERSATION",
                conversation_id,
                f"Got it. Do you mean {identified['name']} from {identified['company']}?",
            )
        return self._response(
            "GENERAL_CONVERSATION",
            conversation_id,
            "I can help you prepare for meetings, recall previous discussions, and remember useful decisions, preferences, and follow-ups. Try asking about a contact or your upcoming meetings.",
        )

    @staticmethod
    def _recall_query(contact: dict[str, str | int], message: str) -> str:
        return (
            f"Previous discussions, requirements, commitments, preferences, concerns and follow-ups involving "
            f"{contact['name']} at {contact['company']}. User request: {message}"
        )

    @staticmethod
    def _find_contact(contact_id: str | None) -> dict[str, str | int] | None:
        if contact_id is None:
            return None
        return next((contact for contact in CONTACTS if contact["id"] == contact_id), None)

    @staticmethod
    def _find_meeting(
        contact: dict[str, str | int], message: str
    ) -> dict[str, str | int] | None:
        candidates = [
            meeting
            for meeting in MEETINGS
            if meeting["contact_id"] == contact["id"]
            and meeting["status"] != "completed"
            and meeting_is_upcoming(meeting)
        ]
        if "tomorrow" in message.casefold():
            tomorrow = date.fromordinal(date.today().toordinal() + 1).isoformat()
            return next((meeting for meeting in candidates if meeting["date"] == tomorrow), None) or (candidates[0] if candidates else None)
        if "today" in message.casefold():
            today = date.today().isoformat()
            return next((meeting for meeting in candidates if meeting["date"] == today), None) or (candidates[0] if candidates else None)
        return candidates[0] if candidates else None

    @staticmethod
    def _extract_contact_name(message: str) -> str | None:
        match = re.search(
            r"\b(?:about|with|regarding|meet(?:ing)?\s+with)\s+(?:my\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
            message,
        )
        return match.group(1) if match else None

    @staticmethod
    def _response(
        intent: AgentIntent,
        conversation_id: str,
        message: str,
        *,
        memories_used: list[MemoryReference] | None = None,
        preparation: MeetingPreparationDetails | None = None,
        meetings: list[MeetingResponse] | None = None,
    ) -> ChatResponse:
        return ChatResponse(
            intent=intent,
            conversation_id=conversation_id,
            message=message,
            memories_used=memories_used or [],
            preparation=preparation,
            meetings=meetings,
        )


agent = MeetingPrepAgent()