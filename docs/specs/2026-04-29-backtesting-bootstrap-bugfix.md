# Spec — Bugfix de bootstrap en `/backtesting`

- **Fecha**: 2026-04-29
- **Tipo**: bugfix

## Problema

La pantalla `/backtesting` esperaba a que terminara la carga del catálogo completo de símbolos antes de:

- fijar el símbolo inicial
- pedir velas históricas
- abrir el stream realtime

Cuando `/market-data/symbols` tardaba, la UI parecía congelada:

- selector vacío
- stream inactivo
- velas en `0`
- sin progreso visible

## Objetivo

Permitir que la pantalla arranque con progreso visible aunque el catálogo completo de símbolos todavía esté cargando.

## Diseño elegido

- iniciar con `BTCUSDT` por defecto
- permitir que histórico + realtime arranquen usando ese símbolo inicial
- no bloquear toda la experiencia mientras llegan los símbolos
- mostrar una opción temporal en el selector mientras el catálogo sigue vacío

## Acceptance Criteria

- `/backtesting` ya no parece congelado mientras carga símbolos
- el histórico puede cargar con `BTCUSDT` aunque el catálogo aún no haya llegado
- el stream puede intentar conectar sin esperar todos los símbolos
- el selector no queda visualmente vacío durante la carga inicial
