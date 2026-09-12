# Start PhishShield Backend Service
Write-Host "Starting PhishShield Backend (port 8000)..." -ForegroundColor Yellow
Set-Location "c:\Users\admin\setup\New folder\phishshield\backend"
pip install -r requirements.txt -q
uvicorn main:app --port 8000 --reload
