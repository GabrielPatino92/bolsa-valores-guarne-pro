# 🚀 Continuar Implementación - Código Completo

## ✅ Ya Creados

- ✅ `apps/web/src/components/trading/TradingChart.tsx`
- ✅ `apps/web/src/components/trading/TimeframeSelector.tsx`

## 📝 Archivos Pendientes por Crear

Copia y pega el código siguiente en los archivos indicados:

---

### 1. Hook de Reproducción

**Archivo**: `apps/web/src/hooks/useBacktestPlayer.ts`

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { CandlestickData } from 'lightweight-charts';

export type PlaybackSpeed = 1 | 2 | 5 | 10 | 20 | 50 | 100;

export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  speed: PlaybackSpeed;
  totalCandles: number;
}

export function useBacktestPlayer(candles: CandlestickData[]) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentIndex: 0,
    speed: 1,
    totalCandles: candles.length,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setState(prev => ({ ...prev, currentIndex: 0 }));
  }, [pause]);

  const forward = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.totalCandles - 1),
    }));
  }, []);

  const backward = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const jumpTo = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.totalCandles - 1)),
    }));
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      const interval = 1000 / state.speed;

      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextIndex = prev.currentIndex + 1;

          if (nextIndex >= prev.totalCandles) {
            pause();
            return prev;
          }

          return { ...prev, currentIndex: nextIndex };
        });
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.isPlaying, state.speed, pause]);

  useEffect(() => {
    setState(prev => ({ ...prev, totalCandles: candles.length }));
  }, [candles.length]);

  const visibleCandles = candles.slice(0, state.currentIndex + 1);
  const currentCandle = candles[state.currentIndex];

  return {
    state,
    visibleCandles,
    currentCandle,
    play,
    pause,
    reset,
    forward,
    backward,
    setSpeed,
    jumpTo,
  };
}
```

---

### 2. Controles de Reproducción

**Archivo**: `apps/web/src/components/trading/PlaybackControls.tsx`

```typescript
'use client';

import { PlaybackSpeed } from '@/hooks/useBacktestPlayer';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalCandles: number;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onForward: () => void;
  onBackward: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onSeek: (index: number) => void;
}

export function PlaybackControls({
  isPlaying,
  currentIndex,
  totalCandles,
  speed,
  onPlay,
  onPause,
  onReset,
  onForward,
  onBackward,
  onSpeedChange,
  onSeek,
}: PlaybackControlsProps) {
  const progress = totalCandles > 0 ? (currentIndex / totalCandles) * 100 : 0;
  const speeds: PlaybackSpeed[] = [1, 2, 5, 10, 20, 50, 100];

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4 border border-gray-700">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Vela {currentIndex + 1} de {totalCandles}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalCandles - 1)}
          value={currentIndex}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Reiniciar"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={onBackward}
          disabled={currentIndex === 0}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Retroceder"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            title="Reproducir"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            title="Pausar"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}

        <button
          onClick={onForward}
          disabled={currentIndex >= totalCandles - 1}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adelantar"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </button>

        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value) as PlaybackSpeed)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600"
        >
          {speeds.map(s => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

---

### 3. Página de Backtesting

**Archivo**: `apps/web/src/app/backtesting/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CandlestickData } from 'lightweight-charts';
import { TradingChart } from '@/components/trading/TradingChart';
import { TimeframeSelector } from '@/components/trading/TimeframeSelector';
import { PlaybackControls } from '@/components/trading/PlaybackControls';
import { useBacktestPlayer } from '@/hooks/useBacktestPlayer';

// Datos de muestra - Reemplazar con datos reales de Binance
function generateSampleData(count: number = 200): CandlestickData[] {
  const data: CandlestickData[] = [];
  let basePrice = 40000;
  let time = Math.floor(Date.now() / 1000) - (count * 60);

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 500;
    basePrice += change;

    const open = basePrice;
    const high = basePrice + Math.random() * 300;
    const low = basePrice - Math.random() * 300;
    const close = basePrice + (Math.random() - 0.5) * 200;

    data.push({
      time: time + (i * 60),
      open,
      high,
      low,
      close,
    });
  }

  return data;
}

export default function BacktestingPage() {
  const [symbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [allCandles] = useState<CandlestickData[]>(() => generateSampleData(500));

  const {
    state,
    visibleCandles,
    currentCandle,
    play,
    pause,
    reset,
    forward,
    backward,
    setSpeed,
    jumpTo,
  } = useBacktestPlayer(allCandles);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Sistema de Backtesting</h1>
          <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
        </div>

        {/* Información actual */}
        {currentCandle && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Open</div>
              <div className="text-white text-xl font-bold">
                ${currentCandle.open.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">High</div>
              <div className="text-green-400 text-xl font-bold">
                ${currentCandle.high.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Low</div>
              <div className="text-red-400 text-xl font-bold">
                ${currentCandle.low.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm">Close</div>
              <div className="text-white text-xl font-bold">
                ${currentCandle.close.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div className="h-[600px]">
          <TradingChart
            symbol={symbol}
            timeframe={timeframe}
            data={visibleCandles}
          />
        </div>

        {/* Controles de reproducción */}
        <PlaybackControls
          isPlaying={state.isPlaying}
          currentIndex={state.currentIndex}
          totalCandles={state.totalCandles}
          speed={state.speed}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onForward={forward}
          onBackward={backward}
          onSpeedChange={setSpeed}
          onSeek={jumpTo}
        />

        {/* Instrucciones */}
        <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">📊 Sistema en Funcionamiento</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>✅ Gráfico TradingView renderizado</li>
            <li>✅ Selector de temporalidades completo (ticks a 5 años)</li>
            <li>✅ Motor de reproducción con control de velocidad</li>
            <li>⏳ Próximo: Conectar con datos reales de Binance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Agregar Link en el Dashboard

**Archivo**: Edita `apps/web/src/app/dashboard/page.tsx`

Agrega un botón para ir a backtesting. Busca la sección "Próximamente" y reemplázala con:

```typescript
<Link
  href="/backtesting"
  className="block p-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl hover:scale-105 transition-transform"
>
  <h3 className="text-xl font-bold text-white mb-2">
    📈 Backtesting
  </h3>
  <p className="text-purple-100">
    Sistema de backtesting en todas las temporalidades
  </p>
</Link>
```

---

## 🚀 Próximos Pasos

Una vez creados todos estos archivos:

1. **Accede a**: http://localhost:3000/backtesting
2. **Deberías ver**:
   - Gráfico de velas con datos de muestra
   - Selector de todas las temporalidades
   - Controles de reproducción funcionando
   - Play/Pause con velocidad variable

3. **Luego implementaremos**:
   - Conexión con Binance API (datos reales)
   - Indicadores técnicos
   - Sistema de órdenes
   - Métricas de performance

---

## ⚠️ Si Hay Errores de Importación

Actualiza el archivo `tsconfig.json` del proyecto web con los paths correctos.

**Comits TODO ahora y continúa!** 🚀
