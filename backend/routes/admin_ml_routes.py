from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import get_db
from auth import require_admin
import models

router = APIRouter(prefix="/admin", tags=["admin-ml"])


@router.get("/anomaly-events")
def all_anomaly_events(
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return (
        db.query(models.AnomalyEvent)
        .order_by(desc(models.AnomalyEvent.timestamp))
        .limit(limit)
        .all()
    )


@router.get("/anomaly-timeline")
def anomaly_timeline(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    rows = (
        db.query(
            models.AnomalyEvent.timestamp,
            models.AnomalyEvent.anomaly_score,
            models.AnomalyEvent.trust_score_after,
            models.AnomalyEvent.reason,
            models.AnomalyEvent.user_id,
        )
        .order_by(models.AnomalyEvent.timestamp.asc())
        .limit(200)
        .all()
    )
    return [
        {
            "timestamp":        r.timestamp,
            "anomaly_score":    r.anomaly_score,
            "trust_score":      r.trust_score_after,
            "reason":           r.reason,
            "user_id":          r.user_id,
        }
        for r in rows
    ]


@router.get("/top-risky-users")
def top_risky_users(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    rows = (
        db.query(
            models.AnomalyEvent.user_id,
            func.count(models.AnomalyEvent.id).label("event_count"),
            func.avg(models.AnomalyEvent.anomaly_score).label("avg_score"),
            func.min(models.AnomalyEvent.trust_score_after).label("min_trust"),
        )
        .filter(models.AnomalyEvent.is_anomaly == True)
        .group_by(models.AnomalyEvent.user_id)
        .order_by(desc("avg_score"))
        .limit(10)
        .all()
    )
    return [
        {
            "user_id":     r.user_id,
            "event_count": r.event_count,
            "avg_score":   round(float(r.avg_score), 3),
            "min_trust":   round(float(r.min_trust), 1),
        }
        for r in rows
    ]


@router.get("/ml-stats")
def ml_stats(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    total   = db.query(func.count(models.AnomalyEvent.id)).scalar() or 0
    flagged = db.query(func.count(models.AnomalyEvent.id))\
                .filter(models.AnomalyEvent.is_anomaly == True).scalar() or 0
    avg_sc  = db.query(func.avg(models.AnomalyEvent.anomaly_score)).scalar()
    return {
        "total_events":    total,
        "flagged_anomalies": flagged,
        "flag_rate":       round(flagged / total, 3) if total else 0,
        "avg_anomaly_score": round(float(avg_sc), 3) if avg_sc else 0,
    }