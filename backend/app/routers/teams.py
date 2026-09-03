from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Team, TeamMember
from ..schemas import TeamCreate, TeamUpdate, TeamResponse, UserResponse
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/api/teams", tags=["Teams"])

def format_team_response(team: Team, db: Session) -> TeamResponse:
    tr = TeamResponse.from_orm(team)
    tr.members_count = len(team.members)
    if team.team_lead:
        tr.team_lead_name = team.team_lead.name

    members_list = []
    for u in team.members:
        ur = UserResponse.from_orm(u)
        ur.team_name = team.name
        members_list.append(ur)
    tr.members = members_list
    return tr

@router.get("", response_model=List[TeamResponse])
def get_teams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    teams = db.query(Team).all()
    results = [format_team_response(t, db) for t in teams]
    return results

@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Team).filter(Team.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Team '{payload.name}' already exists")

    new_team = Team(
        name=payload.name,
        description=payload.description,
        status=payload.status,
        team_lead_id=payload.team_lead_id,
        created_by_id=current_user.id
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    if payload.member_ids:
        for u_id in payload.member_ids:
            usr = db.query(User).filter(User.id == u_id).first()
            if usr:
                usr.team_id = new_team.id
                db.add(TeamMember(team_id=new_team.id, user_id=usr.id))
        db.commit()

    db.refresh(new_team)
    return format_team_response(new_team, db)

@router.put("/{team_id}", response_model=TeamResponse)
def update_team(
    team_id: int,
    payload: TeamUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if payload.name is not None:
        team.name = payload.name
    if payload.description is not None:
        team.description = payload.description
    if payload.status is not None:
        team.status = payload.status
    if payload.team_lead_id is not None:
        team.team_lead_id = payload.team_lead_id

    db.commit()
    db.refresh(team)
    return format_team_response(team, db)

@router.post("/{team_id}/members/{user_db_id}", response_model=TeamResponse)
def add_team_member(
    team_id: int,
    user_db_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    target_user = db.query(User).filter(User.id == user_db_id).first()
    if not team or not target_user:
        raise HTTPException(status_code=404, detail="Team or User not found")

    target_user.team_id = team.id
    tm = db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == target_user.id).first()
    if not tm:
        db.add(TeamMember(team_id=team.id, user_id=target_user.id))

    db.commit()
    db.refresh(team)
    return format_team_response(team, db)

@router.delete("/{team_id}/members/{user_db_id}", response_model=TeamResponse)
def remove_team_member(
    team_id: int,
    user_db_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    target_user = db.query(User).filter(User.id == user_db_id).first()
    if not team or not target_user:
        raise HTTPException(status_code=404, detail="Team or User not found")

    if target_user.team_id == team.id:
        target_user.team_id = None
    
    db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == target_user.id).delete()
    db.commit()
    db.refresh(team)
    return format_team_response(team, db)
