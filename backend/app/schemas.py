import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# User Schemas
class UserBase(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
    role: str = "Member"  # Admin / Member
    status: str = "Active" # Active / Inactive
    team_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    team_id: Optional[int] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime
    team_name: Optional[str] = None

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    user_id: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Team Schemas
class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "Active"
    team_lead_id: Optional[int] = None

class TeamCreate(TeamBase):
    member_ids: Optional[List[int]] = []

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    team_lead_id: Optional[int] = None

class TeamResponse(TeamBase):
    id: int
    created_at: datetime.datetime
    members_count: int = 0
    team_lead_name: Optional[str] = None
    members: List[UserResponse] = []

    class Config:
        from_attributes = True

# Comment Schemas
class CommentCreate(BaseModel):
    comment: str

class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    author_name: Optional[str] = "Unknown"
    comment: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Attachment Schemas
class AttachmentResponse(BaseModel):
    id: int
    task_id: int
    file_name: str
    file_path: str
    uploaded_by_id: int
    uploader_name: Optional[str] = "Unknown"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Activity Schemas
class ActivityResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    user_name: Optional[str] = "System"
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    task_id: Optional[int] = None
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: str = "Development"
    priority: str = "Medium"
    status: str = "Pending"
    assigned_to_id: Optional[int] = None
    team_id: Optional[int] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    scheduled_at: Optional[str] = None

class TaskCreate(TaskBase):
    assign_to_type: Optional[str] = "Self" # "Self" or "Other"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None
    team_id: Optional[int] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    scheduled_at: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    task_id: str
    created_by_id: int
    creator_name: Optional[str] = "Unknown"
    assignee_name: Optional[str] = "Unassigned"
    team_name: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None
    deleted_by_name: Optional[str] = None
    comments: List[CommentResponse] = []
    attachments: List[AttachmentResponse] = []
    activity_logs: List[ActivityResponse] = []

    class Config:
        from_attributes = True

# Dashboard & Analytics Reports Schemas
class StatusCounts(BaseModel):
    triage: int = 0
    pending: int = 0
    scheduled: int = 0
    in_progress: int = 0
    completed: int = 0
    deleted: int = 0
    total: int = 0

class TeamPerformance(BaseModel):
    team_name: str
    total: int
    pending: int
    in_progress: int
    completed: int

class UserWorkload(BaseModel):
    user_name: str
    user_id: str
    assigned: int
    pending: int
    in_progress: int
    completed: int

class DashboardDataResponse(BaseModel):
    user_name: str
    my_tasks_summary: StatusCounts
    team_tasks_summary: StatusCounts
    team_name: Optional[str] = None
    recent_tasks: List[TaskResponse] = []
