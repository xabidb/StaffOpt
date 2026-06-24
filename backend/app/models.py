from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="Staff", nullable=False) # Admin, Manager, Staff
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    schedules: Mapped[List["Schedule"]] = relationship(back_populates="employee", cascade="all, delete-orphan")

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, unique=True, index=True, nullable=False)
    forecasted_footfall: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_footfall: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

class Schedule(Base):
    __tablename__ = "schedules"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shift_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    shift_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Draft", nullable=False) # Draft, Published
    
    employee: Mapped["User"] = relationship(back_populates="schedules")
