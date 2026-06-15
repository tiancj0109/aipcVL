@echo off
title AIPCVL System Launcher
echo =======================================================
echo          Starting AIPCVL Evaluation System...
echo =======================================================
echo.
echo [INFO] Please ensure that MySQL (Port 3306) and Redis (Port 6379) are running locally.
echo.

echo [1/3] Starting FastAPI Backend on Port 8000...
start "AIPCVL Backend Server" cmd /c "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload"

echo [2/3] Starting Celery Worker for background tasks...
start "AIPCVL Celery Worker" cmd /c "cd /d %~dp0backend && call venv\Scripts\activate.bat && celery -A app.worker.celery_app worker -l info -P gevent"

echo [3/3] Starting React Vite Frontend on Port 5173...
start "AIPCVL Frontend UI" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo =======================================================
echo All services have been dispatched to separate windows!
echo It might take a few seconds for the frontend to compile.
echo You can access the UI at: http://localhost:5173/aipcvl/
echo =======================================================
pause
