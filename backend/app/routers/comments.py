from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from ..database import get_db
from ..models import Task, TaskComment, User, TaskActivity, Notification
from ..schemas import CommentCreate, CommentResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/tasks/{task_id}/comments", tags=["Comments"])

@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    task_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_comment = TaskComment(
        task_id=task.id,
        user_id=current_user.id,
        comment=payload.comment,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_comment)

    # Activity log
    db.add(TaskActivity(
        task_id=task.id,
        user_id=current_user.id,
        action="Comment Added",
        new_value=payload.comment[:50] + ("..." if len(payload.comment) > 50 else "")
    ))

    # Notify assignee or creator if another user comments
    recipient_id = task.assigned_to_id if task.assigned_to_id != current_user.id else task.created_by_id
    if recipient_id and recipient_id != current_user.id:
        db.add(Notification(
            user_id=recipient_id,
            title="New Comment",
            message=f"{current_user.name} commented on {task.task_id}: '{payload.comment[:40]}...'",
            task_id=task.id
        ))

    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        task_id=new_comment.task_id,
        user_id=new_comment.user_id,
        author_name=current_user.name,
        comment=new_comment.comment,
        created_at=new_comment.created_at
    )
