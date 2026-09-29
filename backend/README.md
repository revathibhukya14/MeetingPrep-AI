# MeetingPrep AI Backend

FastAPI backend for MeetingPrep AI, a memory-powered meeting preparation assistant. Hindsight stores and recalls meeting context; the Groq service creates a structured brief from the meeting and retrieved memories. No database, authentication, or calendar integration is used.

## Architecture

```text
React + Vite
    ↓
FastAPI
    ↓
Meeting Agent ─────→ Hindsight Retain / Recall → Memory Bank
    ↓
Groq LLM
    ↓
Personalized meeting preparation
```

Meeting interaction → FastAPI → Hindsight Retain → Memory Bank → Hindsight Recall → relevant memories → LLM → preparation.

## Setup

From the repository root in PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set real `HINDSIGHT_API_KEY` and `GROQ_API_KEY` values only in `backend/.env`. Never commit that file. The checked-in example contains placeholders only.

| Variable | Purpose | Default |
| --- | --- | --- |
| `FRONTEND_URL` | Comma-separated allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `API_HOST` | Uvicorn bind address | `127.0.0.1` |
| `API_PORT` | Uvicorn port | `8000` |
| `HINDSIGHT_BASE_URL` | Hindsight API URL | `https://api.hindsight.vectorize.io` |
| `HINDSIGHT_API_KEY` | Hindsight credential | unset |
| `HINDSIGHT_BANK_ID` | Hindsight bank | `meetingprep-ai` |
| `LLM_PROVIDER` | LLM provider | `groq` |
| `GROQ_API_KEY` | Groq credential | unset |
| `LLM_MODEL` | Groq model | `llama-3.3-70b-versatile` |

## Run

```powershell
python -m app.main
```

The Vite frontend is started from the repository root with `npm run dev`. Vite proxies `/api` to `http://127.0.0.1:8000` during development. API documentation is available at `http://127.0.0.1:8000/docs` and OpenAPI JSON at `/openapi.json`.

## Endpoints

- `GET /` and `GET /api/health`
- `GET /api/meetings` and `GET /api/contacts`
- `GET /api/memories`, `POST /api/memories`, `GET /api/memories/search?q=...`, `GET /api/memories/status`
- `POST /api/meetings/{meeting_id}/prepare`
- `POST /api/meetings/{meeting_id}/outcome`
- `POST /api/assistant/chat`

The status route returns `status: unavailable` when Hindsight is not configured or reachable. Memory and preparation operations return a sanitized `503` when their external provider is unavailable. `/` and `/api/health` remain available.

## Try the demo

Store a conversation:

```powershell
$body = @{
  contact_name = "Rahul Sharma"
  company = "ABC Technologies"
  role = "CTO"
  content = "Rahul is evaluating API integration. His team has strict security requirements. We promised to send API documentation before the next meeting. The technical demo is still pending."
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/memories -ContentType "application/json" -Body $body
```

List or recall stored information:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/memories
Invoke-RestMethod "http://127.0.0.1:8000/api/memories/search?q=Rahul%20API%20security"
```

Prepare a meeting and record what happened afterward:

```powershell
$prepare = @{ message = "Prepare me for this meeting" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/meetings/meet-abc-today/prepare -ContentType "application/json" -Body $prepare

$outcome = @{ summary = "Rahul requested OAuth documentation and a security architecture review. We agreed to schedule a technical demo next week." } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/meetings/meet-abc-today/outcome -ContentType "application/json" -Body $outcome
```

`POST /api/assistant/chat` accepts `{"message":"Prepare me for my meeting with Rahul","conversation_id":"demo-session"}`. The optional conversation ID carries lightweight context across turns. The rule-first agent handles general conversation, meeting lists (without a Hindsight call), memory recall, meeting preparation, and storing useful updates. Ambiguous requests use the configured LLM classifier when available. Unknown contacts prompt for a company, and provider failures return natural-language messages rather than false success.

Example chat requests include `hello`, `check my meeting list`, `what do I remember about Rahul?`, `prepare me for Rahul tomorrow`, and `Rahul requested OAuth documentation`. Meeting-list requests use the in-memory demo meetings. Recall and storage use Hindsight; meeting preparation additionally uses Groq. Greetings and list requests do not call Hindsight.

## Tests

```powershell
python -m pytest -q
```

Tests mock Hindsight and the meeting agent, so they do not need external credentials.
