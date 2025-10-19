'use client';

import { useState, useEffect } from 'react';
import { CandlestickData } from 'lightweight-charts';
import { TradingChart } from '@/components/trading/TradingChart';
import { TimeframeSelector } from '@/components/trading/TimeframeSelector';
import { PlaybackControls } from '@/components/trading/PlaybackControls';
import { SymbolSelector } from '@/components/trading/SymbolSelector';
import { ChartTypeSelector, ChartType } from '@/components/trading/ChartTypeSelector';
import { useBacktestPlayer } from '@/hooks/useBacktestPlayer';

// Mapeo de símbolos a precios base aproximados
const SYMBOL_PRICES: Record<string, number> = {
  'BTC/USDT': 42000,
  'ETH/USDT': 2200,
  'BNB/USDT': 320,
  'SOL/USDT': 95,
  'XRP/USDT': 0.62,
  'ADA/USDT': 0.48,
  'AVAX/USDT': 38,
  'DOT/USDT': 7.2,
  'MATIC/USDT': 0.85,
  'LINK/USDT': 14.5,
  'EUR/USD': 1.08,
  'GBP/USD': 1.26,
  'USD/JPY': 148.5,
  'AAPL': 185,
  'GOOGL': 140,
  'MSFT': 375,
};

// Generador de números pseudo-aleatorios con seed (para consistencia)
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// Generar datos de muestra REALISTAS para velas japonesas
function generateSampleData(count: number = 500, symbol: string = 'BTC/USDT'): CandlestickData[] {
  const data: CandlestickData[] = [];
  const basePrice = SYMBOL_PRICES[symbol] || 100;
  const startTime = 1700000000;

  // Generador pseudo-aleatorio con seed
  const random = seededRandom(12345);

  // Parámetros de mercado
  const isCrypto = symbol.includes('USDT');
  const volatility = isCrypto ? 0.015 : 0.008; // 1.5% vs 0.8%

  let price = basePrice;
  let trend = 0; // Tendencia acumulada

  for (let i = 0; i < count; i++) {
    // Cambio de tendencia cada ~20-50 velas
    if (i % (20 + Math.floor(random() * 30)) === 0) {
      trend = (random() - 0.5) * volatility * basePrice * 0.3;
    }

    // Movimiento de la vela (aleatorio + tendencia)
    const randomMove = (random() - 0.5) * volatility * basePrice * 2;
    const movement = randomMove + trend;

    // Open y Close
    const open = price;
    const close = open + movement;

    // Tamaño de las mechas (variable)
    const wickSize = random() * volatility * basePrice * 0.6;
    const upperWick = random() * wickSize;
    const lowerWick = random() * wickSize;

    // High y Low
    const high = Math.max(open, close) + upperWick;
    const low = Math.min(open, close) - lowerWick;

    data.push({
      time: (startTime + (i * 60)) as any,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    // Actualizar precio para siguiente vela
    price = close;

    // Evitar que el precio se vaya a 0 o infinito
    if (price < basePrice * 0.7) price = basePrice * 0.7;
    if (price > basePrice * 1.5) price = basePrice * 1.5;
  }

  return data;
}

export default function BacktestingPage() {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [allCandles, setAllCandles] = useState<CandlestickData[]>([]);

  // Regenerar datos cuando cambie el símbolo
  useEffect(() => {
    // Generar datos solo en el cliente
    setAllCandles(generateSampleData(500, symbol));
  }, [symbol]);

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
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      <div className="h-screen flex flex-col">
        {/* Header compacto con selectores y OHLC */}
        <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Lado izquierdo: Logo y selectores */}
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-white">Backtesting</h1>
              <div className="hidden lg:flex items-center gap-2">
                <SymbolSelector selected={symbol} onChange={setSymbol} />
                <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
                <ChartTypeSelector selected={chartType} onChange={setChartType} />
              </div>
            </div>

            {/* Lado derecho: OHLC info compacta */}
            {currentCandle && (
              <div className="hidden lg:flex items-center gap-3 text-xs">
                <span className="text-gray-500">O:</span>
                <span className="text-white font-medium">${currentCandle.open.toFixed(2)}</span>
                <span className="text-gray-500">H:</span>
                <span className="text-green-400 font-medium">${currentCandle.high.toFixed(2)}</span>
                <span className="text-gray-500">L:</span>
                <span className="text-red-400 font-medium">${currentCandle.low.toFixed(2)}</span>
                <span className="text-gray-500">C:</span>
                <span className={`font-medium ${currentCandle.close >= currentCandle.open ? 'text-green-400' : 'text-red-400'}`}>
                  ${currentCandle.close.toFixed(2)}
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">{state.currentIndex + 1}/{state.totalCandles}</span>
              </div>
            )}
          </div>

          {/* Controles móviles */}
          <div className="flex lg:hidden items-center gap-2 mt-2 overflow-x-auto pb-1">
            <SymbolSelector selected={symbol} onChange={setSymbol} />
            <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
            <ChartTypeSelector selected={chartType} onChange={setChartType} />
          </div>
        </div>

        {/* Controles de reproducción */}
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700">
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
        </div>

        {/* Gráfico principal - Ocupa todo el espacio disponible */}
        <div className="flex-1 p-4 overflow-hidden">
          <TradingChart
            symbol={symbol}
            timeframe={timeframe}
            data={visibleCandles}
            chartType={chartType}
          />
        </div>
      </div>
    </div>
  );
}
