from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, forecasts, schedules

app = FastAPI(
    title="Explorium StaffOpt API",
    description="Backend service for footfall forecasting and scheduling optimization.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configurations
origins = [
    "http://localhost:5173", # Vite local server
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under v1 API prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(forecasts.router, prefix="/api/v1")
app.include_router(schedules.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Explorium StaffOpt API. Visit /docs for Swagger documentation."}
