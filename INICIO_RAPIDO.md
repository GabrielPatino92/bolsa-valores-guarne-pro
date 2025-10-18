# 🚀 Inicio Rápido - Guarne Pro

## ⚡ Forma más fácil (Windows)

### 1. Abrir PowerShell como Administrador

### 2. Ejecutar el script de inicio:
```powershell
cd C:\Users\luis.patino\Desktop\bolsa-valores-guarne-pro
.\scripts\dev.ps1
```

Esto automáticamente:
- ✅ Limpia puertos ocupados
- ✅ Verifica Docker
- ✅ Inicia API y Frontend
- ✅ Muestra las URLs y credenciales

---

## 🔧 Forma Manual

### Paso 1: Iniciar Docker (solo primera vez o si está apagado)
```bash
cd infra
docker-compose -f docker-compose.dev.yml up -d
```

### Paso 2: Iniciar API
```bash
pnpm dev:api
```

### Paso 3: Iniciar Frontend (en otra terminal)
```bash
pnpm dev:web
```

---

## 📍 URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:3000 | demo@guarne.pro / demo123 |
| **API** | http://localhost:4000 | - |
| **API Docs** | http://localhost:4000/api/docs | - |
| **Grafana** | http://localhost:3001 | admin / admin_guarne_2024 |
| **Prometheus** | http://localhost:9090 | - |

---

## ❌ Solución de Problemas

### Error: "Port 3000 is in use"

**Opción 1 - Matar proceso manualmente:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr ":3000"

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

**Opción 2 - Usar el script automático:**
```powershell
.\scripts\dev.ps1
```

### Error: "Module not found"

```bash
# Limpiar e instalar dependencias
pnpm install
cd apps/web
rd /s /q .next
cd ../..
pnpm dev:web
```

### Docker no responde

```bash
cd infra
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🎯 Funcionalidades Disponibles

### ✅ Implementadas
- Sistema de autenticación (login/registro)
- Dashboard con información de usuario
- **Sistema de Backtesting:**
  - Gráfico TradingView con 500 velas BTC/USDT
  - 40+ temporalidades (de ticks a 5 años)
  - Controles de reproducción (play/pause/velocidad 1x-100x)
  - Navegación frame por frame

### ⏳ Pendientes
- Recuperación de contraseña
- Autenticación 2FA
- Conexión API Binance para datos reales
- Indicadores técnicos (RSI, MACD, EMA, Bollinger)
- Sistema de órdenes simuladas
- Métricas de rendimiento (P&L, Sharpe Ratio)

---

## 📝 Comandos Útiles

```bash
# Ver logs de Docker
docker logs guarne-postgres
docker logs guarne-redis
docker logs guarne-grafana

# Reiniciar servicios Docker
cd infra
docker-compose -f docker-compose.dev.yml restart

# Ver estado de servicios
docker ps

# Limpiar todo y empezar de cero
pnpm clean
pnpm install
cd infra
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que Docker Desktop esté corriendo
2. Asegúrate de que los puertos 3000, 4000, 3001, 9090, 5432, 6379 estén libres
3. Revisa los logs en las terminales de API y Frontend
4. Si nada funciona, usa `.\scripts\dev.ps1` que limpia todo automáticamente
