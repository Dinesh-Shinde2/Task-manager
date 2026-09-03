import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from .seed import seed_db
from .routers import auth, users, teams, tasks, comments, attachments, notifications, reports

# Create tables and seed default data
seed_db()

app = FastAPI(
    title="Task Manager API",
    description="Web-based Task Manager backend in FastAPI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory
os.makedirs("./uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(teams.router)
app.include_router(tasks.router)
app.include_router(comments.router)
app.include_router(attachments.router)
app.include_router(notifications.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Task Manager API is running cleanly", "docs": "/docs"}
