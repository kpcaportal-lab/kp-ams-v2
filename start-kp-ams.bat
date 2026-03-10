@echo off
echo Starting KP-AMS v2...

start cmd /k "cd /d %~dp0server && npm run dev"
start cmd /k "cd /d %~dp0 && npm run dev"

echo Backend and Frontend servers are starting in separate windows.
echo Once they are ready, visit http://localhost:3000
pause
