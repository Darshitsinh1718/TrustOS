# 🛡️ TrustOS – AI-Powered Banking Fraud & Identity Protection Platform

TrustOS is a real-time fraud detection and identity trust platform designed for modern digital banking systems.

The platform continuously evaluates user sessions, login behavior, device trust, transaction activity, and fraud risk using Machine Learning to prevent account takeover, fraudulent transactions, and identity abuse.

Built for the Bank of Baroda x IIT Gandhinagar Cybersecurity Hackathon.

---

# 🚨 Problem Statement

Banks face increasing threats from:

- Account Takeover Attacks (ATO)
- Fraudulent Transactions
- Stolen Credentials
- Device Spoofing
- Suspicious Login Behavior
- Insider Abuse
- Identity Fraud

Traditional authentication only verifies users at login.

TrustOS introduces Continuous Trust Evaluation that monitors user activity throughout the session and dynamically adjusts risk.

---

# 💡 Solution

TrustOS combines:

### 1. Identity Trust Scoring
Evaluates user behavior continuously.

### 2. Session Risk Monitoring
Detects suspicious login patterns.

### 3. AI Fraud Detection
Uses Machine Learning trained on the IEEE-CIS Fraud Detection Dataset.

### 4. Adaptive Response Engine

Depending on risk:

| Risk Level | Action               |
|------------|----------            |
| Low        | Allow                |
| Medium     | OTP Verification     |
| High       | Freeze Session       |
| Critical   | Freeze + Alert Admin |

---

# 🧠 Machine Learning Model

### Dataset

IEEE-CIS Fraud Detection Dataset

Source:
https://www.kaggle.com/competitions/ieee-fraud-detection

### Model

RandomForestClassifier

### Features Used

- Transaction Amount
- Card Type
- Card Class
- Device Type
- Email Domain
- Identity Features
- Transaction Metadata

### Performance

| Metric   | Score |
|----------|-------|
| Accuracy | 82%   |
| Precision| 79%   |
| Recall   | 76%   |
| F1 Score | 77%   |
| ROC-AUC  | 0.889 |

### Fraud Output

The model returns:

- Fraud Probability
- Risk Level
- Trust Impact
- Recommended Action

---

# 🔥 Core Features

## User Features

### Secure Authentication

- Sign Up
- Sign In
- JWT Authentication

### Continuous Trust Scoring

Trust score starts at 100.

Risky actions reduce score dynamically.

### Real-Time Fraud Detection

Every transaction is analyzed by the IEEE-CIS trained model.

### Adaptive Security

- Allow
- OTP Verification
- Session Freeze

### Transaction Intelligence

Displays:

- Fraud Probability
- Risk Level
- Trust Impact
- AI Explanation

---

## Admin Features

### Admin Dashboard

Monitor all users and sessions.

### Fraud Alerts

Receive alerts for:

- High-risk transactions
- Frozen sessions
- Critical fraud attempts

### Session Management

Admins can:

- Review sessions
- Unfreeze sessions
- Investigate suspicious activity

### AI Analytics

View:

- Model Performance
- Fraud Statistics
- Risk Trends

---

# 🏗️ System Architecture

```text
User
 │
 ▼
Frontend (React + Vite)
 │
 ▼
FastAPI Backend
 │
 ├── Authentication Engine
 │
 ├── Trust Score Engine
 │
 ├── Session Monitoring
 │
 ├── Fraud Detection Engine
 │       │
 │       ▼
 │  Random Forest Model
 │  (IEEE-CIS Dataset)
 │
 ▼
PostgreSQL Database
 │
 ▼
Admin Dashboard
```

---

# ⚙️ Technology Stack

## Frontend

- React.js
- Vite
- TailwindCSS
- Axios
- React Router

## Backend

- FastAPI
- SQLAlchemy
- JWT Authentication
- Passlib

## Machine Learning

- Scikit-Learn
- Random Forest Classifier
- Pandas
- NumPy

## Database

- PostgreSQL

## Deployment

- Railway (Backend)
- Vercel (Frontend)

---

# 📁 Project Structure

```text
TrustOS
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│   └── api.js
│
├── backend
│   ├── routes
│   ├── models
│   ├── fraud_model.py
│   ├── risk_engine.py
│   ├── train_ieee_model.py
│   └── main.py
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Darshitsinh1718/TrustOS.git
cd TrustOS
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend:

```text
trustos-production.up.railway.app
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:  https://trust-os-theta.vercel.app/

---

# 🔐 Default Admin

```text
Username: admin
Password: admin123
```

---

# 🌐 Deployment

## Frontend

Vercel

## Backend

Railway

## Database

Railway PostgreSQL

---

# 🎯 Hackathon Impact

TrustOS helps banks:

✅ Prevent Account Takeovers

✅ Detect Fraudulent Transactions

✅ Reduce Financial Losses

✅ Improve Customer Security

✅ Enable Continuous Trust Verification

✅ Provide Explainable AI Decisions

---

# 📈 Future Enhancements

- Isolation Forest Behavioral Analytics
- Device Fingerprinting
- Geolocation Risk Engine
- Real-time OTP Integration
- Graph Neural Network Fraud Detection
- Explainable AI Dashboard
- SIEM Integration
- Multi-Bank Risk Intelligence Network

---

# 👨‍💻 Team

Team Name: ALTF4

Built for:
Bank of Baroda × IIT Gandhinagar Cybersecurity Hackathon

Developed by:

- Darshit Chavda
- Daksh
- Akash

---

# ⭐ If you found this project useful, consider giving it a star.
