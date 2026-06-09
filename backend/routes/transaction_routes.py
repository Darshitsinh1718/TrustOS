# routes/transaction_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas, risk_engine

router = APIRouter(prefix="/transaction", tags=["transaction"])

@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(
    txn: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.Session).filter(
        models.Session.user_id == current_user.id,
        models.Session.status == "active"
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="No active session")
    if session.status == "frozen":
        raise HTTPException(status_code=403, detail="Session frozen due to high risk")

    txn_risk = risk_engine.calculate_transaction_risk(txn.amount, session.trust_score)
    risk_engine.apply_signal(db, session.id, txn_risk["signal"])

    # Determine transaction status
    intervention = txn_risk["intervention"]
    if intervention == "freeze":
        status = "blocked"
    elif intervention == "challenge":
        status = "challenged"
    else:
        status = "approved"

    new_txn = models.Transaction(
        session_id=session.id,
        amount=txn.amount,
        beneficiary=txn.beneficiary,
        status=status,
        risk_level=txn_risk["risk_level"]
    )
    db.add(new_txn)

    if status == "blocked":
        alert = models.Alert(
            session_id=session.id,
            user_id=current_user.id,
            alert_type="TRANSACTION_BLOCKED",
            message=f"Transaction of ₹{txn.amount} to {txn.beneficiary} blocked. Risk: {txn_risk['risk_level']}",
        )
        db.add(alert)

    db.commit()
    db.refresh(new_txn)
    return new_txn

@router.get("/", response_model=list[schemas.TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sessions = db.query(models.Session).filter(
        models.Session.user_id == current_user.id
    ).all()
    session_ids = [s.id for s in sessions]
    return db.query(models.Transaction).filter(
        models.Transaction.session_id.in_(session_ids)
    ).order_by(models.Transaction.timestamp.desc()).limit(20).all()