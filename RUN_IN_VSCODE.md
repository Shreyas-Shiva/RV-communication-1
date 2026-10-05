# How to Run COMMUNIQ in VS Code

You can run the entire COMMUNIQ app (Frontend + Backend) in VS Code in **one step**.

---

## Method 1: One-Click Runner (Easiest)

1. Open the project folder in VS Code (`File > Open Folder...`).
2. Open the terminal (`Ctrl + ~` or `Terminal > New Terminal`).
3. Type:
   ```cmd
   .\ex1.bat
   ```
   *(or `.\ex1.ps1` if using PowerShell)*

This automatically starts:
- **Backend API Server**: `http://127.0.0.1:8000/`
- **Frontend App**: `http://127.0.0.1:5173/`

---

## Method 2: VS Code Build Task (`Ctrl + Shift + B`)

1. Press `Ctrl + Shift + B` (or go to `Terminal > Run Build Task...`).
2. Select **Run COMMUNIQ (ex1)**.
3. Both servers will launch automatically.

---

## Method 3: Running Separately in VS Code Terminal

If you want to run each service in its own terminal tab:

### Terminal 1: Backend
```cmd
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API is online at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- API docs at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Terminal 2: Frontend
```cmd
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser!
