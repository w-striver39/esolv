@echo off
setlocal
echo ========================================================
echo   Starting GlobalEcomPro Local Preview Server
echo ========================================================
echo   Opening in your default browser...
start http://localhost:3000
node "%~dp0..\server.js"
pause
