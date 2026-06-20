from database import SessionLocal, engine
import models
from auth import hash_password

models.Base.metadata.create_all(bind=engine)

ADMINS = [
    {
        "username": "admin",
        "email": "admin@trustos.com",
        "password": "admin123",
    },
    {
        "username": "darshit_admin",
        "email": "darshit@trustos.com",
        "password": "darshit123",
    },
    {
        "username": "daksh_admin",
        "email": "daksh@trustos.com",
        "password": "daksh123",
    },
]

db = SessionLocal()

for item in ADMINS:
    user = db.query(models.User).filter(models.User.username == item["username"]).first()

    if user:
        user.email = item["email"]
        user.hashed_password = hash_password(item["password"])
        user.role = "admin"
        print(f"Updated admin: {item['username']} / {item['password']}")
    else:
        user = models.User(
            username=item["username"],
            email=item["email"],
            hashed_password=hash_password(item["password"]),
            role="admin"
        )
        db.add(user)
        print(f"Created admin: {item['username']} / {item['password']}")

db.commit()
db.close()