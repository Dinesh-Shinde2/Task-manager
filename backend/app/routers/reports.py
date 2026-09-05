from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Task, User, Team
from ..schemas import StatusCounts, TeamPerformance, UserWorkload, DashboardDataResponse, TaskResponse
from ..auth import get_current_user, require_admin
from .tasks import format_task_response

router = APIRouter(prefix="/api/reports", tags=["Reports & Dashboard"])

@router.get("/dashboard", response_model=DashboardDataResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. My Tasks Summary (status counts where assigned_to_id == current_user.id)
    my_tasks_query = db.query(Task).filter(Task.assigned_to_id == current_user.id)
    
    my_summary = StatusCounts(
        pending=my_tasks_query.filter(Task.status == "Pending").count(),
        scheduled=my_tasks_query.filter(Task.status == "Scheduled").count(),
        triage=my_tasks_query.filter(Task.status == "Triage").count(),
        in_progress=my_tasks_query.filter(Task.status == "In Progress").count(),
        completed=my_tasks_query.filter(Task.status == "Completed").count(),
        deleted=my_tasks_query.filter(Task.status == "Deleted").count(),
        total=my_tasks_query.filter(Task.status != "Deleted").count()
    )

    # 2. Team Tasks Summary (status counts for team_id)
    team_name = None
    team_summary = StatusCounts()
    if current_user.team:
        team_name = current_user.team.name
        team_query = db.query(Task).filter(Task.team_id == current_user.team_id)
        team_summary = StatusCounts(
            pending=team_query.filter(Task.status == "Pending").count(),
            scheduled=team_query.filter(Task.status == "Scheduled").count(),
            triage=team_query.filter(Task.status == "Triage").count(),
            in_progress=team_query.filter(Task.status == "In Progress").count(),
            completed=team_query.filter(Task.status == "Completed").count(),
            deleted=team_query.filter(Task.status == "Deleted").count(),
            total=team_query.filter(Task.status != "Deleted").count()
        )

    # 3. Recent Tasks (top 5 active tasks relevant to user/team)
    if current_user.role == "Admin":
        recent_query = db.query(Task).filter(Task.status != "Deleted")
    elif current_user.team_id:
        recent_query = db.query(Task).filter(
            Task.status != "Deleted",
            (Task.assigned_to_id == current_user.id) | (Task.team_id == current_user.team_id)
        )
    else:
        recent_query = db.query(Task).filter(Task.status != "Deleted", Task.assigned_to_id == current_user.id)

    recent_tasks = recent_query.order_by(Task.id.desc()).limit(5).all()
    formatted_recent = [format_task_response(t) for t in recent_tasks]

    return DashboardDataResponse(
        user_name=current_user.name,
        my_tasks_summary=my_summary,
        team_tasks_summary=team_summary,
        team_name=team_name,
        recent_tasks=formatted_recent
    )

@router.get("/admin-metrics")
def get_admin_metrics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Total Tasks breakdown
    all_tasks = db.query(Task).all()
    total_counts = StatusCounts(
        triage=sum(1 for t in all_tasks if t.status == "Triage"),
        pending=sum(1 for t in all_tasks if t.status == "Pending"),
        scheduled=sum(1 for t in all_tasks if t.status == "Scheduled"),
        in_progress=sum(1 for t in all_tasks if t.status == "In Progress"),
        completed=sum(1 for t in all_tasks if t.status == "Completed"),
        deleted=sum(1 for t in all_tasks if t.status == "Deleted"),
        total=sum(1 for t in all_tasks if t.status != "Deleted")
    )

    # Team Performance breakdown
    teams = db.query(Team).all()
    team_perf = []
    for team in teams:
        team_tasks = [t for t in all_tasks if t.team_id == team.id and t.status != "Deleted"]
        team_perf.append(TeamPerformance(
            team_name=team.name,
            total=len(team_tasks),
            pending=sum(1 for t in team_tasks if t.status in ["Pending", "Triage"]),
            in_progress=sum(1 for t in team_tasks if t.status in ["In Progress", "Scheduled"]),
            completed=sum(1 for t in team_tasks if t.status == "Completed")
        ))

    # User Workload breakdown
    users = db.query(User).all()
    user_workload = []
    for u in users:
        u_tasks = [t for t in all_tasks if t.assigned_to_id == u.id and t.status != "Deleted"]
        user_workload.append(UserWorkload(
            user_name=u.name,
            user_id=u.user_id,
            assigned=len(u_tasks),
            pending=sum(1 for t in u_tasks if t.status in ["Pending", "Triage"]),
            in_progress=sum(1 for t in u_tasks if t.status in ["In Progress", "Scheduled"]),
            completed=sum(1 for t in u_tasks if t.status == "Completed")
        ))

    return {
        "status_counts": total_counts,
        "team_performance": team_perf,
        "user_workload": user_workload
    }
