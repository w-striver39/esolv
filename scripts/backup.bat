@echo off
setlocal
echo ========================================================
echo   Esolv Project - Automatic Backup Generator
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup.ps1"
echo.
pause
