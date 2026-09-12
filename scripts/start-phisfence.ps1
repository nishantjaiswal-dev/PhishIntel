# Start PhisFence Monitor API Service
Write-Host "Starting PhisFence Monitor API (port 5000)..." -ForegroundColor Green
Set-Location "c:\Users\admin\setup\New folder\phisfence\monitor-api"
npm install
node server.js
