"""Assistant chat endpoint delegated to the central agent."""

from fastapi import APIRouter

from app.models import ChatRequest, ChatResponse
from app.services.agent import agent

router = APIRouter(tags=["assistant"])


@router.post(
    "/assistant/chat",
    response_model=ChatResponse,
    response_model_exclude_none=True,
)
async def chat(request: ChatRequest) -> ChatResponse:
    return await agent.handle_message(request)
