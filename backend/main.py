import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import auth_routes, session_routes, transaction_routes, admin_routes
from routes.ml_routes    import router as ml_router
from routes.admin_ml_routes import router as admin_ml_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustOS API", version="2.0.0")

origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(session_routes.router)
app.include_router(transaction_routes.router)
app.include_router(admin_routes.router)
app.include_router(ml_router)
app.include_router(admin_ml_router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "ml": "isolation-forest-v1"}