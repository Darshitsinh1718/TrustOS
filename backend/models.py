from sqlalchemy import (Column, Integer, String, Float,
                        DateTime, Boolean, ForeignKey)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, index=True)
    email           = Column(String, unique=True)
    hashed_password = Column(String)
    role            = Column(String, default="user")
    sessions        = relationship("Session", back_populates="user")
    anomaly_events  = relationship("AnomalyEvent", back_populates="user")


class Session(Base):
    __tablename__ = "sessions"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    trust_score = Column(Float, default=85.0)
    status      = Column(String, default="active")
    created_at  = Column(DateTime, default=datetime.utcnow)
    user        = relationship("User", back_populates="sessions")
    events      = relationship("RiskEvent", back_populates="session")
    transactions = relationship("Transaction", back_populates="session")
    alerts      = relationship("Alert", back_populates="session")
    anomaly_events = relationship("AnomalyEvent", back_populates="session")


class RiskEvent(Base):
    __tablename__ = "risk_events"
    id          = Column(Integer, primary_key=True, index=True)
    session_id  = Column(Integer, ForeignKey("sessions.id"))
    event_type  = Column(String)
    score_delta = Column(Float)
    new_score   = Column(Float)
    reason      = Column(String)
    timestamp   = Column(DateTime, default=datetime.utcnow)
    session     = relationship("Session", back_populates="events")


class Transaction(Base):
    __tablename__ = "transactions"
    id          = Column(Integer, primary_key=True, index=True)
    session_id  = Column(Integer, ForeignKey("sessions.id"))
    amount      = Column(Float)
    beneficiary = Column(String)
    status      = Column(String, default="pending")
    risk_level  = Column(String)
    timestamp   = Column(DateTime, default=datetime.utcnow)
    session     = relationship("Session", back_populates="transactions")


class Alert(Base):
    __tablename__ = "alerts"
    id          = Column(Integer, primary_key=True, index=True)
    session_id  = Column(Integer, ForeignKey("sessions.id"))
    user_id     = Column(Integer, ForeignKey("users.id"))
    alert_type  = Column(String)
    message     = Column(String)
    resolved    = Column(Boolean, default=False)
    timestamp   = Column(DateTime, default=datetime.utcnow)
    session     = relationship("Session", back_populates="alerts")


# ── NEW: ML anomaly event ──────────────────────────────────────
class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"
    id                 = Column(Integer, primary_key=True, index=True)
    session_id         = Column(Integer, ForeignKey("sessions.id"))
    user_id            = Column(Integer, ForeignKey("users.id"))
    # input features
    login_hour         = Column(Integer)
    transaction_amount = Column(Float)
    typing_speed       = Column(Float)
    mouse_speed        = Column(Float)
    device_known       = Column(Integer)
    location_known     = Column(Integer)
    # ML output
    anomaly_score      = Column(Float)
    is_anomaly         = Column(Boolean)
    risk_penalty       = Column(Integer)
    reason             = Column(String)
    trust_score_after  = Column(Float)
    timestamp          = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="anomaly_events")
    user    = relationship("User",    back_populates="anomaly_events")