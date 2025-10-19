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

// Generar datos de muestra realistas para velas japonesas
function generateSampleData(count: number = 500, symbol: string = 'BTC/USDT'): CandlestickData[] {
  const data: CandlestickData[] = [];
  const basePrice = SYMBOL_PRICES[symbol] || 100;
  let price = basePrice;
  const startTime = 1700000000;

  // Parámetros de mercado
  const isCrypto = symbol.includes('USDT');
  const volatilityPercent = isCrypto ? 1.5 : 0.8; // Crypto más volátil

  for (let i = 0; i < count; i++) {
    // Precio de apertura (precio anterior de cierre)
    const open = price;

    // Rango de la vela (volatilidad)
    const candleRange = basePrice * (volatilityPercent / 100);

    // Movimiento del precio (puede subir o bajar)
    const movement = Math.sin(i * 0.1) * candleRange * 2 +
                     Math.cos(i * 0.05) * candleRange +
                     Math.sin(i * 0.15) * candleRange * 0.5;

    // Precio de cierre
    const close = open + movement;

    // High y Low de la vela (mechas)
    const upperWick = Math.abs(Math.sin(i * 0.2)) * candleRange * 0.8;
    const lowerWick = Math.abs(Math.cos(i * 0.25)) * candleRange * 0.8;

    // Calcular high y low correctamente
    const high = Math.max(open, close) + upperWick;
    const low = Math.min(open, close) - lowerWick;

    data.push({
      time: (startTime + (i * 60)) as any,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    // Actualizar precio para próxima vela
    price = close;
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
