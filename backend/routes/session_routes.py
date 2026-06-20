from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user

import models
import schemas
import risk_engine
import ml_model

router = APIRouter(prefix="/session", tags=["session"])


@router.post("/start", response_model=schemas.SessionOut)
def start_session(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active"
    ).first()

    if existing:
        existing.status = "closed"
        db.commit()

    new_session = models.Session(user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.get("/current", response_model=schemas.SessionOut)
def get_current_session(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active"
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    return session


@router.post("/signal")
def post_signal(
    signal: schemas.BehaviorSignal,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active"
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    return risk_engine.apply_signal(db, session.id, signal.event_type)


@router.post("/ml-signal")
def post_ml_signal(
    signal: schemas.MLSignal,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active"
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    ml_result = ml_model.detect_anomaly(signal.dict())
    penalty = ml_result.get("risk_penalty", 0)
    reason = ml_result.get("reason", "ML anomaly")

    new_score = risk_engine.apply_ml_penalty(
        db=db,
        session_id=session.id,
        penalty=penalty,
        reason=reason
    )

    # Map engine outputs to frontend-expected shape
    intervention = risk_engine.get_intervention(new_score)
    decision = "ALLOW" if intervention == "allow" else "OTP required" if intervention == "challenge" else "FREEZE"

    response = {
        "trust_score": float(new_score),
        "anomaly_score": float(ml_result.get("anomaly_score", 0.0)),
        "risk_level": risk_engine.get_risk_level(new_score),
        "risk_penalty": int(ml_result.get("risk_penalty", 0)),
        "decision": decision,
        "reason": ml_result.get("reason", reason),
    }

    return response


@router.get("/events", response_model=list[schemas.RiskEventOut])
def get_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id
    ).order_by(models.Session.created_at.desc()).first()

    if not session:
        return []

    return db.query(models.RiskEvent).filter(
        models.RiskEvent.session_id == session.id
    ).order_by(models.RiskEvent.timestamp.asc()).all()