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

# Agent Orchestration & Resource Policy

## 1. Persona Allocation
- **[ARCHITECT_PERSONA]**: Use `Gemini Pro` for high-level planning, ML pipeline design, and schema strategy.
- **[WORKER_PERSONA]**: Use `Qwen 2.5 Coder` for standard CRUD, API endpoints, and React component styling.
- **[AUDITOR_PERSONA]**: Use `DeepSeek R1` for debugging errors that persist after 2+ attempts.

## 2. Token Budgeting Guardrails
- **Default Rule:** Always prefer local `Qwen` or `Llama 3.2` for routine file edits to conserve cloud tokens.
- **Elevation Rule:** You are permitted to escalate to `Gemini Pro` only when:
    a) Designing a new module that crosses multiple directories.
    b) Resolving a logic error where the local model has failed to provide a valid fix twice.
    c) Writing complex mathematical expressions for the ML forecasting service.

## 3. Tool-Use Guardrails
- Before running any `docker-compose` or database migration command, the agent MUST output a "Pre-check" log detailing the expected impact.
- Agents are forbidden from modifying `/infrastructure` or `/deploy` configurations without a "Human-in-the-loop" approval step (manual trigger).