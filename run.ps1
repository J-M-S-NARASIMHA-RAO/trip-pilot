# Trip Pilot Startup Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " TRIP PILOT - FULL-STACK SUPER-APP RUNNER" -ForegroundColor Yellow
Write-Host " Tagline: Travel Smart. Pay Fair. Explore More." -ForegroundColor Green
Write-Host " Core: 'You don't know the city. Trip Pilot does.'" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Set Java path if needed
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\Java\jdk-17.0.19\bin\java.exe") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.19"
        $env:Path = "$env:JAVA_HOME\bin;" + $env:Path
    }
}

# Release port 8080 if occupied
$conns8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($conns8080) {
    foreach ($c in $conns8080) {
        Write-Host "Releasing port 8080 (PID $($c.OwningProcess))..." -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

# Release port 3000 if occupied
$conns3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conns3000) {
    foreach ($c in $conns3000) {
        Write-Host "Releasing port 3000 (PID $($c.OwningProcess))..." -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

# Release port 5173 if occupied
$conns5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($conns5173) {
    foreach ($c in $conns5173) {
        Write-Host "Releasing port 5173 (PID $($c.OwningProcess))..." -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

Write-Host "1. Starting Spring Boot Backend on http://localhost:8080..." -ForegroundColor Cyan
if (Test-Path "$PSScriptRoot\backend\target\trip-pilot-backend-1.0.0-SNAPSHOT.jar") {
    Start-Process -FilePath "java" -ArgumentList "-jar", "backend\target\trip-pilot-backend-1.0.0-SNAPSHOT.jar" -WorkingDirectory $PSScriptRoot
} else {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "mvn spring-boot:run" -WorkingDirectory "$PSScriptRoot\backend"
}

Start-Sleep -Seconds 4

Write-Host "2. Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev -- --host 0.0.0.0 --port 5173" -WorkingDirectory "$PSScriptRoot\frontend"

Start-Sleep -Seconds 3
Write-Host "==================================================" -ForegroundColor Green
Write-Host " Trip Pilot is live!" -ForegroundColor Green
Write-Host "-> Frontend: http://localhost:5173 (or http://localhost:3000)" -ForegroundColor Yellow
Write-Host "-> Backend API: http://localhost:8080/api" -ForegroundColor Yellow
Write-Host "-> H2 Database Console: http://localhost:8080/h2-console" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green
Start-Process "http://localhost:5173"
