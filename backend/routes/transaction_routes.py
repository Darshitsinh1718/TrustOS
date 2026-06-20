from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas
import risk_engine
from fraud_model import predict_transaction_fraud, get_model_info

router = APIRouter(prefix="/transaction", tags=["transaction"])


def _map_to_ieee_payload(txn: schemas.TransactionCreate) -> dict:
    """Map the simple TrustOS transaction form into IEEE-CIS feature shape."""
    return {
        "TransactionAmt": float(txn.amount),
        "ProductCD":      txn.ProductCD or "W",
        "card4":          txn.card4 or "unknown",
        "card6":          txn.card6 or "unknown",
        "P_emaildomain":  txn.P_emaildomain or "unknown",
        "R_emaildomain":  txn.R_emaildomain or "unknown",
        "DeviceType":     txn.DeviceType or "unknown",
        "DeviceInfo":     txn.DeviceInfo or "unknown",
    }


@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(
    txn: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active",
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="No active session")
    if session.status == "frozen":
        raise HTTPException(status_code=403, detail="Session frozen due to high risk")

    # Run IEEE-CIS fraud model on this transaction
    ieee_payload = _map_to_ieee_payload(txn)
    ml_result    = risk_engine.apply_transaction_fraud_model(db, session.id, ieee_payload)

    decision = ml_result["decision"]
    if decision == "FREEZE_AND_ALERT":
        status = "blocked"
        risk_level = "HIGH"
    elif decision == "STEP_UP_OTP":
        status = "challenged"
        risk_level = "MEDIUM"
    else:
        status = "approved"
        risk_level = "LOW"

    new_txn = models.Transaction(
        session_id  = session.id,
        amount      = txn.amount,
        beneficiary = txn.beneficiary,
        status      = status,
        risk_level  = risk_level,
    )
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)
    return new_txn


@router.post("/fraud-check", response_model=schemas.FraudCheckResponse)
def fraud_check(
    payload: schemas.FraudCheckRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Standalone IEEE-CIS fraud check — does not create a Transaction row,
    but does affect the session trust score and can raise alerts."""
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active",
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    result = risk_engine.apply_transaction_fraud_model(db, session.id, payload.model_dump())
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.get("/model-info", response_model=schemas.ModelInfoResponse)
def model_info(current_user: models.User = Depends(get_current_user)):
    return get_model_info()


@router.get("/", response_model=list[schemas.TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sessions = db.query(models.Session).filter(
        models.Session.user_id == current_user.id
    ).all()
    session_ids = [s.id for s in sessions]
    return db.query(models.Transaction).filter(
        models.Transaction.session_id.in_(session_ids)
    ).order_by(models.Transaction.timestamp.desc()).limit(20).all()