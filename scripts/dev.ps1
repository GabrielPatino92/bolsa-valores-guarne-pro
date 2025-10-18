# Script para iniciar todos los servicios de desarrollo
# Uso: .\scripts\dev.ps1

Write-Host "🚀 Iniciando Guarne Pro - Modo Desarrollo" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Limpiar puertos ocupados
Write-Host "`n🧹 Limpiando puertos ocupados..." -ForegroundColor Yellow

$ports = @(3000, 4000)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Write-Host "  ⚠️  Puerto $port ocupado por proceso $process - matando..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

Write-Host "  ✅ Puertos liberados" -ForegroundColor Green

# Verificar Docker
Write-Host "`n🐳 Verificando servicios Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps --format "{{.Names}}" 2>$null

if ($dockerRunning -match "guarne") {
    Write-Host "  ✅ Docker corriendo correctamente" -ForegroundColor Green
    Write-Host "     Contenedores activos:" -ForegroundColor Gray
    docker ps --format "     - {{.Names}} ({{.Status}})" | Where-Object { $_ -match "guarne" }
} else {
    Write-Host "  ⚠️  Servicios Docker no encontrados. Iniciando..." -ForegroundColor Yellow
    Set-Location -Path "$PSScriptRoot\..\infra"
    docker-compose -f docker-compose.dev.yml up -d
    Start-Sleep -Seconds 5
    Set-Location -Path "$PSScriptRoot\.."
}

# Iniciar servicios
Write-Host "`n🔧 Iniciando servicios..." -ForegroundColor Yellow

Write-Host "  📡 Iniciando API (puerto 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; pnpm dev:api"

Start-Sleep -Seconds 3

Write-Host "  🌐 Iniciando Frontend (puerto 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; pnpm dev:web"

Start-Sleep -Seconds 5

# Mostrar URLs
Write-Host "`n✅ ¡Servicios iniciados correctamente!" -ForegroundColor Green
Write-Host "`n📍 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   API:         http://localhost:4000" -ForegroundColor White
Write-Host "   API Docs:    http://localhost:4000/api/docs" -ForegroundColor White
Write-Host "   Grafana:     http://localhost:3001" -ForegroundColor White
Write-Host "   Prometheus:  http://localhost:9090" -ForegroundColor White

Write-Host "`n🔑 Credenciales:" -ForegroundColor Cyan
Write-Host "   Frontend - demo@guarne.pro / demo123" -ForegroundColor White
Write-Host "   Grafana  - admin / admin_guarne_2024" -ForegroundColor White

Write-Host "`n💡 Presiona Ctrl+C para detener este script" -ForegroundColor Yellow
Write-Host "   (Las ventanas de API y Frontend seguirán abiertas)" -ForegroundColor Gray

# Mantener el script abierto
while ($true) {
    Start-Sleep -Seconds 10
}
