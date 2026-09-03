@echo off
echo Starting Task Manager Backend and Frontend...
echo.
start "Task Manager Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "Task Manager Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 3000"
echo.
echo ========================================================
echo Backend running on:  http://127.0.0.1:8000
echo Frontend running on: http://127.0.0.1:3000
echo ========================================================
echo.
echo Admin Login: User ID: dinesh2202  / Password: dinesh2202
echo ========================================================
