# 🔐 Credenciales de Acceso - Guarne Pro

## 📋 Índice
1. [API Backend (NestJS)](#api-backend-nestjs)
2. [Frontend Web (Next.js)](#frontend-web-nextjs)
3. [Base de Datos PostgreSQL](#base-de-datos-postgresql)
4. [Grafana](#grafana)
5. [Prometheus](#prometheus)
6. [MinIO (S3)](#minio-s3)
7. [Redis](#redis)

---

## 🚀 API Backend (NestJS)

### URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **API Base** | http://localhost:4000/api/v1 | ✅ |
| **Swagger Docs** | http://localhost:4000/api/docs | ✅ |
| **Health Check** | http://localhost:4000/api/health | ✅ |
| **Metrics** | http://localhost:4000/api/api/v1/metrics | ✅ |

### Endpoints Principales

```bash
# Registro de Usuario
POST http://localhost:4000/api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "username": "miusuario",
  "password": "MiPassword123!@#",
  "fullName": "Nombre Completo",
  "providerIds": []
}

# Login
POST http://localhost:4000/api/v1/auth/login
Content-Type: application/json

{
  "emailOrUsername": "admin",
  "password": "Admin123!@#"
}

# Obtener Plataformas
GET http://localhost:4000/api/v1/auth/providers
```

### Usuarios de Prueba

#### 👤 Usuario Administrador
```
Email: admin@guarne.pro
Username: admin
Password: Admin123!@#
```

**Usar con:**
- Swagger UI: http://localhost:4000/api/docs
- Postman
- curl
- Frontend Next.js

#### 👤 Otros Usuarios Existentes
```
# Usuario 1
Email: lugapazucash@gmail.com
Username: lugapazucash
Password: [Desconocido - cambiar en BD]

# Usuario 2
Email: prueba@example.com
Username: usertest
Password: [Desconocido - cambiar en BD]
```

---

## 🌐 Frontend Web (Next.js)

### URLs de Acceso

| Página | URL | Estado |
|--------|-----|--------|
| **Home** | http://localhost:3000 | ✅ |
| **Login** | http://localhost:3000/auth/login | ✅ |
| **Register** | http://localhost:3000/auth/register | ✅ |
| **Dashboard** | http://localhost:3000/dashboard | 🔒 Requiere Auth |

### Credenciales de Acceso

Usa las mismas credenciales del API Backend:

```
Username: admin
Password: Admin123!@#
```

### Configuración

El frontend se conecta automáticamente a:
- API: `http://localhost:4000/api/v1`
- WebSocket: `ws://localhost:4000`

---

## 💾 Base de Datos PostgreSQL

### Conexión Directa

```bash
# Con Docker
docker exec -it guarne-postgres psql -U guarne_dev -d guarne_trading

# Con psql local
psql postgresql://guarne_dev:guarne_dev_pass_2024@localhost:5432/guarne_trading
```

### Credenciales

```
Host: localhost
Port: 5432
Database: guarne_trading
Username: guarne_dev
Password: guarne_dev_pass_2024
```

### Herramientas GUI Compatibles

#### DBeaver
```
URL: jdbc:postgresql://localhost:5432/guarne_trading
Driver: PostgreSQL
User: guarne_dev
Password: guarne_dev_pass_2024
```

#### pgAdmin
```
Hostname: localhost
Port: 5432
Maintenance database: guarne_trading
Username: guarne_dev
Password: guarne_dev_pass_2024
```

### Queries Útiles

```sql
-- Ver usuarios
SELECT id, email, username, is_active, email_verified, created_at
FROM users
ORDER BY created_at DESC;

-- Ver plataformas disponibles
SELECT id, name, provider_name, supports_live_trading, supports_paper_trading
FROM providers
ORDER BY name;

-- Contar usuarios activos
SELECT COUNT(*) FROM users WHERE is_active = true;

-- Ver conexiones de usuario a plataformas
SELECT
  u.username,
  u.email,
  p.name as platform_name,
  up.is_active,
  up.created_at
FROM user_providers up
JOIN users u ON u.id = up.user_id
JOIN providers p ON p.id = up.provider_id
ORDER BY up.created_at DESC;
```

---

## 📊 Grafana

### URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **Grafana UI** | http://localhost:3001 | ✅ |

### Credenciales por Defecto

```
Username: admin
Password: admin
```

**⚠️ Importante**:
- En el primer login, Grafana pedirá cambiar la contraseña
- Para desarrollo, puedes usar `admin/admin`
- Para producción, **CAMBIAR INMEDIATAMENTE**

### Configuración de Data Sources

#### Prometheus
```
Name: Prometheus
Type: Prometheus
URL: http://prometheus:9090
Access: Server (default)
```

#### PostgreSQL (si se configura)
```
Name: Guarne DB
Type: PostgreSQL
Host: postgres:5432
Database: guarne_trading
User: guarne_dev
Password: guarne_dev_pass_2024
SSL Mode: disable
```

### Dashboards Recomendados

1. **API Metrics**: Métricas HTTP de NestJS
2. **Database Performance**: Queries de PostgreSQL
3. **System Resources**: CPU, RAM, Disk

---

## 🔍 Prometheus

### URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **Prometheus UI** | http://localhost:9090 | ✅ |
| **Query Interface** | http://localhost:9090/query | ✅ |
| **Targets** | http://localhost:9090/targets | ✅ |
| **Alerts** | http://localhost:9090/alerts | ✅ |

### Sin Credenciales

Prometheus **NO** requiere autenticación en modo desarrollo.

### Targets Configurados

```
# API Backend
http://api:3000/api/api/v1/metrics

# Node Exporter (si está configurado)
http://node-exporter:9100/metrics
```

### Queries Útiles

```promql
# Tasa de requests HTTP
rate(http_requests_total[5m])

# Latencia promedio
http_request_duration_seconds_sum / http_request_duration_seconds_count

# Errores 5xx
http_requests_total{status=~"5.."}

# Uso de CPU del API
process_cpu_seconds_total
```

---

## 🗄️ MinIO (S3)

### URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **MinIO Console** | http://localhost:9001 | ✅ |
| **MinIO API** | http://localhost:9000 | ✅ |

### Credenciales

```
Access Key: guarne_minio
Secret Key: guarne_minio_pass_2024
```

### Buckets Configurados

```
# Backtests
guarne-backtests

# Exports
guarne-exports
```

### AWS CLI Compatible

```bash
# Configurar AWS CLI para MinIO
aws configure --profile minio
AWS Access Key ID: guarne_minio
AWS Secret Access Key: guarne_minio_pass_2024
Default region name: us-east-1
Default output format: json

# Listar buckets
aws --profile minio --endpoint-url http://localhost:9000 s3 ls

# Subir archivo
aws --profile minio --endpoint-url http://localhost:9000 s3 cp archivo.json s3://guarne-backtests/
```

---

## 🔴 Redis

### Conexión

```bash
# CLI
redis-cli -h localhost -p 6379

# Con Docker
docker exec -it guarne-redis redis-cli
```

### Credenciales

```
Host: localhost
Port: 6379
Password: [Ninguna en desarrollo]
Database: 0
```

### Comandos Útiles

```redis
# Ver todas las keys
KEYS *

# Ver info del servidor
INFO

# Ver memoria usada
INFO memory

# Limpiar todo (¡CUIDADO!)
FLUSHALL
```

---

## 🐳 Docker Compose

### Levantar Todos los Servicios

```bash
# Desde la raíz del proyecto
cd infra
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Ver estado
docker-compose -f docker-compose.dev.yml ps

# Detener todo
docker-compose -f docker-compose.dev.yml down
```

### Servicios Individuales

```bash
# Solo PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# Solo Redis
docker-compose -f docker-compose.dev.yml up -d redis

# Solo MinIO
docker-compose -f docker-compose.dev.yml up -d minio

# Solo Monitoring (Prometheus + Grafana)
docker-compose -f docker-compose.dev.yml up -d prometheus grafana
```

---

## 🔧 Solución de Problemas

### Error 404 en localhost:3000

**Problema**: `{"message":"Cannot GET /","error":"Not Found","statusCode":404}`

**Solución**:
- La API está en `/api/v1`, no en la raíz
- Usar: http://localhost:3000/api/v1/auth/providers
- Swagger: http://localhost:3000/api/docs

### Error de Conexión PostgreSQL

**Problema**: `connection refused` o `database does not exist`

**Solución**:
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep postgres

# Reiniciar PostgreSQL
docker-compose -f infra/docker-compose.dev.yml restart postgres

# Ver logs
docker logs guarne-postgres
```

### Grafana: Invalid username or password

**Problema**: No puedes entrar a Grafana

**Solución**:
1. Credenciales por defecto: `admin / admin`
2. Si cambiaste la contraseña y la olvidaste:
```bash
# Reset password
docker exec -it guarne-grafana grafana-cli admin reset-admin-password nuevaPassword123
```

### Puerto en Uso

**Problema**: `EADDRINUSE: address already in use 0.0.0.0:3000`

**Solución**:
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

---

## 📝 Notas de Seguridad

### ⚠️ SOLO PARA DESARROLLO

Las credenciales en este documento son **SOLO PARA DESARROLLO LOCAL**.

### ✅ Para Producción:

1. **Cambiar TODAS las contraseñas**
2. **Usar variables de entorno secretas**
3. **Habilitar HTTPS/TLS**
4. **Configurar firewall**
5. **Implementar rate limiting**
6. **Usar secrets manager** (AWS Secrets Manager, HashiCorp Vault, etc.)

### 🔐 Variables de Entorno Críticas

```bash
# ¡CAMBIAR EN PRODUCCIÓN!
JWT_SECRET=<generar-con-openssl-rand-hex-32>
JWT_REFRESH_SECRET=<generar-con-openssl-rand-hex-32>
ENCRYPTION_KEY=<generar-con-openssl-rand-hex-32>
DATABASE_PASSWORD=<contraseña-fuerte>
S3_SECRET_KEY=<clave-segura-s3>
```

### Generar Secrets Seguros

```bash
# JWT Secret (32 bytes)
openssl rand -hex 32

# Encryption Key (32 bytes)
openssl rand -hex 32

# Password fuerte
openssl rand -base64 24
```

---

## 📚 Referencias

- [API Documentation](http://localhost:4000/api/docs)
- [SECURITY.md](./SECURITY.md) - Documentación de seguridad
- [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) - Arquitectura del proyecto
- [README.md](../README.md) - Documentación general

---

**Última actualización**: 2025-10-17
**Versión del documento**: 1.0
**Autor**: Equipo DevSecOps Guarne
