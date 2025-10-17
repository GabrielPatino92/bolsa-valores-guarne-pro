'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { TIMEFRAMES } from '@guarne/shared';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  onReady?: (chart: IChartApi) => void;
}

export function TradingChart({ symbol, timeframe, data, onReady }: TradingChartProps) {
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

  // Actualizar datos cuando cambien
  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
    }
  }, [data]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Información del símbolo */}
      <div className="absolute top-4 left-4 bg-gray-800/90 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-white font-bold text-lg">{symbol}</div>
        <div className="text-gray-400 text-sm">
          {TIMEFRAMES[timeframe]?.label || timeframe}
        </div>
      </div>
    </div>
  );
}
