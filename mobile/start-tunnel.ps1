$env:Path = "C:\Users\HP\AppData\Local\Programs\nodejs;" + $env:Path
Set-Location -Path $PSScriptRoot
Write-Host "Starting GETIT Native Mobile Expo Tunnel..." -ForegroundColor Green
npm run tunnel
