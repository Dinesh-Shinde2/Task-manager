import datetime
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import User, Team, TeamMember
from .auth import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Get or Create Default Management Team
        admin_team = db.query(Team).filter(Team.name == "Management").first()
        if not admin_team:
            admin_team = Team(
                name="Management",
                description="Executive Management & Administration",
                status="Active",
                created_at=datetime.datetime.utcnow()
            )
            db.add(admin_team)
            db.commit()
            db.refresh(admin_team)

        # 2. Get or Create Single Admin User: dinesh2202
        admin_user = db.query(User).filter(User.user_id == "dinesh2202").first()
        if not admin_user:
            admin_user = User(
                user_id="dinesh2202",
                name="Dinesh",
                email="dinesh@company.com",
                password_hash=get_password_hash("dinesh2202"),
                role="Admin",
                status="Active",
                team_id=admin_team.id,
                created_at=datetime.datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            # Set team lead and membership
            admin_team.team_lead_id = admin_user.id
            existing_member = db.query(TeamMember).filter(
                TeamMember.team_id == admin_team.id,
                TeamMember.user_id == admin_user.id
            ).first()
            if not existing_member:
                db.add(TeamMember(team_id=admin_team.id, user_id=admin_user.id))
            db.commit()

        print("Database seed verified: dinesh2202 admin is ready.")
    except Exception as e:
        db.rollback()
        print(f"Seed error handled: {e}")
    finally:
        db.close()
