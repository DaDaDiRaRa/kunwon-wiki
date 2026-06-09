@echo off

start "Backend"  /d "%~dp0backend"  cmd /k uvicorn main:app --reload --port 8000
start "Frontend" /d "%~dp0frontend" cmd /k npm run dev

echo Backend  : http://localhost:8000
echo Frontend : http://localhost:3000
echo.
pause
