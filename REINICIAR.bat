@echo off
echo ========================================
echo   REINICIANDO GUARNE PRO
echo ========================================
echo.

echo Matando procesos Node existentes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Limpiando cache de Next.js...
if exist apps\web\.next rd /s /q apps\web\.next

echo.
echo ========================================
echo   Abriendo servicios...
echo ========================================
echo.

echo Iniciando API en puerto 4000...
start "Guarne API" cmd /k "cd /d %~dp0 && pnpm dev:api"
timeout /t 5 /nobreak >nul

echo Iniciando Frontend en puerto 3000...
start "Guarne Frontend" cmd /k "cd /d %~dp0 && pnpm dev:web"

echo.
echo ========================================
echo   SERVICIOS INICIADOS
echo ========================================
echo.
echo   Frontend:   http://localhost:3000
echo   API:        http://localhost:4000
echo   Grafana:    http://localhost:3001
echo.
echo   Usuario: demo@guarne.pro
echo   Password: demo123
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
