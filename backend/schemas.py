from pydantic import BaseModel
from typing import Optional
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

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    class Config: from_attributes = True

class SessionOut(BaseModel):
    id: int
    trust_score: float
    status: str
    created_at: datetime
    class Config: from_attributes = True

class BehaviorSignal(BaseModel):
    event_type: str
    value: float
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


# ── NEW: ML schemas ────────────────────────────────────────────
class MLSignalInput(BaseModel):
    login_hour:         int   = 12
    transaction_amount: float = 0.0
    typing_speed:       float = 55.0
    mouse_speed:        float = 45.0
    device_known:       int   = 1
    location_known:     int   = 1

class AnomalyEventOut(BaseModel):
    id:                 int
    session_id:         int
    user_id:            int
    login_hour:         int
    transaction_amount: float
    typing_speed:       float
    mouse_speed:        float
    device_known:       int
    location_known:     int
    anomaly_score:      float
    is_anomaly:         bool
    risk_penalty:       int
    reason:             str
    trust_score_after:  float
    timestamp:          datetime
    class Config: from_attributes = True