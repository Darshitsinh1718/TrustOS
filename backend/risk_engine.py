from sqlalchemy.orm import Session as DBSession
from datetime import datetime
import models
from fraud_model import predict_transaction_fraud

SCORE_RULES = {
    "keystroke_fast":    (-3,  "Unusually fast typing (bot-like)"),
    "keystroke_normal":  (+1,  "Normal typing pattern"),
    "swipe_normal":      (+0.5,"Normal swipe pattern"),
    "swipe_anomaly":     (-5,  "Swipe velocity anomaly"),
    "idle_long":         (-2,  "Long idle period detected"),
    "new_device":        (-15, "New device fingerprint"),
    "new_location":      (-10, "New geographic location"),
    "vpn_detected":      (-12, "VPN/proxy detected"),
    "transaction_large": (-8,  "Transaction above 80% of daily limit"),
    "transaction_normal":(-1,  "Normal transaction amount"),
    "multiple_failures": (-20, "Multiple authentication failures"),
}


def get_risk_level(score: float) -> str:
    if score >= 75:
        return "LOW"
    elif score >= 45:
        return "MEDIUM"
    else:
        return "HIGH"


def get_intervention(score: float) -> str:
    if score >= 75:
        return "allow"
    elif score >= 45:
        return "challenge"
    else:
        return "freeze"


def apply_signal(db: DBSession, session_id: int, signal_key: str) -> dict:
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        return {"error": "Session not found"}

    delta, reason = SCORE_RULES.get(signal_key, (0, "Unknown signal"))
    new_score     = max(0.0, min(100.0, session.trust_score + delta))

    event = models.RiskEvent(
        session_id  = session_id,
        event_type  = signal_key,
        score_delta = float(delta),
        new_score   = float(new_score),
        reason      = reason,
        timestamp   = datetime.utcnow(),
    )
    db.add(event)

    session.trust_score = new_score
    intervention        = get_intervention(new_score)

    if intervention == "freeze" and session.status == "active":
        session.status = "frozen"
        alert = models.Alert(
            session_id = session_id,
            user_id    = session.user_id,
            alert_type = "SESSION_FROZEN",
            message    = f"Session frozen. Trust score dropped to {new_score:.1f}. Trigger: {reason}",
        )
        db.add(alert)

    db.commit()
    db.refresh(session)

    return {
        "trust_score":    float(new_score),
        "risk_level":     get_risk_level(new_score),
        "intervention":   intervention,
        "reason":         reason,
        "delta":          float(delta),
        "session_status": session.status,
    }


def apply_transaction_fraud_model(db: DBSession, session_id: int, transaction_payload: dict) -> dict:
    """
    Runs the IEEE-CIS fraud model on a transaction payload, applies the
    resulting penalty to the session trust score, logs a RiskEvent, and
    raises an Alert + freezes the session if the decision is FREEZE_AND_ALERT.

    Returns a fully JSON-safe dict combining the ML result with the
    updated session state.
    """
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        return {"error": "Session not found"}

    ml_result = predict_transaction_fraud(transaction_payload)

    penalty   = int(ml_result["risk_penalty"])
    new_score = max(0.0, min(100.0, session.trust_score - penalty))
    session.trust_score = new_score

    # Log a risk event for the timeline/explainability panel
    risk_event = models.RiskEvent(
        session_id  = session_id,
        event_type  = "ml_fraud_check",
        score_delta = float(-penalty),
        new_score   = float(new_score),
        reason      = ml_result["reason"],
        timestamp   = datetime.utcnow(),
    )
    db.add(risk_event)

    # Sync session status with ML decision
    decision = ml_result["decision"]
    if decision == "FREEZE_AND_ALERT" and session.status == "active":
        session.status = "frozen"
        alert = models.Alert(
            session_id = session_id,
            user_id    = session.user_id,
            alert_type = "ML_FRAUD_DETECTED",
            message    = (
                f"IEEE-CIS model flagged transaction "
                f"(probability {ml_result['fraud_probability']*100:.1f}%). {ml_result['reason']}"
            ),
        )
        db.add(alert)

    db.commit()
    db.refresh(session)

    return {
        "fraud_probability": float(ml_result["fraud_probability"]),
        "is_fraud":          bool(ml_result["is_fraud"]),
        "risk_penalty":      int(penalty),
        "decision":          str(decision),
        "reason":            str(ml_result["reason"]),
        "model_name":        str(ml_result["model_name"]),
        "trust_score":       float(new_score),
        "risk_level":        get_risk_level(new_score),
        "session_status":    session.status,
    }


def calculate_transaction_risk(amount: float, trust_score: float,
                                daily_limit: float = 100000) -> dict:
    ratio    = amount / daily_limit
    signal   = "transaction_large" if ratio > 0.8 else "transaction_normal"
    risk     = get_risk_level(trust_score)
    decision = get_intervention(trust_score)

    if amount > 50000 and trust_score < 50:
        decision = "freeze"
        risk     = "HIGH"

    return {
        "signal":       signal,
        "risk_level":   risk,
        "intervention": decision,
        "amount_ratio": float(ratio),
    }