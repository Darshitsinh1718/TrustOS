def detect_anomaly(features: dict) -> dict:
    """
    Mocked implementation due to Application Control policy blocking sklearn/numpy DLLs.
    """
    return {
        "is_anomaly": False,
        "anomaly_score": 0.1,
        "risk_penalty": 0,
        "reason": "Behaviour within normal profile (Mocked)"
    }