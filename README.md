# Explorium StaffOpt - Architecture Overview

## Product Intent
StaffOpt is a web application for forecasting, planning and scheduling. It uses AI/ML to forecast visitor footfall, and then uses that forecast to create optimal schedules for staff. The application is intended to be used by businesses that have a need to manage staff schedules and optimize staff allocation.

## Key Features
1. **Forecasting:** Forecast visitor footfall using AI/ML models.
2. **Planning:** Suggest optimal staff head count based on forecasted footfall and other business constraints.
3. **Data Visualization:** User friendly data visualization and reporting.
4. **Auth & Permissions:** Authentication and role-based access control.
5. **Data Ingestion:** Secure and robust data ingestion mechanisms.

## Tech Stack
* **Frontend:** React and TailwindCSS.
* **Backend:** Python and FastAPI.
* **Database:** PostgreSQL (via SQLAlchemy async sessions).
* **ML/Forecasting:** Python and ML libraries and models for forecasting.

## Architectural Rules
1. **Decoupled Boundary:** The `/frontend` and `/backend` must remain completely separate. No mixed dependencies.
2. **Communication Protocol:** The frontend communicates with the backend exclusively via RESTful JSON APIs targeting `/api/v1/`.