@echo off
set "PATH=C:\Users\HP\AppData\Local\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting GETIT Native Mobile Expo Tunnel...
npm run tunnel
pause
