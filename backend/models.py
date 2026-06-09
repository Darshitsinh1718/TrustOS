# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(String, default="user")   # "user" | "admin"
    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    trust_score = Column(Float, default=85.0)
    status = Column(String, default="active")   # active | frozen
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="sessions")
    events = relationship("RiskEvent", back_populates="session")

class RiskEvent(Base):
    __tablename__ = "risk_events"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    event_type = Column(String)    # "keystroke" | "transaction" | "location" | "device"
    score_delta = Column(Float)
    new_score = Column(Float)
    reason = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session = relationship("Session", back_populates="events")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    amount = Column(Float)
    beneficiary = Column(String)
    status = Column(String, default="pending")   # approved | challenged | blocked
    risk_level = Column(String)                  # low | medium | high
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    alert_type = Column(String)
    message = Column(String)
    resolved = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)