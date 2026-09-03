import datetime
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import User, Team, TeamMember
from .auth import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if admin already exists
    admin_user = db.query(User).filter(User.user_id == "dinesh2202").first()
    if admin_user:
        db.close()
        return

    print("Seeding database with single admin user dinesh2202...")

    # 1. Create Default Admin Team
    admin_team = Team(
        name="Management",
        description="Executive Management & Administration",
        status="Active",
        created_at=datetime.datetime.utcnow()
    )
    db.add(admin_team)
    db.commit()
    db.refresh(admin_team)

    # 2. Create Single Admin User: dinesh2202
    admin = User(
        user_id="dinesh2202",
        name="Dinesh",
        email="dinesh@company.com",
        password_hash=get_password_hash("dinesh2202"),
        role="Admin",
        status="Active",
        team_id=admin_team.id,
        created_at=datetime.datetime.utcnow()
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    # Set team lead and membership
    admin_team.team_lead_id = admin.id
    db.add(TeamMember(team_id=admin_team.id, user_id=admin.id))
    db.commit()
    db.close()

    print("Database seeded with dinesh2202 admin successfully.")
