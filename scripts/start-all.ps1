# Master Startup Script — Phishing Defense Platform
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "    Phishing Defense Platform — Microservices    " -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Platform Backend
Write-Host "[1/4] Launching Platform Backend (:8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  'cd "c:\Users\admin\setup\New folder\platform\backend"; pip install -r requirements.txt -q; uvicorn main:app --port 8001 --reload'
)

# 2. PhisFence Monitor API
Write-Host "[2/4] Launching PhisFence Monitor API (:5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  'cd "c:\Users\admin\setup\New folder\phisfence\monitor-api"; npm install; node server.js'
)

# 3. PhishShield Backend
Write-Host "[3/4] Launching PhishShield Backend (:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  'cd "c:\Users\admin\setup\New folder\phishshield\backend"; pip install -r requirements.txt -q; uvicorn main:app --port 8000 --reload'
)

# 4. Platform Frontend
Write-Host "[4/4] Launching Unified SOC Dashboard (:5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  'cd "c:\Users\admin\setup\New folder\platform\frontend"; npm install; npm run dev'
)

Write-Host ""
Write-Host "All Platform components running:" -ForegroundColor White
Write-Host "  SOC Dashboard:    http://localhost:5173" -ForegroundColor Magenta
Write-Host "  Platform API:     http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "  PhishShield API:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  PhisFence API:    http://localhost:5000" -ForegroundColor Green
