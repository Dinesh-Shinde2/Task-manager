# Web-Based Task Manager (React + Python FastAPI)

A modern full-stack web application for task management with role-based access control, team collaboration, task lifecycles, calendar view, notifications, audit trails, soft-delete restoration, and executive analytics.

## Features & Highlights

- **Authentication & Roles**:
  - Login using User ID + Password with JWT tokens.
  - Roles: **Admin** (complete control) and **Team Member**.
- **Main Dashboard**:
  - Personal tasks summary counters (Pending, Scheduled, Triage, In Progress, Completed).
  - Team tasks summary counters (Team: Management).
  - Recent tasks table with quick view and status controls.
- **Task Lifecycle Workflow**:
  - `Triage` → `Pending` → `Scheduled` → `In Progress` → `Completed`.
  - Supports soft delete (`status = DELETED`) with Admin restoration capability.

---

## Credentials

### Single Admin Account
- **User ID**: `dinesh2202`
- **Password**: `dinesh2202`
- **Name**: Dinesh (Admin)
- **Role**: Admin

---

## How to Run

### Option 1: Automatic Script (Windows)
Double-click `start.bat` or run in PowerShell:
```cmd
start.bat
```

### Option 2: Manual Start

1. **Start Backend (Python FastAPI)**:
   ```cmd
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Backend OpenAPI docs: http://127.0.0.1:8000/docs

2. **Start Frontend (React + Vite)**:
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```
   Frontend URL: http://127.0.0.1:3000
