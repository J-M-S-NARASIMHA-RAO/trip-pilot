@echo off
title TRIP PILOT - Backend Server (Port 8080)
cls
echo ====================================================================
echo   TRIP PILOT - Spring Boot Backend (Port 8080)
echo   REST Endpoints: /api/fare, /api/providers, /api/accommodations, /api/food
echo ====================================================================
echo.

cd /d "%~dp0backend"
if exist "target\trip-pilot-backend-1.0.0-SNAPSHOT.jar" (
    java -jar target\trip-pilot-backend-1.0.0-SNAPSHOT.jar
) else (
    mvn spring-boot:run
)
pause
