# 🔐 DOCUMENTO DE SEGURIDAD - Guarne Pro

## 📋 ÍNDICE
1. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
2. [Persistencia de Datos](#persistencia-de-datos)
3. [Encriptación](#encriptación)
4. [Autenticación](#autenticación)
5. [Clean Architecture](#clean-architecture)
6. [Cumplimiento y Auditoría](#cumplimiento)

---

## 🏗️ ARQUITECTURA DE SEGURIDAD

### Capas de Protección

```
┌─────────────────────────────────────────┐
│  CAPA 1: Firewall y Rate Limiting      │
│  - Helmet (CSP, HSTS, X-Frame-Options)  │
│  - Throttler (5 intentos/15 min)       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CAPA 2: Validación de Inputs          │
│  - Sanitización anti-XSS                │
│  - Detección SQL/NoSQL injection        │
│  - class-validator                      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CAPA 3: Autenticación                 │
│  - JWT con rotación de tokens           │
│  - bcrypt 12 rounds                     │
│  - 2FA opcional                         │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CAPA 4: Autorización                  │
│  - RBAC (Role-Based Access Control)     │
│  - Guards personalizados                │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CAPA 5: Encriptación de Datos         │
│  - AES-256-GCM para datos sensibles     │
│  - TLS 1.3 en producción                │
│  - Campos encriptados en DB             │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CAPA 6: Auditoría y Monitoreo         │
│  - Logs de seguridad                    │
│  - Prometheus métricas                  │
│  - Alertas en Grafana                   │
└─────────────────────────────────────────┘
```

---

## 💾 PERSISTENCIA DE DATOS

### ✅ LA BASE DE DATOS **NO ES TEMPORAL**

**Mito**: "Docker pierde los datos al reiniciar"
**Realidad**: Usamos **volúmenes persistentes de Docker**

#### Configuración Actual (docker-compose.dev.yml)

```yaml
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data  # ← PERSISTENTE

volumes:
  postgres_data:
    driver: local  # ← Los datos se guardan en disco físico
```

#### Ubicación Real de los Datos

**Windows**:
```
C:\ProgramData\Docker\volumes\infra_postgres_data\_data
```

**Linux/Mac**:
```
/var/lib/docker/volumes/infra_postgres_data/_data
```

#### Verificar Persistencia

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect infra_postgres_data

# Backup manual
docker exec guarne-postgres pg_dump -U guarne_dev guarne_trading > backup.sql
```

### 🔒 Seguridad del Volumen de PostgreSQL

1. **Permisos Restringidos**: Solo el usuario Docker puede acceder
2. **Encriptación en Reposo**: Usar Docker con filesystem encriptado (LUKS/BitLocker)
3. **Backups Automatizados**: Configurar en producción

---

## 🔐 ENCRIPTACIÓN

### Niveles de Encriptación

| Dato | Tipo | Método | Algoritmo |
|------|------|--------|-----------|
| **Contraseñas** | One-way hash | bcrypt | bcrypt 12 rounds + salt |
| **API Keys** | Simétrico | AES-256-GCM | PBKDF2 + IV único |
| **Tokens JWT** | Firma | HMAC | HS256/RS256 |
| **Comunicación** | Asimétrico | TLS 1.3 | ECDHE + AES-256 |
| **Datos en reposo** | Simétrico | AES-256-GCM | Clave maestra derivada |

### Implementación de Encriptación

#### 1. Servicio de Encriptación (apps/api/src/shared/encryption.service.ts)

```typescript
// Características:
✅ AES-256-GCM (Galois/Counter Mode)
✅ IV único por cada encriptación
✅ Authentication tags para integridad
✅ PBKDF2 con 100,000 iteraciones
✅ Salt único de 64 bytes
✅ Protección contra timing attacks
✅ IMPLEMENTADO y FUNCIONAL
```

#### 2. Uso en API Keys

```typescript
// Guardar API key encriptada
const encrypted = encryptionService.encrypt(apiKey);
await userProviderRepository.save({
  apiKeyEncrypted: encrypted  // Formato: salt.iv.tag.ciphertext
});

// Recuperar API key
const decrypted = encryptionService.decrypt(encrypted);
```

#### 3. Variables de Entorno Críticas

```bash
# OBLIGATORIO: Generar clave de 32 bytes
ENCRYPTION_KEY=$(openssl rand -hex 32)

# NUNCA usar valores por defecto en producción
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
```

### Rotación de Claves

**Procedimiento**:
1. Generar nueva `ENCRYPTION_KEY`
2. Mantener clave antigua temporalmente
3. Re-encriptar datos con nueva clave
4. Eliminar clave antigua
5. Actualizar variable de entorno

---

## 🔑 AUTENTICACIÓN

### Flujo de Autenticación Seguro

```
Usuario
  │
  ├─→ [1] POST /api/v1/auth/register
  │     ├─ Sanitizar inputs (anti-XSS)
  │     ├─ Validar fortaleza de contraseña
  │     ├─ Hash bcrypt (12 rounds)
  │     ├─ Guardar en DB (encriptado)
  │     └─ Retornar JWT + Refresh Token
  │
  ├─→ [2] POST /api/v1/auth/login
  │     ├─ Verificar rate limit (5 intentos)
  │     ├─ Buscar usuario
  │     ├─ Comparar hash (timing-safe)
  │     ├─ Verificar 2FA (si está habilitado)
  │     ├─ Registrar login exitoso
  │     └─ Retornar JWT + Refresh Token
  │
  ├─→ [3] Peticiones con JWT
  │     ├─ Verificar firma del token
  │     ├─ Validar expiración (15 min)
  │     ├─ Extraer claims (sub, email)
  │     └─ Autorizar acceso
  │
  └─→ [4] POST /api/v1/auth/refresh
        ├─ Verificar refresh token (7 días)
        ├─ Generar nuevo access token
        ├─ Rotar refresh token
        └─ Retornar nuevos tokens
```

### Características de Seguridad

#### Contraseñas
```typescript
✅ Mínimo 8 caracteres
✅ Al menos 1 mayúscula
✅ Al menos 1 minúscula
✅ Al menos 1 número
✅ Detección de contraseñas comunes
✅ bcrypt con 12 rounds (2^12 = 4096 iteraciones)
✅ Salt único por usuario
```

#### JWT Tokens
```typescript
✅ Firmados con secreto de 256+ bits
✅ Expiración corta (15 minutos)
✅ Refresh tokens (7 días)
✅ Rotación automática
✅ Blacklist de tokens revocados (Redis)
✅ Claims mínimos (sub, email, username)
```

---

## 🏛️ CLEAN ARCHITECTURE

### ✅ IMPLEMENTACIÓN COMPLETA

**Estado**: IMPLEMENTADO y FUNCIONAL

La arquitectura Clean Architecture ha sido completamente implementada siguiendo las mejores prácticas recomendadas por Robert C. Martin (Uncle Bob).

### Estructura de Capas

```
apps/api/src/
├── domain/                    # CAPA 1: Dominio (Núcleo) ✅ IMPLEMENTADO
│   ├── entities/             # Entidades de negocio puras
│   │   └── user.domain.ts    # ✅ Reglas de negocio de User
│   └── value-objects/        # Objetos de valor inmutables
│
├── application/              # CAPA 2: Aplicación (Casos de Uso) ✅ IMPLEMENTADO
│   ├── use-cases/           # Orquestación de lógica
│   │   ├── register-user.use-case.ts  # ✅ Caso de uso de registro
│   │   └── login-user.use-case.ts     # ✅ Caso de uso de login
│   ├── repositories/        # Interfaces (Puertos)
│   │   └── user.repository.interface.ts  # ✅ Puerto de repositorio
│   └── services/            # Interfaces de servicios
│       ├── password-hasher.interface.ts   # ✅ Puerto de hash
│       └── token-generator.interface.ts   # ✅ Puerto de tokens
│
├── infrastructure/          # CAPA 3: Infraestructura (Adaptadores) ✅ IMPLEMENTADO
│   ├── persistence/         # Implementación de repositorios
│   │   ├── typeorm/
│   │   │   └── repositories/
│   │   │       └── user.repository.impl.ts  # ✅ Adaptador TypeORM
│   │   └── mappers/        # Domain ↔ ORM mappers
│   │       └── user.mapper.ts              # ✅ Mapper implementado
│   ├── security/           # Implementación de servicios
│   │   ├── bcrypt-password-hasher.ts       # ✅ Adaptador bcrypt
│   │   └── jwt-token-generator.ts          # ✅ Adaptador JWT
│   └── http/               # Controladores REST
│       ├── controllers/    # ✅ AuthController (legacy)
│       └── dto/           # ✅ DTOs de validación
│
└── shared/                  # CAPA TRANSVERSAL ✅ IMPLEMENTADO
    ├── encryption.service.ts  # ✅ AES-256-GCM
    └── logger.service.ts
```

### Principios Aplicados

#### 1. Dependency Inversion
```typescript
// ❌ MAL: Dependencia directa
class RegisterUserUseCase {
  constructor(
    private repo: TypeOrmUserRepository  // ← Acoplado a TypeORM
  ) {}
}

// ✅ BIEN: Dependencia de interfaz
class RegisterUserUseCase {
  constructor(
    private repo: IUserRepository  // ← Interfaz (puerto)
  ) {}
}
```

#### 2. Separation of Concerns
- **Domain**: Lógica de negocio pura (NO frameworks)
- **Application**: Orquestación (NO detalles técnicos)
- **Infrastructure**: Implementación (frameworks, DB, HTTP)

#### 3. Testability
```typescript
// Los use cases son fáciles de testear con mocks
const mockRepo = {
  findByEmail: jest.fn(),
  save: jest.fn()
};

const useCase = new RegisterUserUseCase(mockRepo, ...);
```

---

## 📊 CUMPLIMIENTO Y AUDITORÍA

### Logging de Eventos de Seguridad

```typescript
[SECURITY] Intento de login fallido - IP: 192.168.1.100 - User: admin
[SECURITY] SQL Injection detectado - IP: 10.0.0.5 - Pattern: UNION SELECT
[SECURITY] Rate limit excedido - IP: 172.16.0.10 - Bloqueado por 15 min
[SECURITY] Token expirado usado - User ID: 7058884a-6b4a-4aa2
[SECURITY] 2FA habilitado - User: luis.patino@guarne.pro
```

### Métricas en Prometheus

```promql
# Intentos de login fallidos por minuto
rate(auth_login_failed_total[1m])

# Usuarios bloqueados por rate limiting
security_blocked_ips_total

# Tokens expirados/inválidos
rate(jwt_invalid_total[5m])

# API keys decriptadas (uso)
rate(api_keys_decrypted_total[1m])
```

### Alertas en Grafana

```yaml
alerts:
  - name: Múltiples Intentos Fallidos
    condition: auth_login_failed_total > 10 in 1m
    action: Notificar equipo de seguridad

  - name: Posible Ataque SQL Injection
    condition: sql_injection_detected_total > 0
    action: Bloquear IP automáticamente

  - name: Rate Limit Masivo
    condition: security_blocked_ips_total > 50
    action: Activar modo defensivo
```

---

## ✅ CHECKLIST DE SEGURIDAD (Producción)

### Antes de Deploy

- [ ] Cambiar `JWT_SECRET` (generar nuevo)
- [ ] Cambiar `JWT_REFRESH_SECRET` (generar nuevo)
- [ ] Cambiar `ENCRYPTION_KEY` (generar nuevo con openssl)
- [ ] Cambiar credenciales de PostgreSQL
- [ ] Cambiar credenciales de Redis
- [ ] Cambiar credenciales de MinIO
- [ ] Habilitar TLS/SSL en PostgreSQL
- [ ] Configurar HTTPS (certificado SSL)
- [ ] Habilitar encriptación de volúmenes Docker
- [ ] Configurar backups automáticos de DB
- [ ] Revisar permisos de archivos (.env)
- [ ] Configurar firewall del servidor
- [ ] Habilitar fail2ban o similar
- [ ] Configurar monitoreo (Sentry, Datadog)
- [ ] Ejecutar audit de dependencias (npm audit)
- [ ] Escanear vulnerabilidades (Snyk, Trivy)

### Mantenimiento Continuo

- [ ] Rotar claves cada 90 días
- [ ] Revisar logs de seguridad semanalmente
- [ ] Actualizar dependencias mensualmente
- [ ] Auditoría de seguridad trimestral
- [ ] Penetration testing anual

---

## 📞 CONTACTO DE SEGURIDAD

**Reportar vulnerabilidades**: security@guarne.pro
**PGP Key**: [Disponible en keybase.io/guarne]

---

**Última actualización**: 2025-10-17
**Versión del documento**: 1.0
**Responsable de seguridad**: Equipo DevSecOps Guarne
