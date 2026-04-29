# Spec — Gráfico candlestick real en la pantalla de backtesting

- **Fecha**: 2026-04-29
- **Issue**: #30
- **Estado**: implemented

## Problema

La pantalla `/backtesting` ya consumía histórico REST y realtime por WebSocket, pero solo renderizaba una tabla de velas. Faltaba la visualización natural del dominio: un gráfico candlestick real.

Además, el `snapshot` del stream podía reemplazar el histórico visible con solo las últimas 5 velas, afectando la experiencia visual del gráfico.

## Decisión

Se integra `lightweight-charts` como librería de charting y se añade un componente `CandlestickChart` que:

- dibuja velas OHLC a partir del array `candles`
- convierte timestamps de milisegundos a segundos para el chart
- usa `setData(...)` para carga inicial y resets
- usa `update(...)` para cambios realtime
- mantiene la tabla debajo como vista de depuración

Adicionalmente, el hook frontend deja de reemplazar el histórico por el `snapshot` de 5 velas y ahora hace merge incremental para preservar el contexto visible.

## Límites

### Sí entra
- gráfico candlestick de precio
- histórico REST + realtime WS
- tabla sigue visible
- UI en español
- atribución visible a TradingView Lightweight Charts

### No entra
- panel de volumen
- indicadores técnicos
- zoom/pan avanzado documentado
- motor real de backtesting

## Acceptance Criteria

- [x] `/backtesting` muestra un gráfico candlestick real
- [x] el gráfico usa el histórico REST existente
- [x] el gráfico se actualiza con el stream realtime existente
- [x] los updates realtime modifican la última vela sin duplicarla
- [x] la tabla sigue disponible
- [x] el histórico visible no colapsa a 5 velas al conectar snapshot
- [x] la UI del gráfico se mantiene en español
- [x] se deja atribución visible a la librería
