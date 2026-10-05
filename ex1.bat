@echo off
echo ========================================================
echo               COMMUNIQ AAC - STARTING APP
echo ========================================================
echo.

cd /d "%~dp0"

echo 1. Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "COMMUNIQ Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend (Vite on http://127.0.0.1:5173)...
start "COMMUNIQ Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo   COMMUNIQ is running!
echo   Frontend: http://127.0.0.1:5173/
echo   Backend:  http://127.0.0.1:8000/
echo ========================================================
