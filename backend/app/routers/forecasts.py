from datetime import date, timedelta
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Forecast
from ..schemas import ForecastCreate, ForecastResponse
from ..auth_utils import get_current_user, RoleChecker

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

@router.get("/", response_model=List[ForecastResponse])
async def get_forecasts(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Forecast)
    if start_date:
        query = query.where(Forecast.date >= start_date)
    if end_date:
        query = query.where(Forecast.date <= end_date)
    
    query = query.order_by(Forecast.date.asc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ForecastResponse, status_code=status.HTTP_201_CREATED)
async def create_forecast_entry(
    forecast_in: ForecastCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Manager"]))
):
    # Check if entry already exists for this date
    result = await db.execute(select(Forecast).where(Forecast.date == forecast_in.date))
    existing = result.scalars().first()
    if existing:
        existing.forecasted_footfall = forecast_in.forecasted_footfall
        if forecast_in.actual_footfall is not None:
            existing.actual_footfall = forecast_in.actual_footfall
        await db.flush()
        return existing
        
    db_forecast = Forecast(
        date=forecast_in.date,
        forecasted_footfall=forecast_in.forecasted_footfall,
        actual_footfall=forecast_in.actual_footfall
    )
    db.add(db_forecast)
    await db.flush()
    return db_forecast

@router.post("/generate", response_model=List[ForecastResponse])
async def generate_mock_forecasts(
    days: int = 14,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Manager"]))
):
    """
    Generates footfall forecast data for the next N days.
    Provides mock time-series data modeling typical retail/visitor traffic with weekend peaks.
    """
    generated_entries = []
    base_date = date.today()
    
    # We will generate data from 7 days ago to (days) days into the future
    start_offset = -7
    for i in range(start_offset, days):
        target_date = base_date + timedelta(days=i)
        
        # Check if already exists
        result = await db.execute(select(Forecast).where(Forecast.date == target_date))
        existing = result.scalars().first()
        
        # Modeling footfall: weekends have higher traffic
        day_of_week = target_date.weekday() # 0 = Monday, 6 = Sunday
        if day_of_week >= 5: # Saturday/Sunday
            base_footfall = 350
            random_variance = random.randint(-50, 80)
        else:
            base_footfall = 180
            random_variance = random.randint(-30, 40)
            
        forecasted = base_footfall + random_variance
        
        # Actual footfall is only available for past or current days
        actual = None
        if target_date <= base_date:
            actual = int(forecasted * random.uniform(0.85, 1.15))
            
        if existing:
            existing.forecasted_footfall = forecasted
            existing.actual_footfall = actual
            generated_entries.append(existing)
        else:
            db_forecast = Forecast(
                date=target_date,
                forecasted_footfall=forecasted,
                actual_footfall=actual
            )
            db.add(db_forecast)
            generated_entries.append(db_forecast)
            
    await db.flush()
    return generated_entries
