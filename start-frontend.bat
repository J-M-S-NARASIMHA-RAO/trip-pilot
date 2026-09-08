@echo off
title TRIP PILOT - Vite React Frontend
cls
echo ====================================================================
echo   TRIP PILOT - React 18 + Vite Mobile Super-App Cockpit
echo   Running on http://localhost:5173 / http://localhost:3000
echo ====================================================================
echo.

cd /d "%~dp0frontend"
npm run dev -- --host 0.0.0.0 --port 5173
pause
