import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = "trust_model.pkl"

# ── Synthetic normal behaviour training data ───────────────────
# Features: [login_hour, txn_amount, typing_speed, mouse_speed, device_known, location_known]
# Normal: business hours, moderate amounts, natural typing, known device + location

def _generate_training_data(n: int = 2000) -> np.ndarray:
    rng = np.random.default_rng(42)
    login_hour      = rng.choice(np.arange(8, 22), size=n)          # 8 AM – 10 PM
    txn_amount      = rng.normal(loc=15000, scale=8000, size=n).clip(100, 80000)
    typing_speed    = rng.normal(loc=55, scale=15, size=n).clip(10, 150)
    mouse_speed     = rng.normal(loc=45, scale=12, size=n).clip(5, 120)
    device_known    = rng.choice([1], size=n)                        # always known device
    location_known  = rng.choice([1], size=n)                        # always known location
    return np.column_stack([login_hour, txn_amount, typing_speed,
                            mouse_speed, device_known, location_known])


def train_and_save_model() -> IsolationForest:
    X = _generate_training_data()
    model = IsolationForest(
        n_estimators=200,
        max_samples="auto",
        contamination=0.05,   # expect ~5% anomalies
        random_state=42,
    )
    model.fit(X)
    joblib.dump(model, MODEL_PATH)
    return model


def _load_model() -> IsolationForest:
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return train_and_save_model()


_MODEL: IsolationForest = _load_model()


def detect_anomaly(features: dict) -> dict:
    """
    features keys:
        login_hour, transaction_amount, typing_speed,
        mouse_speed, device_known, location_known
    """
    vec = np.array([[
        features.get("login_hour",        12),
        features.get("transaction_amount", 0),
        features.get("typing_speed",      55),
        features.get("mouse_speed",       45),
        features.get("device_known",       1),
        features.get("location_known",     1),
    ]])

    raw_score  = _MODEL.decision_function(vec)[0]   # negative = more anomalous
    prediction = _MODEL.predict(vec)[0]             # -1 = anomaly, 1 = normal

    # Normalise to 0–1  (raw range ≈ -0.5 … +0.5)
    anomaly_score = float(np.clip(0.5 - raw_score, 0.0, 1.0))
    is_anomaly    = prediction == -1

    # Risk penalty fed into trust engine
    if anomaly_score >= 0.75:
        risk_penalty = 35
        reason       = "High-confidence anomaly: unusual login pattern detected"
    elif anomaly_score >= 0.55:
        risk_penalty = 20
        reason       = "Moderate anomaly: behaviour deviates from profile"
    elif anomaly_score >= 0.40:
        risk_penalty = 10
        reason       = "Low-level anomaly: minor behavioural deviation"
    else:
        risk_penalty = 0
        reason       = "Behaviour within normal profile"

    # Add human-readable context
    h = features.get("login_hour", 12)
    if h < 6 or h >= 23:
        reason = f"Anomalous login at {h:02d}:00 (off-hours). " + reason

    if features.get("transaction_amount", 0) > 75000:
        reason = "High-value transaction. " + reason

    if features.get("device_known", 1) == 0:
        reason = "Unrecognised device. " + reason

    if features.get("location_known", 1) == 0:
        reason = "Unrecognised location. " + reason

    return {
        "is_anomaly":    is_anomaly,
        "anomaly_score": round(anomaly_score, 4),
        "risk_penalty":  risk_penalty,
        "reason":        reason,
    }