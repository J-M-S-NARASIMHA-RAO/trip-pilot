@echo off
title TRIP PILOT - Instant Multi-Device Cloud Tunnel
cls
echo =====================================================================
echo       TRIP PILOT - INSTANT MULTI-DEVICE CLOUD ACCESS LAUNCHER
echo =====================================================================
echo.
echo  1. Make sure Trip Pilot is running (run-app.bat or http://localhost:5173)
echo  2. Starting secure public HTTPS tunnel for port 5173...
echo.
echo  Opening on your phone/tablet/any computer anywhere in the world!
echo =====================================================================
echo.
npx localtunnel --port 5173
pause
