@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Servidor Alerta Guarani" cmd /k "py -m http.server 5081 --bind 127.0.0.1"
) else (
  start "Servidor Alerta Guarani" cmd /k "python -m http.server 5081 --bind 127.0.0.1"
)
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5081"
exit /b
