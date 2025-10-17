# 🚀 Guía de Inicio Rápido - Guarne Pro

## Requisitos Previos

- ✅ Node.js 18+ instalado
- ✅ pnpm instalado (`npm install -g pnpm`)
- ✅ Docker Desktop instalado y corriendo
- ✅ Git instalado

## Inicio Rápido (Windows)

### Opción 1: Script Automático (Recomendado)

1. Abre una terminal en la raíz del proyecto
2. Ejecuta el script de inicio:

```bash
.\start-dev.bat
```

Esto iniciará automáticamente:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- API Backend (puerto 4000)
- Frontend Web (puerto 3000)

### Opción 2: Manual

#### Paso 1: Iniciar Docker Desktop

Asegúrate de que Docker Desktop esté corriendo (ícono en la barra de tareas).

#### Paso 2: Iniciar Servicios de Base de Datos

```bash
cd infra
docker compose -f docker-compose.dev.yml up -d postgres redis
cd ..
```

Espera 5-10 segundos para que PostgreSQL termine de inicializar.

#### Paso 3: Iniciar API Backend

En una nueva terminal:

```bash
pnpm dev:api
```

Deberías ver:
```
╔════════════════════════════════════════╗
║  🚀 Guarne Pro API                    ║
║  📚 Docs: http://localhost:4000/api/docs
║  🌎 Zona: America/Bogota              ║
╚════════════════════════════════════════╝
```

#### Paso 4: Iniciar Frontend

En otra terminal:

```bash
pnpm dev:web
```

Deberías ver:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
✓ Ready in 5.9s
```

## Acceder a la Aplicación

### URLs Principales

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación web principal |
| **Registro** | http://localhost:3000/auth/register | Crear cuenta |
| **Login** | http://localhost:3000/auth/login | Iniciar sesión |
| **API Docs** | http://localhost:4000/api/docs | Documentación Swagger |
| **Grafana** | http://localhost:3001 | Monitoreo (admin/admin_guarne_2024) |
| **Prometheus** | http://localhost:9090 | Métricas |

### Credenciales de Prueba

```
Username: admin
Password: Admin123!@#
```

## Verificar que Todo Funciona

### 1. Verificar API

Abre http://localhost:4000/api/docs en tu navegador. Deberías ver la documentación de Swagger.

O usa curl:

```bash
curl http://localhost:4000/api/v1/auth/providers
```

Deberías ver un JSON con 12 plataformas de trading.

### 2. Verificar Frontend

Abre http://localhost:3000/auth/register

Deberías ver:
- ✅ Formulario de registro
- ✅ Lista de plataformas de trading cargadas (sin error)
- ✅ Checkboxes para seleccionar plataformas

### 3. Probar Registro de Usuario

1. Rellena el formulario
2. Selecciona al menos una plataforma
3. Click en "Crear Cuenta"
4. Deberías ser redirigido al dashboard

## Solución de Problemas

### Error: "Docker Desktop no está corriendo"

**Solución:** Abre Docker Desktop desde el menú de inicio de Windows.

### Error: "Error al cargar plataformas"

**Causas posibles:**

1. **La API no está corriendo en el puerto 4000**
   ```bash
   # Verificar
   curl http://localhost:4000/api/v1/auth/providers
   ```

2. **El frontend no tiene la variable de entorno correcta**

   Verifica que existe `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   ```

3. **PostgreSQL no está corriendo**
   ```bash
   docker ps | findstr postgres
   ```

   Si no aparece, inicia Docker Compose:
   ```bash
   cd infra
   docker compose -f docker-compose.dev.yml up -d postgres
   ```

### Error: "Port 3000 is already in use"

**Solución:** Mata el proceso que está usando el puerto:

```bash
# Encontrar el proceso
netstat -ano | findstr :3000

# Matar el proceso (reemplaza <PID> con el número que viste)
taskkill //F //PID <PID>
```

### Error: "Port 4000 is already in use"

**Solución:** Mata el proceso que está usando el puerto:

```bash
# Encontrar el proceso
netstat -ano | findstr :4000

# Matar el proceso (reemplaza <PID> con el número que viste)
taskkill //F //PID <PID>
```

## Detener Todos los Servicios

### Detener API y Frontend

Presiona `Ctrl+C` en las terminales donde están corriendo.

### Detener Docker

```bash
cd infra
docker compose -f docker-compose.dev.yml down
```

## Comandos Útiles

### Ver logs de PostgreSQL

```bash
docker logs guarne-postgres -f
```

### Ver logs de Redis

```bash
docker logs guarne-redis -f
```

### Reiniciar la base de datos (borra todos los datos)

```bash
cd infra
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d postgres redis
```

### Actualizar dependencias

```bash
pnpm install
```

### Ejecutar tests

```bash
# API tests
pnpm --filter api test

# Frontend tests
pnpm --filter web test
```

## Estructura de Puertos

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| 3000 | Frontend | Next.js |
| 4000 | API | NestJS |
| 5432 | PostgreSQL | Base de datos |
| 6379 | Redis | Cache/Sesiones |
| 9000 | MinIO | Object Storage |
| 9001 | MinIO Console | Interfaz web de MinIO |
| 9090 | Prometheus | Métricas |
| 3001 | Grafana | Dashboards |

## Próximos Pasos

1. Lee [CREDENTIALS.md](./docs/CREDENTIALS.md) para más detalles sobre credenciales
2. Lee [CLEAN_ARCHITECTURE.md](./docs/CLEAN_ARCHITECTURE.md) para entender la arquitectura
3. Lee [SECURITY.md](./docs/SECURITY.md) para buenas prácticas de seguridad
4. Explora la API en http://localhost:4000/api/docs

## Obtener Ayuda

Si tienes problemas:

1. Verifica que Docker Desktop esté corriendo
2. Verifica que todos los puertos estén libres
3. Revisa los logs de cada servicio
4. Lee la sección de "Solución de Problemas" arriba
5. Consulta [docs/CREDENTIALS.md](./docs/CREDENTIALS.md)
