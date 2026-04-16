# backend/models/agent.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class AgentRole(str, enum.Enum):
    AGENT      = "AGENT"
    MANAGER    = "MANAGER"
    COMPLIANCE = "COMPLIANCE"


class Agent(Base):
    __tablename__ = "agents"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), nullable=False)
    email        = Column(String(200), unique=True, index=True, nullable=False)
    password_plain = Column(String(100), nullable=False)  # demo only — use hashed in production
    role         = Column(SAEnum(AgentRole), default=AgentRole.AGENT)
    team         = Column(String(100))
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    complaints = relationship("Complaint", back_populates="assigned_agent")
