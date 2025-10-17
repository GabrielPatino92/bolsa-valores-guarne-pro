'use client';

import { useState } from 'react';
import { CandlestickData } from 'lightweight-charts';
import { TradingChart } from '@/components/trading/TradingChart';
import { TimeframeSelector } from '@/components/trading/TimeframeSelector';
import { PlaybackControls } from '@/components/trading/PlaybackControls';
import { useBacktestPlayer } from '@/hooks/useBacktestPlayer';

// Generar datos de muestra para BTC/USDT
function generateSampleData(count: number = 500): CandlestickData[] {
  const data: CandlestickData[] = [];
  let basePrice = 42000; // Precio inicial BTC
  let time = Math.floor(Date.now() / 1000) - (count * 60); // Timestamp en segundos

  for (let i = 0; i < count; i++) {
    // Simular movimiento de precio realista
    const change = (Math.random() - 0.5) * 800;
    basePrice += change;

    const open = basePrice;
    const volatility = Math.random() * 400;
    const high = basePrice + volatility;
    const low = basePrice - volatility;
    const close = basePrice + (Math.random() - 0.5) * 300;

    data.push({
      time: time + (i * 60), // Incrementar 1 minuto por vela
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
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Sistema de Backtesting</h1>
            <p className="text-gray-400">Reproduce datos históricos en todas las temporalidades</p>
          </div>
          <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
        </div>

        {/* Información actual de la vela */}
        {currentCandle && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Open</div>
              <div className="text-white text-xl font-bold">
                ${currentCandle.open.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">High</div>
              <div className="text-green-400 text-xl font-bold">
                ${currentCandle.high.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Low</div>
              <div className="text-red-400 text-xl font-bold">
                ${currentCandle.low.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Close</div>
              <div className={`text-xl font-bold ${currentCandle.close >= currentCandle.open ? 'text-green-400' : 'text-red-400'}`}>
                ${currentCandle.close.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Gráfico principal */}
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

        {/* Panel de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado del sistema */}
          <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sistema Funcionando
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Gráfico TradingView renderizado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {visibleCandles.length} velas visibles de {allCandles.length} total
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Reproducción a {state.speed}x velocidad
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Selector de 40+ temporalidades (ticks a 5 años)
              </li>
            </ul>
          </div>

          {/* Próximas funcionalidades */}
          <div className="bg-purple-900/20 border border-purple-700 p-6 rounded-lg">
            <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Próximas Funcionalidades
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">⏳</span>
                Datos reales de Binance API
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">⏳</span>
                Indicadores técnicos (RSI, MACD, EMA)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">⏳</span>
                Sistema de órdenes simuladas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">⏳</span>
                Métricas de performance (Win Rate, P&L)
              </li>
            </ul>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">💡 Cómo usar:</h4>
          <div className="text-gray-300 text-sm space-y-1">
            <p>• <strong>Play/Pausa:</strong> Controla la reproducción de velas históricas</p>
            <p>• <strong>Velocidad:</strong> Ajusta entre 1x y 100x para reproducir más rápido</p>
            <p>• <strong>Barra de progreso:</strong> Arrastra para saltar a cualquier momento</p>
            <p>• <strong>Temporalidades:</strong> Cambia el timeframe para ver diferentes escalas temporales</p>
          </div>
        </div>
      </div>
    </div>
  );
}
