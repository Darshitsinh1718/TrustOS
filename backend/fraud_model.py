def predict_transaction_fraud(payload: dict) -> dict:
    demo_risk = payload.get("demo_risk", "normal")

    if demo_risk == "normal":
        return {
            "fraud_probability": 0.08,
            "is_fraud": False,
            "risk_penalty": 0,
            "decision": "ALLOW",
            "risk_level": "LOW",
            "trust_score": 100,
            "reason": "Normal trusted transaction pattern detected. (Mocked)",
            "model_name": "IEEE-CIS Random Forest + TrustOS Risk Layer"
        }

    if demo_risk == "medium":
        return {
            "fraud_probability": 0.42,
            "is_fraud": False,
            "risk_penalty": 15,
            "decision": "STEP_UP_OTP",
            "risk_level": "MEDIUM",
            "trust_score": 85,
            "reason": "Large transaction detected. Step-up verification recommended. (Mocked)",
            "model_name": "IEEE-CIS Random Forest + TrustOS Risk Layer"
        }

    if demo_risk == "high":
        return {
            "fraud_probability": 0.68,
            "is_fraud": True,
            "risk_penalty": 25,
            "decision": "STEP_UP_OTP",
            "risk_level": "HIGH",
            "trust_score": 65,
            "reason": "Unknown device and unusual profile detected. (Mocked)",
            "model_name": "IEEE-CIS Random Forest + TrustOS Risk Layer"
        }

    if demo_risk == "critical":
        return {
            "fraud_probability": 0.88,
            "is_fraud": True,
            "risk_penalty": 35,
            "decision": "FREEZE_AND_ALERT",
            "risk_level": "CRITICAL",
            "trust_score": 50,
            "reason": "High-risk transaction pattern detected. Session frozen and admin alert generated. (Mocked)",
            "model_name": "IEEE-CIS Random Forest + TrustOS Risk Layer"
        }

    return {
        "fraud_probability": 0.08,
        "is_fraud": False,
        "risk_penalty": 0,
        "decision": "ALLOW",
        "risk_level": "LOW",
        "trust_score": 100,
        "reason": "Normal trusted transaction pattern detected. (Mocked)",
        "model_name": "IEEE-CIS Random Forest + TrustOS Risk Layer"
    }

def get_model_info() -> dict:
    return {
        "available": True,
        "model_name": "Mocked Model",
        "dataset_name": "IEEE-CIS Fraud Detection",
        "feature_count": 0,
        "trained_at": "N/A",
        "train_rows": 0,
        "test_rows": 0,
        "fraud_rate": 0.0,
        "metrics": {
            "accuracy": 1.0,
            "precision": 1.0,
            "recall": 1.0,
            "f1_score": 1.0,
            "roc_auc": 1.0,
        },
        "selected_features": [],
    }