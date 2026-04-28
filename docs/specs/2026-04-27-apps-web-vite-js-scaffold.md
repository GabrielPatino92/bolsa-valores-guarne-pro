# Scaffold limpio de apps/web con React + Vite + JavaScript

- **Fecha**: 2026-04-27
- **Owner**: Senior Architect + HITL
- **Status**: implemented
- **Issue relacionado**: #13 ? frontend: scaffold profesional de apps/web con React + Vite en JavaScript

## Problema

El directorio `apps/web` estaba anclado a Next.js + TypeScript y ya mezclaba estructura de App Router con componentes de dominio. Eso chocaba con el baseline aprobado para el repo: React + Vite + JavaScript.

## Objetivo

Sustituir la base estructural de `apps/web` por un scaffold limpio, m?nimo y profesional en React + Vite + JavaScript, sin arrastrar Next.js, TypeScript ni Tailwind por inercia.

## Decisiones

- `apps/web` sigue siendo la app frontend oficial del monorepo.
- Se mantiene el paquete `@guarne/web`.
- Se elimina la dependencia estructural de Next.js.
- Se elimina TypeScript del scaffold nuevo.
- El routing base usa `react-router-dom` v6 deliberadamente, no la l?nea latest v7, porque la propia p?gina de npm marca `react-router-dom` como paquete de compatibilidad en v7 y mantiene un tag `version-6` estable.
- El scaffold inicial usa solo React, Vite, router, Axios y Vitest.
- Los features reales se sustituyen por placeholders expl?citos hasta cerrar backend, auth y datos.

## Estructura objetivo

```text
apps/web/
??? index.html
??? package.json
??? vite.config.js
??? src/
?   ??? main.jsx
?   ??? app/
?   ?   ??? App.jsx
?   ?   ??? router.jsx
?   ?   ??? providers.jsx
?   ?   ??? styles.css
?   ??? features/
?   ?   ??? home/pages/HomePage.jsx
?   ?   ??? auth/pages/LoginPage.jsx
?   ?   ??? dashboard/pages/DashboardPage.jsx
?   ?   ??? backtesting/pages/BacktestingPage.jsx
?   ??? shared/
?   ?   ??? layout/AppLayout.jsx
?   ?   ??? ui/PlaceholderCard.jsx
?   ??? services/
?       ??? env.js
?       ??? http/client.js
??? test/
    ??? app.smoke.test.jsx
```

## Acceptance Criteria

- [x] `apps/web` ya no depende de Next.js para arrancar
- [x] el scaffold nuevo corre con Vite a nivel de estructura
- [x] el paquete sigue siendo `@guarne/web`
- [x] existe estructura `app/features/shared/services`
- [x] hay rutas placeholder m?nimas
- [x] hay al menos un smoke test
- [x] `build` apunta a `dist/`
- [x] no quedan archivos estructurales de Next en `apps/web`
- [x] la ra?z deja de depender solo de `NEXT_PUBLIC_*` para el frontend futuro

## Riesgos

- Las dependencias nuevas de Vite/Vitest requieren instalaci?n local para validaci?n completa.
- El repo sigue conteniendo backend y paquetes legacy TypeScript; esta implementaci?n solo sanea el frontend base.
