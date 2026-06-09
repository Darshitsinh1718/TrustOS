# risk_engine.py
from sqlalchemy.orm import Session
from datetime import datetime
import models

# Score deltas per event type and condition
SCORE_RULES = {
    "keystroke_fast": (-3, "Unusually fast typing (bot-like)"),
    "keystroke_normal": (+1, "Normal typing pattern"),
    "swipe_normal": (+0.5, "Normal swipe pattern"),
    "swipe_anomaly": (-5, "Swipe velocity anomaly"),
    "idle_long": (-2, "Long idle period detected"),
    "new_device": (-15, "New device fingerprint"),
    "new_location": (-10, "New geographic location"),
    "vpn_detected": (-12, "VPN/proxy detected"),
    "transaction_large": (-8, "Transaction above 80% of daily limit"),
    "transaction_normal": (-1, "Normal transaction amount"),
    "multiple_failures": (-20, "Multiple authentication failures"),
}

def get_risk_level(score: float) -> str:
    if score >= 60:
        return "low"
    elif score >= 40:
        return "medium"
    else:
        return "high"

def get_intervention(score: float) -> str:
    if score >= 60:
        return "allow"
    elif score >= 40:
        return "challenge"   # trigger OTP
    else:
        return "freeze"

def apply_signal(db: Session, session_id: int, signal_key: str) -> dict:
    """Apply a named risk signal to a session and return updated state."""
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        return {"error": "Session not found"}

    delta, reason = SCORE_RULES.get(signal_key, (0, "Unknown signal"))
    new_score = max(0.0, min(100.0, session.trust_score + delta))

    # Record the event
    event = models.RiskEvent(
        session_id=session_id,
        event_type=signal_key,
        score_delta=delta,
        new_score=new_score,
        reason=reason,
        timestamp=datetime.utcnow()
    )
    db.add(event)

    # Update session score
    session.trust_score = new_score
    intervention = get_intervention(new_score)

    # Freeze session if score critical
    if intervention == "freeze" and session.status == "active":
        session.status = "frozen"
        alert = models.Alert(
            session_id=session_id,
            user_id=session.user_id,
            alert_type="SESSION_FROZEN",
            message=f"Session frozen. Trust score dropped to {new_score:.1f}. Trigger: {reason}",
        )
        db.add(alert)

    db.commit()
    db.refresh(session)

    return {
        "trust_score": new_score,
        "risk_level": get_risk_level(new_score),
        "intervention": intervention,
        "reason": reason,
        "delta": delta,
        "session_status": session.status,
    }

def calculate_transaction_risk(amount: float, trust_score: float, daily_limit: float = 100000) -> dict:
    ratio = amount / daily_limit
    signal = "transaction_large" if ratio > 0.8 else "transaction_normal"
    risk_level = get_risk_level(trust_score)
    intervention = get_intervention(trust_score)

    # High value + low trust = always block
    if amount > 50000 and trust_score < 50:
        intervention = "freeze"
        risk_level = "high"

    return {
        "signal": signal,
        "risk_level": risk_level,
        "intervention": intervention,
        "amount_ratio": ratio,
    }