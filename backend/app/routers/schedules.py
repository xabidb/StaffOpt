from datetime import datetime, date, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import Schedule, User, Forecast
from ..schemas import ScheduleCreate, ScheduleResponse, ScheduleUpdate
from ..auth_utils import get_current_user, RoleChecker

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.get("/", response_model=List[ScheduleResponse])
async def get_schedules(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Schedule).options(selectinload(Schedule.employee))
    
    if user_id:
        # Regular staff can only see their own schedules (unless they are Manager/Admin)
        if current_user.role not in ["Admin", "Manager"] and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view other employees' schedules"
            )
        query = query.where(Schedule.user_id == user_id)
    else:
        # If user is staff, enforce seeing only their own schedules by default
        if current_user.role not in ["Admin", "Manager"]:
            query = query.where(Schedule.user_id == current_user.id)
            
    if start_date:
        query = query.where(Schedule.shift_start >= start_date)
    if end_date:
        query = query.where(Schedule.shift_end <= end_date)
        
    query = query.order_by(Schedule.shift_start.asc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    schedule_in: ScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Manager"]))
):
    # Verify user exists
    user_res = await db.execute(select(User).where(User.id == schedule_in.user_id))
    if not user_res.scalars().first():
        raise HTTPException(status_code=404, detail="Employee not found")
        
    db_schedule = Schedule(
        user_id=schedule_in.user_id,
        shift_start=schedule_in.shift_start,
        shift_end=schedule_in.shift_end,
        role=schedule_in.role,
        status=schedule_in.status
    )
    db.add(db_schedule)
    await db.flush()
    
    # Load relationship for response
    result = await db.execute(
        select(Schedule).options(selectinload(Schedule.employee)).where(Schedule.id == db_schedule.id)
    )
    return result.scalars().first()

@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: int,
    schedule_in: ScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Manager"]))
):
    result = await db.execute(
        select(Schedule).options(selectinload(Schedule.employee)).where(Schedule.id == schedule_id)
    )
    db_schedule = result.scalars().first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    if schedule_in.user_id is not None:
        db_schedule.user_id = schedule_in.user_id
    if schedule_in.shift_start is not None:
        db_schedule.shift_start = schedule_in.shift_start
    if schedule_in.shift_end is not None:
        db_schedule.shift_end = schedule_in.shift_end
    if schedule_in.role is not None:
        db_schedule.role = schedule_in.role
    if schedule_in.status is not None:
        db_schedule.status = schedule_in.status
        
    await db.flush()
    return db_schedule

@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Manager"]))
):
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
    db_schedule = result.scalars().first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    await db.delete(db_schedule)
    return None

@router.post("/optimize", response_model=List[ScheduleResponse])
async def optimize_schedule(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin", "Manager"]))
):
    """
    Auto-scheduling optimizer. Reads visitor footfall forecasts, determines staffing requirements
    (e.g., 1 staff member per 40 forecasted visitors), and assigns shifts to available employees.
    All auto-generated schedules are created in 'Draft' state.
    """
    # Fetch forecasts for the range
    f_res = await db.execute(
        select(Forecast).where(Forecast.date >= start_date, Forecast.date <= end_date)
    )
    forecasts = f_res.scalars().all()
    if not forecasts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No footfall forecasts available for the specified date range. Generate forecasts first."
        )
        
    # Fetch active employees
    u_res = await db.execute(select(User).where(User.is_active == True, User.role != "Admin"))
    employees = u_res.scalars().all()
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active employees available to schedule."
        )
        
    generated_schedules = []
    
    # We will loop over each forecasted day and assign shifts
    for f in forecasts:
        # Determine number of staff needed based on footfall
        # 1 employee per 50 footfall, minimum of 1
        staff_needed = max(1, round(f.forecasted_footfall / 50))
        
        # Clear existing drafts for this day to prevent duplicates
        day_start = datetime.combine(f.date, time.min)
        day_end = datetime.combine(f.date, time.max)
        existing_drafts_res = await db.execute(
            select(Schedule).where(
                Schedule.shift_start >= day_start,
                Schedule.shift_end <= day_end,
                Schedule.status == "Draft"
            )
        )
        for old_draft in existing_drafts_res.scalars().all():
            await db.delete(old_draft)
            
        # Assign shifts
        for idx in range(staff_needed):
            # Rotate through employees
            emp = employees[(f.date.day + idx) % len(employees)]
            
            # Simple shift schedules: Morning shift (9-17) and Evening shift (13-21) alternating
            if idx % 2 == 0:
                shift_start = datetime.combine(f.date, time(9, 0))
                shift_end = datetime.combine(f.date, time(17, 0))
                role_assigned = "Sales Associate"
            else:
                shift_start = datetime.combine(f.date, time(13, 0))
                shift_end = datetime.combine(f.date, time(21, 0))
                role_assigned = "Shift Lead"
                
            db_schedule = Schedule(
                user_id=emp.id,
                shift_start=shift_start,
                shift_end=shift_end,
                role=role_assigned,
                status="Draft"
            )
            db.add(db_schedule)
            generated_schedules.append(db_schedule)
            
    await db.flush()
    
    # Eager load employees for response
    ids = [s.id for s in generated_schedules]
    if not ids:
        return []
        
    final_res = await db.execute(
        select(Schedule).options(selectinload(Schedule.employee)).where(Schedule.id.in_(ids))
    )
    return final_res.scalars().all()
