@echo off
title TRIP PILOT - Full-Stack Super-App Launcher
cls
echo ====================================================================
echo   TRIP PILOT - FULL-STACK SMART MOBILITY SUPER-APP
echo   Tagline: Travel Smart. Pay Fair. Explore More.
echo   Core: "You don't know the city. Trip Pilot does."
echo ====================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1"
pause
