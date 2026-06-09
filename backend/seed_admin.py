# run this once from backend/ directory:  python seed_admin.py
from database import SessionLocal, engine
import models
from auth import hash_password

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()
admin = models.User(
    username="admin",
    email="admin@trustos.com",
    hashed_password=hash_password("admin123"),
    role="admin"
)
db.add(admin)
db.commit()
print("Admin created: admin / admin123")