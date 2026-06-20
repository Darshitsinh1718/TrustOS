"""
TrustOS — IEEE-CIS Fraud Detection model trainer.

Run locally (NOT on Railway — dataset is large and training is heavy):
    python train_ieee_model.py

Expects train_transaction.csv and train_identity.csv in the same folder,
or pass paths via CLI args:
    python train_ieee_model.py --txn path/to/train_transaction.csv --identity path/to/train_identity.csv

Outputs:
    backend/models/ieee_fraud_model.pkl
    backend/models/ieee_model_metadata.json
"""

import argparse
import json
import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

MODEL_DIR  = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "ieee_fraud_model.pkl")
META_PATH  = os.path.join(MODEL_DIR, "ieee_model_metadata.json")

# ── Candidate feature list (per spec) ──────────────────────────
NUMERIC_CANDIDATES = [
    "TransactionAmt",
    "card1", "card2", "card3", "card5",
    "addr1", "addr2",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3",
    "V1", "V2", "V3", "V4", "V5",
    "id_01", "id_02", "id_05", "id_06",
]

CATEGORICAL_CANDIDATES = [
    "ProductCD",
    "card4", "card6",
    "P_emaildomain", "R_emaildomain",
    "DeviceType", "DeviceInfo",
]

TARGET = "isFraud"
ID_COL = "TransactionID"


def load_data(txn_path: str, identity_path: str) -> pd.DataFrame:
    # Resolve paths: allow relative paths, script dir, cwd, or data/ subfolder
    script_dir = os.path.dirname(__file__)

    def _resolve(path: str):
        if not path:
            return None
        if os.path.isabs(path) and os.path.exists(path):
            return path
        candidates = [
            path,
            os.path.join(script_dir, path),
            os.path.join(os.getcwd(), path),
            os.path.join(script_dir, "data", path),
            os.path.join(os.getcwd(), "data", path),
        ]
        for p in candidates:
            if os.path.exists(p):
                return p
        return None

    txn_resolved = _resolve(txn_path)
    if not txn_resolved:
        raise FileNotFoundError(
            f"Transaction file not found: {txn_path}.\n"
            "Please download 'train_transaction.csv' from the IEEE-CIS Kaggle dataset "
            "and place it in the backend folder, or pass its path with --txn."
        )

    print(f"Loading transactions from {txn_resolved} ...")
    txn = pd.read_csv(txn_resolved)
    print(f"  -> {txn.shape[0]:,} rows, {txn.shape[1]} cols")

    identity_resolved = _resolve(identity_path)
    if identity_resolved:
        print(f"Loading identity from {identity_resolved} ...")
        identity = pd.read_csv(identity_resolved)
        print(f"  -> {identity.shape[0]:,} rows, {identity.shape[1]} cols")
        df = txn.merge(identity, how="left", on=ID_COL)
        print(f"Merged on {ID_COL}: {df.shape[0]:,} rows, {df.shape[1]} cols")
    else:
        print("No identity file found — proceeding with transaction data only.")
        df = txn

    return df


def select_available_features(df: pd.DataFrame):
    """Only keep candidate columns that actually exist in this dataset."""
    numeric = [c for c in NUMERIC_CANDIDATES if c in df.columns]
    categorical = [c for c in CATEGORICAL_CANDIDATES if c in df.columns]

    missing_num = [c for c in NUMERIC_CANDIDATES if c not in df.columns]
    missing_cat = [c for c in CATEGORICAL_CANDIDATES if c not in df.columns]
    if missing_num:
        print(f"Skipping missing numeric columns: {missing_num}")
    if missing_cat:
        print(f"Skipping missing categorical columns: {missing_cat}")

    if not numeric and not categorical:
        raise ValueError("None of the expected feature columns were found in the dataset.")

    return numeric, categorical


def build_pipeline(numeric_features, categorical_features) -> Pipeline:
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler",  StandardScaler()),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="unknown")),
        ("onehot",  OneHotEncoder(handle_unknown="ignore", max_categories=30)),
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features),
    ])

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=14,
        min_samples_leaf=5,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier",   model),
    ])
    return pipeline


def evaluate(pipeline, X_test, y_test) -> dict:
    y_pred  = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy":  round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall":    round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score":  round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc":   round(roc_auc_score(y_test, y_proba), 4),
    }

    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "=" * 50)
    print("MODEL EVALUATION")
    print("=" * 50)
    print(f"Accuracy:  {metrics['accuracy']}")
    print(f"Precision: {metrics['precision']}")
    print(f"Recall:    {metrics['recall']}")
    print(f"F1-score:  {metrics['f1_score']}")
    print(f"ROC-AUC:   {metrics['roc_auc']}")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    metrics["confusion_matrix"] = cm.tolist()
    return metrics


def main(txn_path: str, identity_path: str, sample_size: int = None):
    df = load_data(txn_path, identity_path)

    if TARGET not in df.columns:
        raise ValueError(f"Target column '{TARGET}' not found in dataset.")

    # Optional downsampling for hackathon speed (full set is 590k+ rows)
    if sample_size and len(df) > sample_size:
        print(f"Sampling {sample_size:,} rows from {len(df):,} for faster training...")
        fraud = df[df[TARGET] == 1]
        clean = df[df[TARGET] == 0].sample(
            n=min(sample_size - len(fraud), len(df) - len(fraud)),
            random_state=42,
        )
        df = pd.concat([fraud, clean]).sample(frac=1, random_state=42).reset_index(drop=True)
        print(f"  -> sampled to {len(df):,} rows ({df[TARGET].sum()} fraud)")

    numeric_features, categorical_features = select_available_features(df)
    selected_features = numeric_features + categorical_features
    print(f"\nUsing {len(selected_features)} features:")
    print(f"  Numeric:     {numeric_features}")
    print(f"  Categorical: {categorical_features}")

    X = df[selected_features].copy()
    y = df[TARGET].astype(int)

    # Cast categoricals to string to avoid mixed-type OHE issues
    for c in categorical_features:
        X[c] = X[c].astype(str)

    print(f"\nClass balance — fraud: {y.sum()} ({y.mean()*100:.2f}%), clean: {(y==0).sum()}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42,
    )
    print(f"Train: {X_train.shape[0]:,} rows | Test: {X_test.shape[0]:,} rows")

    pipeline = build_pipeline(numeric_features, categorical_features)

    print("\nTraining RandomForestClassifier...")
    pipeline.fit(X_train, y_train)
    print("Training complete.")

    metrics = evaluate(pipeline, X_test, y_test)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")

    metadata = {
        "dataset_name":       "IEEE-CIS Fraud Detection",
        "model_name":         "RandomForestClassifier",
        "feature_count":      len(selected_features),
        "selected_features":  selected_features,
        "numeric_features":   numeric_features,
        "categorical_features": categorical_features,
        "trained_at":         datetime.now(timezone.utc).isoformat(),
        "train_rows":         int(X_train.shape[0]),
        "test_rows":          int(X_test.shape[0]),
        "fraud_rate":         round(float(y.mean()), 4),
        "metrics":            metrics,
    }
    with open(META_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {META_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train IEEE-CIS fraud detection model for TrustOS")
    parser.add_argument("--txn",      default="train_transaction.csv", help="Path to train_transaction.csv")
    parser.add_argument("--identity", default="train_identity.csv",    help="Path to train_identity.csv")
    parser.add_argument("--sample",   type=int, default=120_000,
                         help="Max rows to train on (downsamples clean class). Use 0 for full dataset.")
    args = parser.parse_args()

    sample = args.sample if args.sample > 0 else None
    main(args.txn, args.identity, sample_size=sample)