@echo off
echo ========================================
echo  Guarne Pro - Inicio de Desarrollo
echo ========================================
echo.

REM Verificar Docker
echo [1/4] Verificando Docker Desktop...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Desktop no esta corriendo.
    echo Por favor, inicia Docker Desktop y vuelve a ejecutar este script.
    pause
    exit /b 1
)
echo   - Docker Desktop: OK

REM Iniciar servicios de Docker
echo.
echo [2/4] Iniciando PostgreSQL y Redis...
cd infra
docker compose -f docker-compose.dev.yml up -d postgres redis
cd ..
echo   - PostgreSQL y Redis: Iniciados

REM Esperar a que PostgreSQL este listo
echo.
echo [3/4] Esperando a que PostgreSQL este listo...
timeout /t 5 /nobreak >nul
echo   - PostgreSQL: Listo

REM Iniciar API y Frontend
echo.
echo [4/4] Iniciando API y Frontend...
echo.
echo Abriendo 2 ventanas de terminal:
echo   - Ventana 1: API en puerto 4000
echo   - Ventana 2: Frontend en puerto 3000
echo.

start "Guarne Pro API" cmd /k "pnpm dev:api"
timeout /t 3 /nobreak >nul
start "Guarne Pro Frontend" cmd /k "pnpm dev:web"

echo.
echo ========================================
echo  Servicios Iniciados
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo API Docs:  http://localhost:4000/api/docs
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:3000/auth/register
