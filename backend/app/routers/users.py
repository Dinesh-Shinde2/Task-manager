from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Team, TeamMember
from ..schemas import UserCreate, UserUpdate, UserResponse
from ..auth import get_current_user, require_admin, get_password_hash

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def get_users(
    team_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    
    # If not Admin and team_id requested, ensure member is only fetching their own team or team members
    if current_user.role != "Admin":
        if current_user.team_id:
            query = query.filter(User.team_id == current_user.team_id)
        else:
            query = query.filter(User.id == current_user.id)
    elif team_id:
        query = query.filter(User.team_id == team_id)

    users = query.all()
    results = []
    for u in users:
        ur = UserResponse.from_orm(u)
        if u.team:
            ur.team_name = u.team.name
        results.append(ur)
    return results

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.user_id == payload.user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=f"User ID '{payload.user_id}' already exists")

    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        user_id=payload.user_id,
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        status=payload.status,
        team_id=payload.team_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if new_user.team_id:
        tm = TeamMember(team_id=new_user.team_id, user_id=new_user.id)
        db.add(tm)
        db.commit()

    ur = UserResponse.from_orm(new_user)
    if new_user.team:
        ur.team_name = new_user.team.name
    return ur

@router.put("/{user_db_id}", response_model=UserResponse)
def update_user(
    user_db_id: int,
    payload: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_db_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    old_team_id = target_user.team_id

    if payload.name is not None:
        target_user.name = payload.name
    if payload.email is not None:
        target_user.email = payload.email
    if payload.role is not None:
        target_user.role = payload.role
    if payload.status is not None:
        target_user.status = payload.status
    if payload.team_id is not None:
        target_user.team_id = payload.team_id
    if payload.password and payload.password.strip():
        target_user.password_hash = get_password_hash(payload.password)

    db.commit()
    db.refresh(target_user)

    # Sync TeamMember relation if team changed
    if payload.team_id is not None and payload.team_id != old_team_id:
        if old_team_id:
            db.query(TeamMember).filter(
                TeamMember.team_id == old_team_id,
                TeamMember.user_id == target_user.id
            ).delete()
        if payload.team_id:
            db.add(TeamMember(team_id=payload.team_id, user_id=target_user.id))
        db.commit()

    ur = UserResponse.from_orm(target_user)
    if target_user.team:
        ur.team_name = target_user.team.name
    return ur
