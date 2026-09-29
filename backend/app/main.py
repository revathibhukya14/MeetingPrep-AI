"""FastAPI application entry point."""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import RootResponse
from app.routers import assistant, contacts, health, meetings, memories
from app.services.hindsight_service import hindsight_service


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await hindsight_service.close()

app = FastAPI(
    title="MeetingPrep AI API",
    description="Backend foundation for MeetingPrep AI.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(meetings.router)
api_router.include_router(contacts.router)
api_router.include_router(memories.router)
api_router.include_router(assistant.router)
app.include_router(api_router)


@app.get("/", response_model=RootResponse, tags=["root"])
def root() -> RootResponse:
    return RootResponse(message="MeetingPrep AI backend is running")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.api_host, port=settings.api_port, reload=True)
