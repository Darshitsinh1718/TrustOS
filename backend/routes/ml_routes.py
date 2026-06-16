from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from auth import get_current_user
import models, schemas
from ml_model import detect_anomaly
from risk_engine import get_risk_level, get_intervention

router = APIRouter(prefix="/session", tags=["ml"])


@router.post("/ml-signal")
def ml_signal(
    payload: schemas.MLSignalInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Resolve active session
    session = (
        db.query(models.Session)
        .filter(
            models.Session.user_id == current_user.id,
            models.Session.status == "active",
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    # ML inference
    features = payload.model_dump()
    result   = detect_anomaly(features)

    # Apply penalty to trust score
    new_score = max(0.0, min(100.0, session.trust_score - result["risk_penalty"]))
    session.trust_score = new_score

    # Freeze if critical
    intervention = get_intervention(new_score)
    if intervention == "freeze" and session.status == "active":
        session.status = "frozen"

    # Persist anomaly event
    event = models.AnomalyEvent(
        session_id      = session.id,
        user_id         = current_user.id,
        login_hour      = payload.login_hour,
        transaction_amount = payload.transaction_amount,
        typing_speed    = payload.typing_speed,
        mouse_speed     = payload.mouse_speed,
        device_known    = payload.device_known,
        location_known  = payload.location_known,
        anomaly_score   = result["anomaly_score"],
        is_anomaly      = result["is_anomaly"],
        risk_penalty    = result["risk_penalty"],
        reason          = result["reason"],
        trust_score_after = new_score,
        timestamp       = datetime.utcnow(),
    )
    db.add(event)

    # Fraud alert if high risk
    if result["is_anomaly"] and new_score < 60:
        alert = models.Alert(
            session_id  = session.id,
            user_id     = current_user.id,
            alert_type  = "ML_ANOMALY",
            message     = f"ML anomaly detected (score {result['anomaly_score']:.2f}). {result['reason']}",
        )
        db.add(alert)

    db.commit()
    db.refresh(session)

    return {
        "trust_score":   round(new_score, 1),
        "risk_level":    get_risk_level(new_score),
        "decision":      intervention.upper().replace("freeze", "FREEZE_AND_ALERT")
                                              .replace("challenge", "STEP_UP_OTP")
                                              .replace("allow", "ALLOW"),
        "anomaly_score": result["anomaly_score"],
        "is_anomaly":    result["is_anomaly"],
        "risk_penalty":  result["risk_penalty"],
        "reason":        result["reason"],
    }


@router.get("/anomaly-events")
def get_anomaly_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    events = (
        db.query(models.AnomalyEvent)
        .filter(models.AnomalyEvent.user_id == current_user.id)
        .order_by(models.AnomalyEvent.timestamp.desc())
        .limit(50)
        .all()
    )
    return events