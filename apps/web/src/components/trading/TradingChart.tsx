'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, LineData } from 'lightweight-charts';
import { TIMEFRAMES } from '@guarne/shared';
import { ChartType } from './ChartTypeSelector';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  chartType?: ChartType;
  onReady?: (chart: IChartApi) => void;
}

export function TradingChart({ symbol, timeframe, data, chartType = 'candlestick', onReady }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  // Convertir datos de velas a formato de línea/área
  const convertToLineData = (candleData: CandlestickData[]): LineData[] => {
    return candleData.map(candle => ({
      time: candle.time,
      value: candle.close,
    }));
  };

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

    // Crear la serie según el tipo de gráfico
    let series: any;

    switch (chartType) {
      case 'candlestick':
        series = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        break;

      case 'candlestick-hollow':
        // Velas huecas: bordeMuestra, relleno solo en velas bajistas
        series = chart.addCandlestickSeries({
          upColor: 'transparent',
          downColor: '#ef5350',
          borderUpColor: '#26a69a',
          borderDownColor: '#ef5350',
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          borderVisible: true,
        });
        break;

      case 'bar':
        series = chart.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          openVisible: true,
          thinBars: false,
        });
        break;

      case 'hlc':
        // HLC: barras sin la línea de Open
        series = chart.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          openVisible: false,
          thinBars: false,
        });
        break;

      case 'line':
        series = chart.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
        });
        break;

      case 'area':
        series = chart.addAreaSeries({
          topColor: 'rgba(41, 98, 255, 0.4)',
          bottomColor: 'rgba(41, 98, 255, 0.0)',
          lineColor: '#2962FF',
          lineWidth: 2,
        });
        break;

      case 'baseline':
        series = chart.addBaselineSeries({
          topFillColor1: 'rgba(38, 166, 154, 0.28)',
          topFillColor2: 'rgba(38, 166, 154, 0.05)',
          topLineColor: '#26a69a',
          bottomFillColor1: 'rgba(239, 83, 80, 0.05)',
          bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
          bottomLineColor: '#ef5350',
          baseValue: { type: 'price', price: data[0]?.close || 0 },
        });
        break;

      case 'histogram':
        series = chart.addHistogramSeries({
          color: '#26a69a',
        });
        break;
    }

    chartRef.current = chart;
    seriesRef.current = series;

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
  }, [timeframe, chartType, onReady]);

  // Actualizar datos cuando cambien
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Para tipos de gráfico que no son candlestick/bar, convertir a LineData
      if (chartType === 'line' || chartType === 'area' || chartType === 'baseline') {
        const lineData = convertToLineData(data);
        seriesRef.current.setData(lineData);
      } else if (chartType === 'histogram') {
        // Para histograma, usar los valores de close
        const histogramData = data.map(candle => ({
          time: candle.time,
          value: candle.close,
          color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
        }));
        seriesRef.current.setData(histogramData);
      } else {
        // Para candlestick, candlestick-hollow, bar, hlc usar los datos originales
        seriesRef.current.setData(data);
      }
    }
  }, [data, chartType]);

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
