import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Task Manager API is running cleanly"

def test_login_admin():
    response = client.post("/api/auth/login", json={
        "user_id": "dinesh2202",
        "password": "dinesh2202"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["user_id"] == "dinesh2202"
    assert data["user"]["role"] == "Admin"

def test_invalid_login():
    response = client.post("/api/auth/login", json={
        "user_id": "dinesh2202",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_create_task():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "user_id": "dinesh2202",
        "password": "dinesh2202"
    })
    token = login_res.json()["access_token"]

    task_res = client.post(
        "/api/tasks",
        json={
            "title": "Test Task Creation",
            "description": "Testing FastAPI task creation endpoint",
            "task_type": "Development",
            "priority": "High",
            "status": "Pending",
            "assign_to_type": "Self"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert task_res.status_code == 201
    data = task_res.json()
    assert data["title"] == "Test Task Creation"
    assert data["creator_name"] == "Dinesh"
    assert data["assignee_name"] == "Dinesh"
