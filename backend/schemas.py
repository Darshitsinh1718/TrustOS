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

class GoogleAuthPayload(BaseModel):
    email: str
    username: Optional[str] = None
    uid: str

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


class MLSignal(BaseModel):
    login_hour: Optional[int] = 12
    transaction_amount: Optional[float] = 0.0
    typing_speed: Optional[float] = 55.0
    mouse_speed: Optional[float] = 45.0
    device_known: Optional[int] = 1
    location_known: Optional[int] = 1

class TransactionCreate(BaseModel):
    amount: float
    beneficiary: str
    # Optional IEEE-CIS style enrichment fields — all optional so the
    # existing simple flow (amount + beneficiary only) keeps working.
    card4: Optional[str] = None          # e.g. "visa", "mastercard"
    card6: Optional[str] = None          # e.g. "debit", "credit"
    ProductCD: Optional[str] = None
    P_emaildomain: Optional[str] = None
    R_emaildomain: Optional[str] = None
    DeviceType: Optional[str] = None
    DeviceInfo: Optional[str] = None

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


# ── IEEE-CIS fraud check schemas ────────────────────────────────
class FraudCheckRequest(BaseModel):
    TransactionAmt: float
    ProductCD:      Optional[str] = "unknown"
    card1:          Optional[float] = None
    card2:          Optional[float] = None
    card3:          Optional[float] = None
    card4:          Optional[str]   = "unknown"
    card5:          Optional[float] = None
    card6:          Optional[str]   = "unknown"
    addr1:          Optional[float] = None
    addr2:          Optional[float] = None
    P_emaildomain:  Optional[str] = "unknown"
    R_emaildomain:  Optional[str] = "unknown"
    DeviceType:     Optional[str] = "unknown"
    DeviceInfo:     Optional[str] = "unknown"
    # Demo override used by the frontend demo presets. When present, the
    # backend will return deterministic demo outputs instead of running
    # the trained model.
    demo_risk:      Optional[str] = None

class FraudCheckResponse(BaseModel):
    fraud_probability: float
    is_fraud:          bool
    risk_penalty:      int
    decision:          str
    reason:            str
    model_name:        str
    trust_score:       Optional[float] = None
    risk_level:        Optional[str]   = None
    session_status:    Optional[str]   = None

class ModelInfoResponse(BaseModel):
    available:         bool
    model_name:        str
    dataset_name:      Optional[str] = None
    feature_count:     Optional[int] = None
    trained_at:        Optional[str] = None
    train_rows:        Optional[int] = None
    test_rows:         Optional[int] = None
    fraud_rate:        Optional[float] = None
    metrics:           Optional[dict] = None
    selected_features: Optional[List[str]] = None
    message:           Optional[str] = None