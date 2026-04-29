# Task Plan — Bugfix de bootstrap en `/backtesting`

## Task 1 — bootstrap optimista del símbolo
- Inicializar `selectedSymbol` con `BTCUSDT`
- Verificación: la carga histórica puede arrancar sin esperar la lista completa

## Task 2 — no bloquear toda la pantalla por la carga de símbolos
- Ajustar el estado de loading para que no oculte chart/tabla si ya hay velas
- Verificación: la UI muestra progreso real en cuanto llegan velas

## Task 3 — evitar selector visualmente vacío
- Mostrar el símbolo seleccionado como opción temporal si el catálogo aún no llegó
- Verificación: el selector ya no aparece en blanco durante el bootstrap
