# Start Platform Integration Backend & SOC Dashboard
Write-Host "Starting Platform Backend (port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  'cd "c:\Users\admin\setup\New folder\platform\backend"; pip install -r requirements.txt -q; uvicorn main:app --port 8001 --reload'
)

Write-Host "Starting Platform SOC Dashboard (port 5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  'cd "c:\Users\admin\setup\New folder\platform\frontend"; npm install; npm run dev'
)
