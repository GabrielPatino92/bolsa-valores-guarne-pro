# 🚀 Guía de Implementación - Sistema de Backtesting Completo

## Resumen de Progreso

✅ **Completado**:
- Sistema de 40+ temporalidades (ticks a 5 años)
- Tipos TypeScript (OHLCV, Candles)
- TradingView Lightweight Charts instalado
- Paquete @guarne/shared creado

🔧 **Próximos pasos**: Implementar los componentes siguientes

---

## Archivos a Crear

### 1. Componente Principal: TradingChart

**Archivo**: `apps/web/src/components/trading/TradingChart.tsx`

Este es el componente principal que muestra el gráfico con TradingView Lightweight Charts.

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { TIMEFRAMES } from '@guarne/shared';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  onReady?: (chart: IChartApi) => void;
}

export function TradingChart({ symbol, timeframe, onReady }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Crear el gráfico
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#1a1d29' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2b2f3e' },
        horzLines: { color: '#2b2f3e' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2b2f3e',
      },
      timeScale: {
        borderColor: '#2b2f3e',
        timeVisible: true,
        secondsVisible: timeframe.includes('S') || timeframe.includes('TICK'),
      },
    });

    // Crear serie de velas
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    onReady?.(chart);

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [timeframe, onReady]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Información del símbolo */}
      <div className="absolute top-4 left-4 bg-gray-800/90 px-4 py-2 rounded-lg">
        <div className="text-white font-bold text-lg">{symbol}</div>
        <div className="text-gray-400 text-sm">
          {TIMEFRAMES[timeframe]?.label || timeframe}
        </div>
      </div>
    </div>
  );
}
```

---

### 2. Selector de Temporalidades

**Archivo**: `apps/web/src/components/trading/TimeframeSelector.tsx`

Selector exacto como en TradingView con todas las temporalidades.

```typescript
'use client';

import { useState } from 'react';
import { TIMEFRAMES_BY_CATEGORY, TimeframeCategory } from '@guarne/shared';

interface TimeframeSelectorProps {
  selected: string;
  onChange: (timeframe: string) => void;
}

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([TimeframeCategory.MINUTES]) // Minutos expandido por defecto
  );

  const toggleCategory = (category: TimeframeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryLabels = {
    [TimeframeCategory.TICKS]: 'TICKS',
    [TimeframeCategory.SECONDS]: 'SEGUNDOS',
    [TimeframeCategory.MINUTES]: 'MINUTOS',
    [TimeframeCategory.HOURS]: 'HORAS',
    [TimeframeCategory.DAYS]: 'DÍAS',
    [TimeframeCategory.WEEKS]: 'SEMANAS',
    [TimeframeCategory.MONTHS]: 'MESES',
    [TimeframeCategory.YEARS]: 'AÑOS',
    [TimeframeCategory.RANGES]: 'RANGOS',
  };

  return (
    <div className="relative">
      {/* Botón selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
      >
        <span>{TIMEFRAMES_BY_CATEGORY[TimeframeCategory.MINUTES].find(tf => tf.id === selected)?.label || selected}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-h-[600px] overflow-y-auto z-50">
          {/* Botón personalizado */}
          <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 border-b border-gray-700">
            + Añadir intervalo personalizado
          </button>

          {/* Categorías */}
          {Object.entries(TIMEFRAMES_BY_CATEGORY).map(([category, timeframes]) => {
            const isExpanded = expandedCategories.has(category as TimeframeCategory);

            return (
              <div key={category} className="border-b border-gray-700 last:border-0">
                {/* Header de categoría */}
                <button
                  onClick={() => toggleCategory(category as TimeframeCategory)}
                  className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{categoryLabels[category as TimeframeCategory]}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Timeframes de la categoría */}
                {isExpanded && (
                  <div className="bg-gray-850">
                    {timeframes.map((tf) => (
                      <button
                        key={tf.id}
                        onClick={() => {
                          onChange(tf.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-6 py-2 text-sm hover:bg-gray-700 ${
                          selected === tf.id ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

### 3. Motor de Reproducción (Playback Engine)

**Archivo**: `apps/web/src/hooks/useBacktestPlayer.ts`

Hook para controlar la reproducción de datos históricos.

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { Candle } from '@guarne/shared';

export type PlaybackSpeed = 1 | 2 | 5 | 10 | 20 | 50 | 100;

export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  speed: PlaybackSpeed;
  totalCandles: number;
}

export function useBacktestPlayer(candles: Candle[]) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentIndex: 0,
    speed: 1,
    totalCandles: candles.length,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para reproducir
  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  // Función para pausar
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para reiniciar
  const reset = useCallback(() => {
    pause();
    setState(prev => ({ ...prev, currentIndex: 0 }));
  }, [pause]);

  // Función para adelantar
  const forward = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.totalCandles - 1),
    }));
  }, []);

  // Función para retroceder
  const backward = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  // Cambiar velocidad
  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  // Saltar a índice específico
  const jumpTo = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.totalCandles - 1)),
    }));
  }, []);

  // Saltar a fecha específica
  const jumpToDate = useCallback((timestamp: number) => {
    const index = candles.findIndex(c => c.timestamp >= timestamp);
    if (index !== -1) {
      jumpTo(index);
    }
  }, [candles, jumpTo]);

  // Effect para reproducción automática
  useEffect(() => {
    if (state.isPlaying) {
      // Calcular intervalo basado en velocidad
      const interval = 1000 / state.speed;

      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextIndex = prev.currentIndex + 1;

          // Si llegamos al final, pausar
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

  // Actualizar total cuando cambian las velas
  useEffect(() => {
    setState(prev => ({ ...prev, totalCandles: candles.length }));
  }, [candles.length]);

  // Obtener velas visibles hasta el índice actual
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
    jumpToDate,
  };
}
```

---

### 4. Controles de Reproducción

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
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Vela {currentIndex + 1} de {totalCandles}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max={totalCandles - 1}
          value={currentIndex}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Controles principales */}
      <div className="flex items-center justify-center gap-4">
        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Reiniciar"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Backward */}
        <button
          onClick={onBackward}
          disabled={currentIndex === 0}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Retroceder"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        {/* Play/Pause */}
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

        {/* Forward */}
        <button
          onClick={onForward}
          disabled={currentIndex >= totalCandles - 1}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adelantar"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>

        {/* Speed selector */}
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value) as PlaybackSpeed)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer"
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

## Próximo Paso: Integrar Todo

En la **próxima sesión** crearemos:

1. Página de backtesting que use todos estos componentes
2. Servicio de API para obtener datos de Binance
3. Conectar todo end-to-end

**Estimación**: 3-4 horas más para tener el sistema completo funcionando

¿Te parece bien? ¿Quieres que continúe creando más archivos ahora o lo dejamos aquí y continuamos en la próxima sesión?
