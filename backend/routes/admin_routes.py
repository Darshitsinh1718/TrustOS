# routes/admin_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import require_admin
import models, schemas

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/alerts", response_model=list[schemas.AlertOut])
def get_alerts(
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).limit(100).all()

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        alert.resolved = True
        db.commit()
    return {"status": "resolved"}

@router.get("/sessions")
def get_all_sessions(
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    sessions = db.query(models.Session).order_by(models.Session.created_at.desc()).limit(50).all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "trust_score": s.trust_score,
            "status": s.status,
            "created_at": s.created_at,
        }
        for s in sessions
    ]

@router.post("/sessions/{session_id}/unfreeze")
def unfreeze_session(
    session_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if session:
        session.status = "active"
        session.trust_score = 60.0   # reset to cautious baseline
        db.commit()
    return {"status": "unfrozen", "new_score": 60.0}

# Add this import at the top of admin_routes.py
from fraud_model import get_model_info as _ieee_model_info

# Add this route inside the existing router
@router.get("/model-info")
def admin_model_info(_=Depends(require_admin)):
    return _ieee_model_info()