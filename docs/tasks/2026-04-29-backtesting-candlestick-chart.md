# Task Plan — Gráfico candlestick real en backtesting

- **Fecha**: 2026-04-29
- **Issue**: #30
- **Estado**: completed

## Tareas ejecutadas

1. Añadir `lightweight-charts` al frontend
2. Crear adaptador de datos para el chart
3. Crear componente `CandlestickChart`
4. Integrar el gráfico en `BacktestingPage`
5. Mantener la tabla debajo como vista secundaria
6. Corregir el merge de `snapshot` para no perder histórico visible
7. Añadir estilos mínimos del chart
8. Mantener labels y copy en español

## Verificación prevista

- render de gráfico en `/backtesting`
- histórico REST visible
- stream conectado
- última vela actualizándose sin duplicados
- tabla aún presente debajo del gráfico
