# ADR ? Binance websocket backend-owned con resync REST + DB

- **Fecha**: 2026-04-28
- **Estado**: accepted
- **Relacionado**: #21

## Decisi?n
El backend es due?o tanto de la conexi?n websocket upstream a Binance como del websocket downstream expuesto a clientes locales/frontend.

## Razones
- evita acoplar el frontend a Binance
- centraliza reconexi?n, resync y normalizaci?n de mensajes
- reutiliza la persistencia hist?rica ya construida en #20
- prepara la futura convivencia con m?ltiples providers

## Consecuencias
### Positivas
- un solo punto de control para lifecycle de streams
- resincronizaci?n coherente con DB raw
- contrato estable hacia el frontend

### Negativas
- m?s responsabilidad operativa en backend
- todav?a falta un contrato machine-readable espec?fico de websocket (seguimiento posterior)

## No decisiones en esta ADR
- no se introduce Redis
- no se introduce order book / trades / ticker
- no se formaliza AsyncAPI en esta fase
