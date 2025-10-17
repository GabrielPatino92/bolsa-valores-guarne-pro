# 🚀 Bolsa de Valores Guarne Pro

Plataforma profesional de trading consolidado con arquitectura de microservicios.

## 🏗️ Arquitectura

- **Monorepo**: pnpm workspaces + Turbo
- **Frontend**: Next.js 14 + TypeScript + Tailwind
- **Backend**: NestJS + TypeScript + Clean Architecture
- **Base de Datos**: PostgreSQL 15 + TimescaleDB
- **Cache**: Redis 7
- **Observabilidad**: Prometheus + Grafana + OpenTelemetry

## 📦 Estructura del Proyecto
```
bolsa-valores-guarne-pro/
├── apps/
│   ├── web/          # Frontend Next.js
│   ├── api/          # Backend NestJS  
│   ├── worker/       # Background jobs
│   └── mobile/       # React Native + Expo
├── packages/
│   ├── ui/           # Componentes compartidos
│   ├── sdk/          # Cliente API TypeScript
│   ├── indicators/   # Indicadores técnicos
│   └── config/       # Configuración compartida
└── infra/            # Docker & configs
```

## 🚀 Instalación Rápida
```bash
# 1. Copiar variables de entorno
cp .env.example .env.local

# 2. Instalar dependencias
pnpm install

# 3. Levantar infraestructura
pnpm docker:up

# 4. Esperar 30 segundos

# 5. Iniciar desarrollo
pnpm dev:api    # Terminal 1
pnpm dev:web    # Terminal 2
```

## 🌐 URLs de Desarrollo

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:3000 | - |
| **API Docs** | http://localhost:3000/api/docs | - |
| **Grafana** | http://localhost:3001 | admin / admin_guarne_2024 |
| **Prometheus** | http://localhost:9090 | - |

## 👤 Credenciales Demo

- **Email**: demo@guarne.pro
- **Password**: Demo2024!

## 📚 Comandos Disponibles

### Desarrollo
```bash
pnpm dev              # Todo en paralelo
pnpm dev:web          # Solo frontend
pnpm dev:api          # Solo backend
pnpm dev:worker       # Solo worker
```

### Build & Deploy
```bash
pnpm build            # Build todo
pnpm build:web        # Solo frontend
pnpm build:api        # Solo backend
```

### Calidad de Código
```bash
pnpm lint             # Ejecutar ESLint
pnpm lint:fix         # Fix automático
pnpm type-check       # TypeScript check
pnpm format           # Prettier format
pnpm test             # Run tests
pnpm test:unit        # Solo unitarios
pnpm test:integration # Solo integración
pnpm test:e2e         # End-to-end
```

### Base de Datos
```bash
pnpm db:migrate       # Ejecutar migraciones
pnpm db:seed          # Poblar con datos
pnpm db:reset         # Reset completo
```

### Docker
```bash
pnpm docker:up        # Levantar servicios
pnpm docker:down      # Detener servicios
pnpm docker:logs      # Ver logs
pnpm docker:restart   # Reiniciar todo
```

### API
```bash
pnpm api:docs         # Abrir docs OpenAPI
pnpm api:lint         # Validar spec
pnpm generate:sdk     # Generar cliente
```

## 🏛️ Principios de Arquitectura

### Clean Architecture
- **Domain Layer**: Entities & Business Logic
- **Application Layer**: Use Cases
- **Infrastructure Layer**: External Services
- **Presentation Layer**: Controllers & DTOs

### Design Patterns
- **Repository Pattern**: Abstracción de datos
- **Factory Pattern**: Creación de objetos
- **Strategy Pattern**: Algoritmos intercambiables
- **Observer Pattern**: Eventos en tiempo real
- **Dependency Injection**: Inversión de control

## 🔒 Seguridad

- ✅ OWASP ASVS L2+ compliance
- ✅ Autenticación OIDC + 2FA
- ✅ JWT con rotación de tokens
- ✅ Rate limiting por IP/usuario
- ✅ CSP, HSTS, CORS configurados
- ✅ Validación estricta (zod/class-validator)
- ✅ Secrets via variables de entorno
- ✅ Audit log de acciones críticas

## 📊 Observabilidad

### Métricas (Prometheus)
- Latencia de endpoints (p50, p95, p99)
- Throughput de requests
- Errores por tipo
- Uso de recursos

### Trazas (OpenTelemetry)
- Request tracing end-to-end
- Distributed tracing
- Performance bottlenecks

### Logs
- Structured logging (JSON)
- Log levels configurables
- Sin datos sensibles

## 🧪 Testing Strategy

### Pirámide de Tests
1. **Unitarios** (70%): Jest/Vitest
2. **Integración** (20%): Testcontainers
3. **E2E** (10%): Playwright/Cypress

### Cobertura Objetivo
- **Crítico**: ≥ 90%
- **Core**: ≥ 80%
- **Auxiliar**: ≥ 60%

## 📱 Mobile (React Native)
```bash
cd apps/mobile
pnpm start
```

- iOS: Presiona `i`
- Android: Presiona `a`
- Web: Presiona `w`

## 🛣️ Roadmap

### Sprint 1 (Actual)
- [x] Setup monorepo
- [x] Infraestructura Docker
- [x] Schemas de base de datos
- [ ] Auth con 2FA
- [ ] Conexión Binance Testnet
- [ ] Dashboard básico

### Sprint 2
- [ ] Gráficos con Lightweight Charts
- [ ] Stream de precios real-time
- [ ] Competencias (CRUD + leaderboard)
- [ ] Backtest simple

### Sprint 3
- [ ] Indicadores avanzados
- [ ] Exportaciones CSV/Parquet
- [ ] Adapter OKX
- [ ] Tests E2E completos

## 📖 Documentación Adicional

- [Arquitectura](./docs/architecture/README.md)
- [ADRs](./docs/ADRs/README.md)
- [API Docs](./specs/openapi.yaml)
- [Deployment](./docs/deployment/README.md)

## ⚠️ Importante

**SOLO DESARROLLO**
- ❌ NO usar en producción
- ❌ NO dinero real
- ✅ Solo testnet/paper accounts
- ✅ Claves read-only únicamente
- ✅ Cumplir TOS de proveedores

## 📞 Soporte

- **Docs**: https://docs.guarne.pro
- **Issues**: https://github.com/guarne-pro/issues
- **Email**: dev@guarne.pro

---

**Zona Horaria**: America/Bogota  
**Versión**: 1.0.0  
**Licencia**: Propietario (DEV only)
