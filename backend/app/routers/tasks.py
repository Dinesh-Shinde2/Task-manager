import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from ..database import get_db
from ..models import Task, User, Team, TaskActivity, Notification, TaskComment, TaskAttachment
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, CommentResponse, AttachmentResponse, ActivityResponse
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

def format_task_response(task: Task) -> TaskResponse:
    tr = TaskResponse.from_orm(task)
    tr.creator_name = task.creator.name if task.creator else "Unknown"
    tr.assignee_name = task.assignee.name if task.assignee else "Unassigned"
    tr.team_name = task.team.name if task.team else None
    if task.deleted_by:
        tr.deleted_by_name = task.deleted_by.name

    # Format comments
    tr.comments = [
        CommentResponse(
            id=c.id,
            task_id=c.task_id,
            user_id=c.user_id,
            author_name=c.author.name if c.author else "Unknown",
            comment=c.comment,
            created_at=c.created_at
        ) for c in task.comments
    ]

    # Format attachments
    tr.attachments = [
        AttachmentResponse(
            id=a.id,
            task_id=a.task_id,
            file_name=a.file_name,
            file_path=a.file_path,
            uploaded_by_id=a.uploaded_by_id,
            uploader_name=a.uploader.name if a.uploader else "Unknown",
            created_at=a.created_at
        ) for a in task.attachments
    ]

    # Format activities
    tr.activity_logs = [
        ActivityResponse(
            id=act.id,
            task_id=act.task_id,
            user_id=act.user_id,
            user_name=act.user.name if act.user else "System",
            action=act.action,
            old_value=act.old_value,
            new_value=act.new_value,
            created_at=act.created_at
        ) for act in task.activity_logs
    ]
    return tr

def generate_task_id(db: Session) -> str:
    count = db.query(Task).count()
    return f"TASK-{1024 + count}"

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    view_type: Optional[str] = None, # "my_tasks", "team_tasks", "all_tasks", "deleted"
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    assigned_to_id: Optional[int] = None,
    team_id: Optional[int] = None,
    created_by_id: Optional[int] = None,
    search: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task)

    # View Type Scoping
    if view_type == "my_tasks":
        query = query.filter(Task.assigned_to_id == current_user.id, Task.status != "Deleted")
    elif view_type == "team_tasks":
        if current_user.role != "Admin":
            if not current_user.team_id:
                return []
            query = query.filter(Task.team_id == current_user.team_id, Task.status != "Deleted")
        else:
            if team_id:
                query = query.filter(Task.team_id == team_id, Task.status != "Deleted")
            else:
                query = query.filter(Task.status != "Deleted")
    elif view_type == "deleted":
        if current_user.role != "Admin":
            raise HTTPException(status_code=403, detail="Only Admin can view deleted tasks")
        query = query.filter(Task.status == "Deleted")
    else: # Default view
        if status_filter != "Deleted":
            query = query.filter(Task.status != "Deleted")
        if current_user.role != "Admin":
            # Member can view tasks assigned to them or in their team
            if current_user.team_id:
                query = query.filter(
                    or_(
                        Task.assigned_to_id == current_user.id,
                        Task.team_id == current_user.team_id,
                        Task.created_by_id == current_user.id
                    )
                )
            else:
                query = query.filter(
                    or_(
                        Task.assigned_to_id == current_user.id,
                        Task.created_by_id == current_user.id
                    )
                )

    # Filters
    if status_filter and view_type != "deleted":
        statuses = [s.strip() for s in status_filter.split(",")]
        query = query.filter(Task.status.in_(statuses))

    if priority:
        priorities = [p.strip() for p in priority.split(",")]
        query = query.filter(Task.priority.in_(priorities))

    if assigned_to_id:
        query = query.filter(Task.assigned_to_id == assigned_to_id)

    if team_id and view_type != "team_tasks":
        query = query.filter(Task.team_id == team_id)

    if created_by_id:
        query = query.filter(Task.created_by_id == created_by_id)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Task.title.ilike(s),
                Task.task_id.ilike(s),
                Task.description.ilike(s)
            )
        )

    if from_date:
        query = query.filter(Task.due_date >= from_date)

    if to_date:
        query = query.filter(Task.due_date <= to_date)

    tasks = query.order_by(desc(Task.id)).all()
    return [format_task_response(t) for t in tasks]

@router.get("/{task_id_str_or_int}", response_model=TaskResponse)
def get_task_by_id(
    task_id_str_or_int: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if task_id_str_or_int.isdigit():
        task = db.query(Task).filter(Task.id == int(task_id_str_or_int)).first()
    else:
        task = db.query(Task).filter(Task.task_id == task_id_str_or_int).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return format_task_response(task)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Assignment Logic validation
    assignee_id = None
    if payload.assign_to_type == "Self":
        assignee_id = current_user.id
    elif payload.assigned_to_id:
        target_assignee = db.query(User).filter(User.id == payload.assigned_to_id).first()
        if not target_assignee:
            raise HTTPException(status_code=400, detail="Invalid assignee user")
        
        # Team Member restriction check
        if current_user.role != "Admin":
            if target_assignee.id != current_user.id and target_assignee.team_id != current_user.team_id:
                raise HTTPException(
                    status_code=403,
                    detail="Team members can only assign tasks to themselves or members of their own team"
                )
        assignee_id = target_assignee.id

    team_id = payload.team_id
    if not team_id:
        if assignee_id:
            assignee_user = db.query(User).filter(User.id == assignee_id).first()
            if assignee_user:
                team_id = assignee_user.team_id
        if not team_id:
            team_id = current_user.team_id

    new_task = Task(
        task_id=generate_task_id(db),
        title=payload.title,
        description=payload.description,
        task_type=payload.task_type,
        priority=payload.priority,
        status=payload.status,
        created_by_id=current_user.id,
        assigned_to_id=assignee_id,
        team_id=team_id,
        start_date=payload.start_date,
        due_date=payload.due_date,
        scheduled_at=payload.scheduled_at,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Activity Log
    act = TaskActivity(
        task_id=new_task.id,
        user_id=current_user.id,
        action="Task Created",
        new_value=new_task.title
    )
    db.add(act)

    # Notification
    if assignee_id:
        notif = Notification(
            user_id=assignee_id,
            title="Task Assigned",
            message=f"You have been assigned a new task: {new_task.task_id} - {new_task.title} by {current_user.name}",
            task_id=new_task.id
        )
        db.add(notif)

    db.commit()
    db.refresh(new_task)
    return format_task_response(new_task)

@router.put("/{task_db_id}", response_model=TaskResponse)
def update_task(
    task_db_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_db_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Permissions check
    if current_user.role != "Admin":
        if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
            if task.team_id != current_user.team_id:
                raise HTTPException(status_code=403, detail="Permission denied to update this task")

    old_status = task.status
    old_assignee_id = task.assigned_to_id

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.task_type is not None:
        task.task_type = payload.task_type
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.start_date is not None:
        task.start_date = payload.start_date
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.scheduled_at is not None:
        task.scheduled_at = payload.scheduled_at
    if payload.team_id is not None:
        task.team_id = payload.team_id

    # Handle status change
    if payload.status is not None and payload.status != old_status:
        task.status = payload.status
        act = TaskActivity(
            task_id=task.id,
            user_id=current_user.id,
            action="Status Changed",
            old_value=old_status,
            new_value=payload.status
        )
        db.add(act)

        # Notify assignee if status changed
        if task.assigned_to_id and task.assigned_to_id != current_user.id:
            notif_msg = f"{task.task_id} status changed to {payload.status} by {current_user.name}."
            if payload.status == "Completed":
                notif_title = "Task Completed"
                notif_msg = f"{task.task_id} has been marked as completed by {current_user.name}."
            else:
                notif_title = "Status Changed"
            
            db.add(Notification(
                user_id=task.assigned_to_id,
                title=notif_title,
                message=notif_msg,
                task_id=task.id
            ))

    # Handle assignee change
    if payload.assigned_to_id is not None and payload.assigned_to_id != old_assignee_id:
        target_user = db.query(User).filter(User.id == payload.assigned_to_id).first()
        if not target_user:
            raise HTTPException(status_code=400, detail="Assignee not found")
        
        # Verify team assignment rule for non-admin
        if current_user.role != "Admin":
            if target_user.id != current_user.id and target_user.team_id != current_user.team_id:
                raise HTTPException(status_code=403, detail="Cannot assign task outside your team")

        task.assigned_to_id = target_user.id
        act = TaskActivity(
            task_id=task.id,
            user_id=current_user.id,
            action="Task Reassigned",
            old_value=task.assignee.name if task.assignee else "Unassigned",
            new_value=target_user.name
        )
        db.add(act)

        # Notify new assignee
        db.add(Notification(
            user_id=target_user.id,
            title="Task Reassigned",
            message=f"Task {task.task_id} ({task.title}) has been assigned to you by {current_user.name}.",
            task_id=task.id
        ))

    task.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(task)
    return format_task_response(task)

@router.delete("/{task_db_id}", response_model=TaskResponse)
def delete_task(
    task_db_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_db_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Permissions check for soft delete
    if current_user.role != "Admin":
        if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only creator, assignee, or Admin can delete a task")

    old_status = task.status
    task.status = "Deleted"
    task.deleted_at = datetime.datetime.utcnow()
    task.deleted_by_id = current_user.id

    act = TaskActivity(
        task_id=task.id,
        user_id=current_user.id,
        action="Task Deleted",
        old_value=old_status,
        new_value="Deleted"
    )
    db.add(act)
    db.commit()
    db.refresh(task)
    return format_task_response(task)

@router.post("/{task_db_id}/restore", response_model=TaskResponse)
def restore_task(
    task_db_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_db_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "Pending"
    task.deleted_at = None
    task.deleted_by_id = None

    act = TaskActivity(
        task_id=task.id,
        user_id=current_user.id,
        action="Task Restored",
        old_value="Deleted",
        new_value="Pending"
    )
    db.add(act)
    db.commit()
    db.refresh(task)
    return format_task_response(task)
