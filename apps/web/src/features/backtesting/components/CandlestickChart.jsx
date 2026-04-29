import { useEffect, useRef } from 'react';
import { CandlestickSeries, ColorType, createChart } from 'lightweight-charts';
import { toChartCandles } from '../utils/chart-data.js';

const CHART_HEIGHT = 420;

function buildChartOptions(container) {
  return {
    width: container.clientWidth || 960,
    height: CHART_HEIGHT,
    layout: {
      background: {
        type: ColorType.Solid,
        color: '#0f172a'
      },
      textColor: '#cbd5e1',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    grid: {
      vertLines: {
        color: 'rgba(148, 163, 184, 0.12)'
      },
      horzLines: {
        color: 'rgba(148, 163, 184, 0.12)'
      }
    },
    rightPriceScale: {
      borderColor: 'rgba(148, 163, 184, 0.16)'
    },
    timeScale: {
      borderColor: 'rgba(148, 163, 184, 0.16)',
      timeVisible: true,
      secondsVisible: false
    },
    crosshair: {
      vertLine: {
        color: 'rgba(56, 189, 248, 0.45)'
      },
      horzLine: {
        color: 'rgba(56, 189, 248, 0.45)'
      }
    }
  };
}

function buildSeriesOptions() {
  return {
    upColor: '#22c55e',
    downColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    borderVisible: false,
    priceLineVisible: true,
    lastValueVisible: true
  };
}

export default function CandlestickChart({ candles, symbol, timeframe, streamStatus }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const previousDataRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;
    const chart = createChart(container, buildChartOptions(container));
    const series = chart.addSeries(CandlestickSeries, buildSeriesOptions());

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeChart = () => {
      chart.applyOptions({
        width: container.clientWidth || 960
      });
    };

    let resizeObserver = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resizeChart());
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resizeChart);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resizeChart);
      }

      previousDataRef.current = [];
      seriesRef.current = null;
      chartRef.current = null;
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;

    if (!series || !chart) {
      return;
    }

    const nextData = toChartCandles(candles);
    const previousData = previousDataRef.current;

    if (nextData.length === 0) {
      series.setData([]);
      previousDataRef.current = [];
      return;
    }

    if (previousData.length === 0 || nextData.length < previousData.length) {
      series.setData(nextData);
      chart.timeScale().fitContent();
      previousDataRef.current = nextData;
      return;
    }

    if (nextData.length === previousData.length) {
      series.update(nextData[nextData.length - 1]);
      previousDataRef.current = nextData;
      return;
    }

    if (nextData.length <= previousData.length + 3) {
      for (let index = Math.max(previousData.length - 1, 0); index < nextData.length; index += 1) {
        series.update(nextData[index]);
      }

      previousDataRef.current = nextData;
      return;
    }

    series.setData(nextData);
    chart.timeScale().fitContent();
    previousDataRef.current = nextData;
  }, [candles]);

  return (
    <section className="panel-card chart-panel">
      <div className="chart-header-row">
        <div>
          <h2>Gráfico de velas</h2>
          <p className="app-subtitle">
            {symbol} · {timeframe} · estado del tiempo real: {streamStatus}
          </p>
        </div>
      </div>

      <div ref={containerRef} className="chart-surface" />

      <p className="chart-attribution">
        Visualización financiera impulsada por{' '}
        <a
          href="https://www.tradingview.com/lightweight-charts/"
          target="_blank"
          rel="noreferrer"
        >
          TradingView Lightweight Charts
        </a>
        .
      </p>
    </section>
  );
}
