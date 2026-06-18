# AGENTS.md - Multi-Agent Execution Guardrails

## Workspace Scopes
- **Backend Worker Workspace:** `/backend`
- **Frontend Worker Workspace:** `/frontend`
- **Docker/Deployment Tasks:** Root directory (`/`) only

## Local Tech Stack & Verification Commands
- **Backend (FastAPI + Python):**
  - All database queries MUST use `AsyncSession`. Do not write synchronous database code.
  - Setup: `pip install -r requirements.txt`
  - Health Verification: `uvicorn main:app --reload --port 8000`
- **Frontend (React + TailwindCSS + Vite):**
  - Setup: `npm install`
  - Verification: `npm run dev`
- **Containerization (Docker Compose):**
  - Build & Test: `docker-compose up --build`

## Agentic Loop Workflow Constraints
1. **Isolated Execution:** When working on the backend, do not touch files inside `/frontend` (and vice-versa).
2. **Docker Isolation:** Do not write Dockerfiles until the individual backend and frontend local validation commands pass successfully.
3. **API Contracts:** Every new feature requires updating or verifying schemas in `backend/app/schemas.py` before building the corresponding React views.