Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "             COMMUNIQ AAC - STARTING APP" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$Root = $PSScriptRoot

Write-Host "1. Starting Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$Root\backend`" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "2. Starting Frontend (Vite on http://127.0.0.1:5173)..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$Root\frontend`" && npm.cmd run dev -- --host 127.0.0.1 --port 5173" -WindowStyle Normal

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  COMMUNIQ is running!" -ForegroundColor Green
Write-Host "  Frontend: http://127.0.0.1:5173/" -ForegroundColor Yellow
Write-Host "  Backend:  http://127.0.0.1:8000/" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
