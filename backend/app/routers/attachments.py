import os
import shutil
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Task, TaskAttachment, User, TaskActivity
from ..schemas import AttachmentResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/tasks/{task_id}/attachments", tags=["Attachments"])

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"task_{task_id}_{int(datetime.datetime.utcnow().timestamp())}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = TaskAttachment(
        task_id=task.id,
        file_name=file.filename,
        file_path=file_path,
        uploaded_by_id=current_user.id,
        created_at=datetime.datetime.utcnow()
    )
    db.add(attachment)

    db.add(TaskActivity(
        task_id=task.id,
        user_id=current_user.id,
        action="Attachment Added",
        new_value=file.filename
    ))

    db.commit()
    db.refresh(attachment)

    return AttachmentResponse(
        id=attachment.id,
        task_id=attachment.task_id,
        file_name=attachment.file_name,
        file_path=attachment.file_path,
        uploaded_by_id=attachment.uploaded_by_id,
        uploader_name=current_user.name,
        created_at=attachment.created_at
    )

@router.get("/{attachment_id}/download")
def download_attachment(
    task_id: int,
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    att = db.query(TaskAttachment).filter(
        TaskAttachment.id == attachment_id,
        TaskAttachment.task_id == task_id
    ).first()
    if not att or not os.path.exists(att.file_path):
        raise HTTPException(status_code=404, detail="Attachment file not found")

    return FileResponse(path=att.file_path, filename=att.file_name)
