import asyncio
import logging
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import MeetingPreparationDetails
from app.services.hindsight_service import HindsightConfigurationError, hindsight_service
import app.services.hindsight_service as hindsight_service_module
from app.services.hindsight_service import HindsightService, HindsightUnavailableError
from app.services.llm_service import LLMConfigurationError, llm_service
from app.services.meeting_agent import meeting_agent


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def sample_preparation() -> MeetingPreparationDetails:
    return MeetingPreparationDetails(
        contact={"name": "Rahul Sharma", "company": "ABC Technologies", "role": "CTO"},
        quick_context="Rahul is evaluating API integration.",
        previous_discussions=["API integration"],
        pending_followups=["Send API documentation"],
        key_insights=["Security requirements matter to the team."],
        suggested_agenda=["Review API integration", "Confirm next steps"],
        suggested_questions=["What remains open on security?"],
    )


def test_root_and_health(client):
    assert client.get("/").json() == {"message": "MeetingPrep AI backend is running"}
    assert client.get("/api/health").json() == {
        "status": "ok",
        "service": "meetingprep-ai-backend",
    }


def test_meetings_and_contacts_are_real_demo_records(client):
    meetings = client.get("/api/meetings")
    contacts = client.get("/api/contacts")

    assert meetings.status_code == 200
    assert meetings.json()[0]["contact_name"] == "Rahul Sharma"
    assert contacts.status_code == 200
    assert any(contact["company"] == "ABC Technologies" for contact in contacts.json())


def test_memory_retain_route(monkeypatch, client):
    retain = AsyncMock()
    monkeypatch.setattr(hindsight_service, "retain_meeting", retain)
    response = client.post(
        "/api/memories",
        json={
            "contact_name": "Rahul Sharma",
            "company": "ABC Technologies",
            "role": "CTO",
            "content": "We promised to send API documentation.",
        },
    )

    assert response.status_code == 201
    retain.assert_awaited_once_with(
        contact_name="Rahul Sharma",
        company="ABC Technologies",
        role="CTO",
        content="We promised to send API documentation.",
    )


def test_memory_recall_route(monkeypatch, client):
    recall = AsyncMock(return_value=[{"text": "API documentation was promised.", "type": "experience"}])
    monkeypatch.setattr(hindsight_service, "recall", recall)

    response = client.get("/api/memories/search", params={"q": "Rahul API"})

    assert response.status_code == 200
    assert response.json()["memories"][0]["text"] == "API documentation was promised."
    recall.assert_awaited_once_with("Rahul API")


def test_memories_page_lists_hindsight_documents(monkeypatch, client):
    list_meetings = AsyncMock(
        return_value=[
            {
                "id": "doc-1",
                "text": "Meeting with Rahul Sharma, CTO at ABC Technologies. We promised API documentation.",
                "metadata": {"contact_name": "Rahul Sharma", "company": "ABC Technologies", "type": "meeting"},
            }
        ]
    )
    monkeypatch.setattr(hindsight_service, "list_meetings", list_meetings)

    response = client.get("/api/memories")

    assert response.status_code == 200
    record = response.json()["memories"][0]
    assert record["id"] == "doc-1"
    assert record["contact_id"] == "rahul"
    assert record["status"] == "Pending"


def test_memory_status_is_unavailable_without_service(monkeypatch, client):
    check_status = AsyncMock(side_effect=HindsightConfigurationError("not configured"))
    monkeypatch.setattr(hindsight_service, "check_status", check_status)

    response = client.get("/api/memories/status")

    assert response.status_code == 200
    assert response.json() == {
        "status": "unavailable",
        "provider": "Hindsight",
        "bank_id": "meetingprep-ai",
    }


def test_meeting_preparation_route(monkeypatch, client):
    prepare = AsyncMock(
        return_value=(
            sample_preparation(),
            [{"text": "API integration is a priority.", "type": "experience"}],
        )
    )
    monkeypatch.setattr(meeting_agent, "prepare", prepare)

    response = client.post(
        "/api/meetings/meet-abc-today/prepare",
        json={"message": "Prepare me for this meeting"},
    )

    assert response.status_code == 200
    assert response.json()["preparation"]["quick_context"] == "Rahul is evaluating API integration."
    assert response.json()["memories_used"][0]["text"] == "API integration is a priority."


def test_meeting_outcome_is_retained(monkeypatch, client):
    retain = AsyncMock()
    monkeypatch.setattr(hindsight_service, "retain_meeting", retain)

    response = client.post(
        "/api/meetings/meet-abc-today/outcome",
        json={"summary": "Rahul requested OAuth documentation."},
    )

    assert response.status_code == 201
    retain.assert_awaited_once()
    assert retain.await_args.kwargs["meeting_id"] == "meet-abc-today"
    assert "OAuth documentation" in retain.await_args.kwargs["content"]


def test_assistant_asks_for_contact_when_unknown(client):
    response = client.post("/api/assistant/chat", json={"message": "Help me get ready"})

    assert response.status_code == 200
    assert "Who is the meeting with?" in response.json()["message"]
    assert response.json()["intent"] == "PREPARE_MEETING"
    assert "preparation" not in response.json()


def test_assistant_returns_preparation_and_memories(monkeypatch, client):
    recall = AsyncMock(return_value=[{"text": "The technical demo is pending.", "type": "experience"}])
    generate = AsyncMock(return_value=sample_preparation())
    monkeypatch.setattr(meeting_agent, "recall_memories", recall)
    monkeypatch.setattr(meeting_agent, "generate_preparation", generate)

    response = client.post(
        "/api/assistant/chat",
        json={"message": "Prepare me for my meeting with Rahul"},
    )

    assert response.status_code == 200
    assert response.json()["intent"] == "PREPARE_MEETING"
    assert response.json()["preparation"]["contact"]["name"] == "Rahul Sharma"
    assert response.json()["memories_used"][0]["text"] == "The technical demo is pending."


def test_assistant_reports_llm_failure_with_memories(monkeypatch, client):
    recall = AsyncMock(return_value=[{"text": "The technical demo is pending.", "type": "experience"}])
    generate = AsyncMock(side_effect=LLMConfigurationError("secret key detail"))
    monkeypatch.setattr(meeting_agent, "recall_memories", recall)
    monkeypatch.setattr(meeting_agent, "generate_preparation", generate)

    response = client.post(
        "/api/assistant/chat",
        json={"message": "Prepare me for Rahul"},
    )

    assert response.status_code == 200
    assert "unable to generate the full preparation" in response.json()["message"]
    assert response.json()["memories_used"][0]["text"] == "The technical demo is pending."
    assert "secret" not in response.text


def test_assistant_greeting_does_not_call_hindsight(monkeypatch, client):
    recall = AsyncMock(side_effect=AssertionError("greeting should not recall memories"))
    monkeypatch.setattr(hindsight_service, "recall", recall)

    response = client.post("/api/assistant/chat", json={"message": "hello"})

    assert response.status_code == 200
    assert response.json()["intent"] == "GENERAL_CONVERSATION"
    assert "I'm MeetingPrep AI" in response.json()["message"]
    recall.assert_not_awaited()


def test_assistant_lists_meetings_without_hindsight(monkeypatch, client):
    recall = AsyncMock(side_effect=AssertionError("meeting list should not recall memories"))
    monkeypatch.setattr(hindsight_service, "recall", recall)

    response = client.post("/api/assistant/chat", json={"message": "check my meeting list"})

    assert response.status_code == 200
    assert response.json()["intent"] == "LIST_MEETINGS"
    assert len(response.json()["meetings"]) >= 3
    assert "Rahul Sharma - ABC Technologies" in response.json()["message"]
    recall.assert_not_awaited()


def test_assistant_recalls_contact_memories(monkeypatch, client):
    recall = AsyncMock(return_value=[
        {"text": "Rahul is evaluating API integration.", "type": "experience"},
        {"text": "The technical demo is pending.", "type": "experience"},
    ])
    monkeypatch.setattr(hindsight_service, "recall", recall)

    response = client.post("/api/assistant/chat", json={"message": "Show me previous discussions with Rahul"})

    assert response.status_code == 200
    assert response.json()["intent"] == "RECALL_MEMORY"
    assert "2 relevant memories found" in response.json()["message"]
    assert "API integration" in response.json()["message"]
    assert "ABC Technologies" in recall.await_args.args[0]


def test_assistant_recall_failure_is_user_friendly(monkeypatch, client):
    recall = AsyncMock(side_effect=HindsightConfigurationError("secret config detail"))
    monkeypatch.setattr(hindsight_service, "recall", recall)

    response = client.post(
        "/api/assistant/chat",
        json={"message": "What do I remember about Rahul?"},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "I can't access your saved meeting memories right now."
    assert "secret" not in response.text


def test_ambiguous_assistant_message_uses_configured_intent_classifier(monkeypatch, client):
    classify = AsyncMock(return_value="GENERAL_CONVERSATION")
    monkeypatch.setattr(llm_service, "classify_intent", classify)

    response = client.post("/api/assistant/chat", json={"message": "Could you help me get organized?"})

    assert response.status_code == 200
    assert response.json()["intent"] == "GENERAL_CONVERSATION"
    classify.assert_awaited_once_with("Could you help me get organized?")


def test_assistant_stores_useful_information(monkeypatch, client):
    retain = AsyncMock()
    monkeypatch.setattr(hindsight_service, "retain_meeting", retain)

    response = client.post(
        "/api/assistant/chat",
        json={"message": "Rahul requested OAuth documentation"},
    )

    assert response.status_code == 200
    assert response.json()["intent"] == "STORE_MEMORY"
    assert "I've remembered" in response.json()["message"]
    retain.assert_awaited_once()
    assert "OAuth documentation" in retain.await_args.kwargs["content"]


def test_assistant_does_not_claim_memory_was_saved_when_retain_fails(monkeypatch, client):
    retain = AsyncMock(side_effect=HindsightConfigurationError("not configured"))
    monkeypatch.setattr(hindsight_service, "retain_meeting", retain)

    response = client.post(
        "/api/assistant/chat",
        json={"message": "Rahul requested OAuth documentation"},
    )

    assert response.status_code == 200
    assert "couldn't save that memory" in response.json()["message"]
    assert "remembered" not in response.json()["message"]


def test_agent_keeps_contact_context_across_short_conversation(monkeypatch, client):
    recall = AsyncMock(return_value=[])
    generate = AsyncMock(return_value=sample_preparation())
    monkeypatch.setattr(meeting_agent, "recall_memories", recall)
    monkeypatch.setattr(meeting_agent, "generate_preparation", generate)
    conversation_id = "rahul-follow-up-test"

    first = client.post(
        "/api/assistant/chat",
        json={"message": "I'm meeting Rahul tomorrow", "conversation_id": conversation_id},
    )
    second = client.post(
        "/api/assistant/chat",
        json={"message": "Yes", "conversation_id": conversation_id},
    )
    third = client.post(
        "/api/assistant/chat",
        json={"message": "Do it", "conversation_id": conversation_id},
    )

    assert "Do you mean Rahul Sharma" in first.json()["message"]
    assert second.json()["intent"] == "GENERAL_CONVERSATION"
    assert third.json()["intent"] == "PREPARE_MEETING"
    assert third.json()["preparation"]["contact"]["name"] == "Rahul Sharma"


def test_invalid_meeting_returns_404(client):
    response = client.post("/api/meetings/not-a-meeting/prepare", json={})
    assert response.status_code == 404


def test_hindsight_retain_and_recall_log_sanitized_sdk_errors(monkeypatch, caplog):
    api_key = "test-private-hindsight-key"
    monkeypatch.setattr(
        hindsight_service_module,
        "settings",
        SimpleNamespace(hindsight_api_key=api_key, hindsight_bank_id="meetingprep-ai"),
    )
    fake_client = SimpleNamespace(
        aretain=AsyncMock(side_effect=RuntimeError(f"Authorization: Bearer {api_key}")),
        arecall=AsyncMock(side_effect=RuntimeError(f"request failed (api_key={api_key})")),
    )
    service = HindsightService()
    monkeypatch.setattr(service, "_ensure_bank", AsyncMock(return_value=fake_client))

    async def exercise_operations():
        with pytest.raises(HindsightUnavailableError):
            await service.retain_meeting(
                contact_name="Rahul Sharma",
                company="ABC Technologies",
                content="API integration is being evaluated.",
            )
        with pytest.raises(HindsightUnavailableError):
            await service.recall("Rahul Sharma API integration")

    with caplog.at_level(logging.ERROR, logger="app.services.hindsight_service"):
        asyncio.run(exercise_operations())

    assert "Hindsight retain failed (RuntimeError)" in caplog.text
    assert "Hindsight recall failed (RuntimeError)" in caplog.text
    assert "[REDACTED]" in caplog.text
    assert api_key not in caplog.text
    fake_client.aretain.assert_awaited_once()
    assert fake_client.aretain.await_args.kwargs["bank_id"] == "meetingprep-ai"
    fake_client.arecall.assert_awaited_once_with(
        bank_id="meetingprep-ai",
        query="Rahul Sharma API integration",
    )


def test_hindsight_client_uses_configured_base_url_and_api_key(monkeypatch):
    api_key = "test-private-hindsight-key"
    monkeypatch.setattr(
        hindsight_service_module,
        "settings",
        SimpleNamespace(
            hindsight_base_url="https://api.hindsight.vectorize.io/",
            hindsight_api_key=api_key,
        ),
    )
    constructor = Mock(return_value=object())
    monkeypatch.setattr(hindsight_service_module, "Hindsight", constructor)

    service = HindsightService()
    client = service._get_client()

    assert client is constructor.return_value
    constructor.assert_called_once_with(
        base_url="https://api.hindsight.vectorize.io",
        api_key=api_key,
    )


def test_hindsight_404_creates_missing_bank(monkeypatch):
    class MissingBankError(Exception):
        status = 404

    monkeypatch.setattr(
        hindsight_service_module,
        "settings",
        SimpleNamespace(hindsight_bank_id="meetingprep-ai"),
    )
    fake_client = SimpleNamespace(
        aget_bank_config=AsyncMock(side_effect=[MissingBankError("not found"), {}]),
        acreate_bank=AsyncMock(),
    )
    service = HindsightService()
    monkeypatch.setattr(service, "_get_client", Mock(return_value=fake_client))

    async def initialize_bank():
        return await service._ensure_bank()

    assert asyncio.run(initialize_bank()) is fake_client
    fake_client.acreate_bank.assert_awaited_once_with(
        bank_id="meetingprep-ai",
        name="MeetingPrep AI",
    )
    assert fake_client.aget_bank_config.await_count == 1
    assert service._bank_ready
