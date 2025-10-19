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

// Generar datos de muestra más realistas para cualquier símbolo
function generateSampleData(count: number = 500, symbol: string = 'BTC/USDT'): CandlestickData[] {
  const data: CandlestickData[] = [];
  const basePrice = SYMBOL_PRICES[symbol] || 100;
  let currentPrice = basePrice;
  const startTime = 1700000000; // Timestamp fijo para consistencia servidor/cliente

  // Diferentes parámetros según el tipo de activo
  const isCrypto = symbol.includes('USDT');
  const volatility = isCrypto ? 0.008 : 0.004; // Cryptos más volátiles
  const trendStrength = 0.0001; // Tendencia suave

  for (let i = 0; i < count; i++) {
    // Tendencia general (sube lentamente)
    const trend = i * trendStrength * basePrice;

    // Movimiento aleatorio pero consistente usando funciones trigonométricas
    const randomWalk = Math.sin(i * 0.15) * volatility * basePrice +
                       Math.cos(i * 0.08) * volatility * basePrice * 0.6 +
                       Math.sin(i * 0.23) * volatility * basePrice * 0.3;

    currentPrice = basePrice + trend + randomWalk;

    // Generar vela OHLC realista
    const openPrice = currentPrice;
    const candleVolatility = Math.abs(Math.sin(i * 0.31)) * volatility * basePrice * 0.5;

    // Close puede ser mayor o menor que open
    const closePrice = openPrice + (Math.sin(i * 0.19) * candleVolatility);

    // High y Low envuelven el rango open-close
    const highPrice = Math.max(openPrice, closePrice) + Math.abs(Math.cos(i * 0.27)) * candleVolatility * 0.5;
    const lowPrice = Math.min(openPrice, closePrice) - Math.abs(Math.sin(i * 0.33)) * candleVolatility * 0.5;

    data.push({
      time: (startTime + (i * 60)) as any, // 1 minuto por vela
      open: openPrice,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
    });
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
        {/* Header compacto */}
        <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">Backtesting</h1>
              <div className="hidden sm:flex items-center gap-2">
                <SymbolSelector selected={symbol} onChange={setSymbol} />
                <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
                <ChartTypeSelector selected={chartType} onChange={setChartType} />
              </div>
            </div>
          </div>

          {/* Controles móviles */}
          <div className="flex sm:hidden items-center gap-2 mt-3 overflow-x-auto pb-2">
            <SymbolSelector selected={symbol} onChange={setSymbol} />
            <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
            <ChartTypeSelector selected={chartType} onChange={setChartType} />
          </div>
        </div>

        {/* Controles de reproducción ARRIBA */}
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

        {/* OHLC Info compacta */}
        {currentCandle && (
          <div className="flex-shrink-0 bg-gray-850 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center gap-4 text-sm overflow-x-auto">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-400">O:</span>
                <span className="text-white font-semibold">${currentCandle.open.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-400">H:</span>
                <span className="text-green-400 font-semibold">${currentCandle.high.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-400">L:</span>
                <span className="text-red-400 font-semibold">${currentCandle.low.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-400">C:</span>
                <span className={`font-semibold ${currentCandle.close >= currentCandle.open ? 'text-green-400' : 'text-red-400'}`}>
                  ${currentCandle.close.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-400">Vela:</span>
                <span className="text-white">{state.currentIndex} / {state.totalCandles}</span>
              </div>
            </div>
          </div>
        )}

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
