# main.py  ← create this LAST
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import auth_routes, session_routes, transaction_routes, admin_routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://trust-os-theta.vercel.app",
    "https://trust-os-git-main-alt-f7.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(session_routes.router)
app.include_router(transaction_routes.router)
app.include_router(admin_routes.router)

@app.get("/health")
def health():
    return {"status": "ok", "app": "TrustOS"}