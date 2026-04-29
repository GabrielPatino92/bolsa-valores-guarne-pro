# Baseline arquitectónico del monorepo JavaScript para Guarne Pro

- **Fecha**: 2026-04-27
- **Owner**: Senior Architect + HITL
- **Status**: draft
- **Issue relacionado**: #11 — architecture: definir baseline del monorepo JS para Guarne Pro

## Problema

El repo canónico `GabrielPatino92/bolsa-valores-guarne-pro` ya existe como monorepo con `pnpm` + `turbo`, pero su baseline técnico todavía no está fijado para la nueva dirección del proyecto.

Sin un baseline explícito, el equipo corre el riesgo de:

- reintroducir TypeScript por inercia
- mezclar patrones incompatibles
- acoplar el backend a un broker específico
- construir API sin contrato formal
- perder claridad sobre límites de apps, paquetes e infraestructura

## Contexto

El repo ya muestra una base de monorepo con:

- `apps/`
- `packages/`
- `infra/`
- `docs/`
- `scripts/`
- `pnpm-workspace.yaml`
- `turbo.json`

También existe intención previa de trabajar con especificación OpenAPI, reflejada en scripts raíz como:

- `api:docs`
- `api:lint`
- `generate:sdk`

Restricciones y preferencias aprobadas:

- **sin TypeScript**
- **frontend en React + Vite**
- **backend en Node.js**
- **base de datos en PostgreSQL**
- **autenticación con JWT**
- **OpenAPI/Swagger** como parte del baseline

## Goals

- Definir una arquitectura base clara para todo el repo
- Mantener el monorepo existente con `pnpm` + `turbo`
- Adoptar una implementación **JavaScript-first**
- Establecer `apps/web` y `apps/api` como puntos principales
- Usar **PostgreSQL** como persistencia principal
- Usar **JWT** como base de autenticación
- Adoptar **OpenAPI-first** para la API pública
- Definir límites limpios para futuras integraciones con brokers/plataformas

## Non-Goals

- No definir todavía todos los detalles de UI final
- No implementar aún todos los módulos de negocio
- No construir todavía todos los adapters reales de brokers
- No partir el backend en microservicios desde el día 1

## Decisiones arquitectónicas

### 1. Se conserva el monorepo

El repo seguirá usando:

- `pnpm workspace`
- `turbo`

**Razón**:

- ya están integrados al repo
- permiten escalar por apps y paquetes sin fragmentar repos
- reducen caos operativo frente a múltiples repos tempranos

### 2. La implementación inicial será JavaScript-first

La implementación de la primera fase será en **JavaScript**, no TypeScript.

**Compensación obligatoria**:

- validación de entrada/salida
- contratos OpenAPI
- esquemas explícitos
- tests
- convenciones fuertes de estructura

### 3. El frontend vivirá en `apps/web`

`apps/web` será una aplicación:

- **React**
- **Vite**
- **JavaScript**

**Responsabilidades**:

- autenticación y sesión del usuario
- dashboard/base UI
- consumo de API backend
- manejo de estado UI y flujos de usuario

**Estructura objetivo mínima**:

- `src/app`
- `src/features`
- `src/shared`
- `src/services`

### 4. El backend vivirá en `apps/api`

`apps/api` será un backend Node.js.

**Responsabilidades**:

- exponer API HTTP
- auth JWT
- acceso a PostgreSQL
- validación
- logging y manejo centralizado de errores
- orquestación de integraciones externas

**Principio importante**:

El backend inicial será un **modular monolith**, no microservicios.

### 5. PostgreSQL será la base de datos principal

PostgreSQL será la fuente primaria de verdad para:

- usuarios
- sesiones/tokens
- cuentas de integración
- configuraciones persistentes
- auditoría operativa inicial

### 6. JWT será la base de autenticación

La autenticación se basará en:

- **access token**
- **refresh token**

**Baseline recomendado**:

- access token de corta vida
- refresh token con control de revocación
- persistencia segura del refresh token cuando aplique

### 7. La API será OpenAPI-first

La capa pública del backend se diseñará con **OpenAPI** como contrato principal.

**Esto implica**:

- spec central en `specs/openapi.yaml`
- JWT documentado en el spec
- request/response schemas definidos explícitamente
- errores documentados
- `api:lint` como validación contractual
- Swagger UI / Redoc como capa de consulta y testing documental

### 8. Swagger se usará como interfaz de inspección, no como sustituto del contrato

- **OpenAPI** = contrato
- **Swagger UI** = exploración y prueba
- **Redocly** = lint/documentación formal

### 9. Las integraciones con brokers irán detrás de adapters

Las conexiones con plataformas de trading no deben mezclarse directamente con controladores HTTP ni lógica de auth.

Se definirá una frontera de adapters para:

- auth por proveedor
- cuentas
- balances
- posiciones
- órdenes
- errores
- rate limits
- sandbox/mocks

## Estructura objetivo del repo

### `apps/web`

Frontend React + Vite.

### `apps/api`

Backend Node.js + PostgreSQL + JWT + OpenAPI.

### `packages/`

Reservado para reutilización real:

- SDKs generados
- utilidades compartidas
- contratos consumibles
- componentes comunes si aparecen de forma justificada

### `infra/`

Infraestructura local y de entorno:

- docker compose
- postgres local
- scripts de bootstrap
- configuración de servicios auxiliares

## Principios de validación y calidad

Como el proyecto no usará TypeScript inicialmente, se establecen estos mínimos:

- validación en todos los límites de entrada
- esquemas explícitos para requests y responses
- contratos OpenAPI actualizados como parte del trabajo
- manejo centralizado de errores
- smoke tests mínimos por app
- linting y formatting consistentes
- checks de arranque/health
- documentación operativa reproducible

## Riesgos

### Riesgo 1 — Sin TypeScript puede aumentar el riesgo de errores en runtime

**Mitigación**: OpenAPI + validación + tests + estructura fuerte.

### Riesgo 2 — El repo actual ya tiene una dirección previa distinta

**Mitigación**: dejar esta spec como baseline oficial antes del scaffolding.

### Riesgo 3 — Integraciones con brokers pueden contaminar el core

**Mitigación**: forzar adapters y boundaries explícitos desde el inicio.

### Riesgo 4 — “Microservicios” demasiado pronto

**Mitigación**: empezar con modular monolith y extraer solo cuando el dominio lo justifique.

## Acceptance Criteria

- [ ] Existe un documento de arquitectura o ADR con la decisión base del stack
- [ ] El documento explica por qué se mantiene `pnpm` + `turbo`
- [ ] El documento explica por qué la implementación inicial será JavaScript-first y no TypeScript
- [ ] El documento define los límites de `apps/web`, `apps/api`, `packages` e `infra`
- [ ] El documento define principios de validación, seguridad y testing mínimos
- [ ] El documento incorpora OpenAPI-first como contrato de la API
- [ ] El documento deja claro el papel de Swagger UI y Redocly
- [ ] La arquitectura deja claro qué queda fuera del alcance inicial
