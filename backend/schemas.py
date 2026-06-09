# schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SessionOut(BaseModel):
    id: int
    trust_score: float
    status: str
    created_at: datetime
    class Config: from_attributes = True

class BehaviorSignal(BaseModel):
    event_type: str       # keystroke | swipe | idle | new_device
    value: float          # numeric representation of the signal
    metadata: Optional[dict] = {}

class TransactionCreate(BaseModel):
    amount: float
    beneficiary: str

class TransactionOut(BaseModel):
    id: int
    amount: float
    beneficiary: str
    status: str
    risk_level: str
    timestamp: datetime
    class Config: from_attributes = True

class RiskEventOut(BaseModel):
    event_type: str
    score_delta: float
    new_score: float
    reason: str
    timestamp: datetime
    class Config: from_attributes = True

class AlertOut(BaseModel):
    id: int
    session_id: int
    user_id: int
    alert_type: str
    message: str
    resolved: bool
    timestamp: datetime
    class Config: from_attributes = True