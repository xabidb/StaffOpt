from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "Staff"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Token Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Forecast Schemas
class ForecastBase(BaseModel):
    date: date
    forecasted_footfall: int
    actual_footfall: Optional[int] = None

class ForecastCreate(ForecastBase):
    pass

class ForecastUpdate(BaseModel):
    forecasted_footfall: Optional[int] = None
    actual_footfall: Optional[int] = None

class ForecastResponse(ForecastBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schedule Schemas
class ScheduleBase(BaseModel):
    user_id: int
    shift_start: datetime
    shift_end: datetime
    role: str
    status: str = "Draft"

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    user_id: Optional[int] = None
    shift_start: Optional[datetime] = None
    shift_end: Optional[datetime] = None
    role: Optional[str] = None
    status: Optional[str] = None

class ScheduleResponse(ScheduleBase):
    id: int
    employee: Optional[UserResponse] = None

    class Config:
        from_attributes = True
