# 📊 Monitoreo y Backtesting - Guarne Pro

## Parte 1: Servicios de Monitoreo

### Grafana (Puerto 3001)

**¿Qué es?**
Grafana es una plataforma de visualización y análisis de métricas. Te permite crear dashboards para monitorear el rendimiento de tu aplicación en tiempo real.

**Credenciales:**
```
URL: http://localhost:3001
Usuario: admin
Contraseña: admin_guarne_2024
```

**¿Para qué sirve en Guarne Pro?**
- Ver cuántas requests por segundo recibe la API
- Monitorear tiempo de respuesta de endpoints
- Detectar errores y problemas de rendimiento
- Visualizar actividad de usuarios
- Monitorear uso de CPU y memoria
- Alertas cuando algo anda mal

**Dashboards que tendrás:**
1. **API Performance**: Tiempo de respuesta, requests/seg, errores
2. **Database Metrics**: Queries lentas, conexiones activas
3. **Trading Activity**: Órdenes ejecutadas, volumen operado
4. **User Activity**: Usuarios activos, registros nuevos

---

### Prometheus (Puerto 9090)

**¿Qué es?**
Prometheus es una base de datos de series temporales que recolecta y almacena métricas de tu aplicación cada pocos segundos.

**URL:** http://localhost:9090

**¿Para qué sirve?**
- **Recolecta métricas** de la API automáticamente
- Almacena historial de métricas (CPU, memoria, requests, etc.)
- Grafana lee de Prometheus para crear los dashboards
- Permite crear alertas (ej: "avisar si CPU > 80%")

**Ejemplo de uso:**
```
# Query para ver requests por segundo
rate(http_requests_total[5m])

# Query para ver tiempo de respuesta promedio
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**Relación con Grafana:**
```
Tu API → genera métricas → Prometheus las guarda → Grafana las visualiza
```

---

## Parte 2: Sistema de Backtesting

### Visión General del Sistema

Basándome en tus requisitos, voy a crear un **motor de backtesting profesional** similar a TradingView pero integrado en Guarne Pro.

### Funcionalidades Requeridas

#### 1. **Gráficos en Tiempo Real**
- Integración con TradingView Widgets (gratis, sin pagar licencia)
- Actualización en tiempo real desde exchanges
- Soporte para todas las temporalidades:
  - `1m, 3m, 5m, 15m, 30m` (Scalping/Intraday)
  - `1h, 2h, 4h` (Day trading)
  - `1D, 1W, 1M` (Swing/Position trading)

#### 2. **Indicadores Técnicos**
Panel de indicadores similar a TradingView con:
- **Tendencia**: SMA, EMA, MACD, ADX, Ichimoku
- **Momentum**: RSI, Stochastic, CCI, Williams %R
- **Volumen**: OBV, Volume Profile, VWAP
- **Volatilidad**: Bollinger Bands, ATR, Keltner Channels
- **Soporte/Resistencia**: Fibonacci, Pivot Points

**Personalización:**
- Cambiar períodos (ej: RSI de 14 a 21)
- Cambiar colores
- Múltiples indicadores simultáneos
- Guardar configuraciones como "plantillas"

#### 3. **Motor de Backtesting**

**Características:**
- ✅ **Reproducción paso a paso** ("Play" frame por frame)
- ✅ **Control de velocidad** (1x, 2x, 5x, 10x)
- ✅ **Pausa en cualquier momento**
- ✅ **Saltar a fecha específica**
- ✅ **Eliminar operaciones** y volver a intentar
- ✅ **Anotar estrategias** en el gráfico

**Flujo de trabajo:**
1. Seleccionar par de trading (ej: BTC/USDT)
2. Seleccionar rango de fechas (ej: Enero 2024 - Marzo 2024)
3. Configurar indicadores
4. Presionar "Play" para reproducir velas históricas
5. Colocar órdenes (BUY/SELL) como si fuera real
6. Ver resultados: P&L, Win Rate, Sharpe Ratio

**Métricas calculadas:**
- Profit & Loss total
- Win Rate (% operaciones ganadoras)
- Avg Win / Avg Loss
- Max Drawdown
- Sharpe Ratio
- Profit Factor

#### 4. **Guardado de Estrategias**
- Nombre de estrategia
- Descripción
- Indicadores usados
- Condiciones de entrada/salida
- Resultados históricos
- Gráficos anotados

---

### Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ TradingView  │  │  Backtesting │  │  Indicators  │ │
│  │   Widget     │  │    Engine    │  │    Panel     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API (NestJS)                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Market     │  │  Backtest    │  │  Strategy    │ │
│  │    Data      │  │   Service    │  │    Store     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              TimescaleDB (PostgreSQL)                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   OHLCV      │  │  Backtest    │  │ Strategies   │ │
│  │    Data      │  │   Results    │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### Plan de Implementación

#### Fase 1: Gráficos en Tiempo Real (Semana 1-2)

**Tareas:**
1. Integrar TradingView Lightweight Charts (gratis)
2. Conectar con API de Binance/Coinbase para datos real-time
3. Implementar selector de temporalidades
4. WebSocket para updates en vivo

**Archivos a crear:**
```
apps/web/src/components/trading/
├── TradingChart.tsx          # Componente principal del gráfico
├── ChartControls.tsx         # Controles (timeframe, play/pause)
├── IndicatorPanel.tsx        # Panel de indicadores
└── types.ts                  # Tipos TypeScript
```

#### Fase 2: Panel de Indicadores (Semana 3)

**Tareas:**
1. Crear librería de indicadores técnicos
2. UI para agregar/remover indicadores
3. Personalización de parámetros
4. Guardar configuraciones

**Archivos a crear:**
```
packages/indicators/
├── trend/
│   ├── sma.ts
│   ├── ema.ts
│   └── macd.ts
├── momentum/
│   ├── rsi.ts
│   └── stochastic.ts
└── index.ts

apps/api/src/modules/indicators/
├── indicators.service.ts     # Calcular indicadores
├── indicators.controller.ts
└── dto/
    └── calculate-indicator.dto.ts
```

#### Fase 3: Motor de Backtesting (Semana 4-5)

**Tareas:**
1. Crear motor de replay de datos históricos
2. Implementar simulador de órdenes
3. Calcular métricas de performance
4. UI para controlar reproducción

**Archivos a crear:**
```
apps/api/src/modules/backtesting/
├── domain/
│   ├── backtest.entity.ts
│   ├── trade.entity.ts
│   └── strategy.entity.ts
├── application/
│   ├── run-backtest.use-case.ts
│   ├── calculate-metrics.use-case.ts
│   └── save-strategy.use-case.ts
└── infrastructure/
    ├── backtest.repository.ts
    └── market-data.provider.ts
```

#### Fase 4: Guardado y Análisis (Semana 6)

**Tareas:**
1. Guardar backtests en base de datos
2. Comparar estrategias
3. Exportar reportes (PDF, CSV)
4. Compartir estrategias

---

### Datos de Mercado: ¿De Dónde Vienen?

**Fuentes de datos GRATUITAS:**

1. **Binance API** (Recomendado)
   - Gratis, sin límites para lectura
   - Datos históricos de 1m hasta años atrás
   - Real-time WebSocket
   - Todas las criptomonedas principales

2. **Alpha Vantage**
   - Gratis para acciones (500 requests/día)
   - Datos de NYSE, NASDAQ

3. **Yahoo Finance**
   - Gratis, sin límites
   - Acciones, índices, forex

**Estrategia:**
- Para crypto: Binance
- Para acciones: Yahoo Finance + Alpha Vantage
- Almacenar en TimescaleDB para análisis rápido

---

### Ejemplo de UI

```typescript
// apps/web/src/app/backtesting/page.tsx
export default function BacktestingPage() {
  return (
    <div className="h-screen flex">
      {/* Panel izquierdo: Configuración */}
      <div className="w-80 bg-gray-800 p-4">
        <h2>Configuración</h2>
        <select>
          <option>BTC/USDT</option>
          <option>ETH/USDT</option>
        </select>

        <DateRangePicker />

        <IndicatorSelector
          selected={['RSI', 'EMA20', 'MACD']}
        />

        <button onClick={runBacktest}>
          ▶️ Iniciar Backtest
        </button>
      </div>

      {/* Centro: Gráfico */}
      <div className="flex-1">
        <TradingChart
          symbol="BTCUSDT"
          interval="1h"
          mode="backtest" // vs "live"
        />

        {/* Controles de reproducción */}
        <div className="controls">
          <button>⏮️</button>
          <button>⏸️ Pausa</button>
          <button>⏭️</button>
          <select>
            <option>1x</option>
            <option>2x</option>
            <option>10x</option>
          </select>
        </div>
      </div>

      {/* Panel derecho: Métricas */}
      <div className="w-80 bg-gray-800 p-4">
        <h2>Resultados</h2>
        <div>
          <span>P&L:</span>
          <span className="text-green-400">+$1,245</span>
        </div>
        <div>
          <span>Win Rate:</span>
          <span>65%</span>
        </div>
        <div>
          <span>Trades:</span>
          <span>23</span>
        </div>
      </div>
    </div>
  );
}
```

---

### Próximos Pasos Inmediatos

1. **Hoy**: Configurar credenciales de Grafana y Prometheus
2. **Mañana**: Integrar TradingView Lightweight Charts
3. **Esta semana**: Implementar datos real-time de Binance
4. **Próxima semana**: Motor de backtesting básico

¿Quieres que empiece con alguna parte específica del backtesting ahora?
