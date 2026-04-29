import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BacktestingPage from '../src/features/backtesting/pages/BacktestingPage.jsx';
import { getMarketCandles, getMarketSymbols } from '@/services/market-data/api.js';
import { connectMarketDataStream } from '@/services/market-data/ws.js';

const setDataMock = vi.fn();
const updateMock = vi.fn();
const fitContentMock = vi.fn();

vi.mock('lightweight-charts', () => ({
  CandlestickSeries: Symbol('CandlestickSeries'),
  ColorType: {
    Solid: 'solid'
  },
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => ({
      setData: setDataMock,
      update: updateMock
    })),
    applyOptions: vi.fn(),
    remove: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: fitContentMock
    }))
  }))
}));

vi.mock('@/services/market-data/api.js', () => ({
  getMarketSymbols: vi.fn(),
  getMarketCandles: vi.fn()
}));

vi.mock('@/services/market-data/ws.js', () => ({
  connectMarketDataStream: vi.fn()
}));

describe('BacktestingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads backend symbols, renders the chart, preserves history on snapshot, and updates rows with realtime kline messages', async () => {
    let messageHandler;

    getMarketSymbols.mockResolvedValue({
      provider: 'binance',
      count: 2,
      symbols: [
        { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' },
        { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING' }
      ]
    });

    getMarketCandles.mockResolvedValue({
      provider: 'binance',
      symbol: 'BTCUSDT',
      timeframe: '1m',
      count: 3,
      candles: [
        {
          symbol: 'BTCUSDT',
          timeframe: '1m',
          timestamp: 1710000000000,
          open: 1,
          high: 2,
          low: 0.5,
          close: 1.5,
          volume: 100
        },
        {
          symbol: 'BTCUSDT',
          timeframe: '1m',
          timestamp: 1710000060000,
          open: 1.5,
          high: 2.2,
          low: 1.4,
          close: 2,
          volume: 120
        },
        {
          symbol: 'BTCUSDT',
          timeframe: '1m',
          timestamp: 1710000120000,
          open: 2,
          high: 2.5,
          low: 1.8,
          close: 2.1,
          volume: 140
        }
      ]
    });

    connectMarketDataStream.mockImplementation(({ onMessage }) => {
      messageHandler = onMessage;
      return { close: vi.fn() };
    });

    render(<BacktestingPage />);

    expect(screen.getByText(/cargando market data/i)).toBeTruthy();
    expect(await screen.findByText(/gráfico de velas/i)).toBeTruthy();
    expect(await screen.findByText(/velas recientes/i)).toBeTruthy();
    expect(screen.getByText(/velas: 3/i)).toBeTruthy();

    expect(getMarketSymbols).toHaveBeenCalledWith({ provider: 'binance' });
    expect(getMarketCandles).toHaveBeenCalledWith({
      provider: 'binance',
      symbol: 'BTCUSDT',
      timeframe: '1m',
      limit: 100
    });
    expect(connectMarketDataStream).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '1m'
      })
    );

    await act(async () => {
      messageHandler({
        type: 'snapshot',
        candles: [
          {
            symbol: 'BTCUSDT',
            timeframe: '1m',
            timestamp: 1710000120000,
            open: 2,
            high: 2.5,
            low: 1.8,
            close: 2.1,
            volume: 140
          }
        ]
      });
      messageHandler({
        type: 'status',
        state: 'connected'
      });
      messageHandler({
        type: 'kline',
        candle: {
          symbol: 'BTCUSDT',
          timeframe: '1m',
          timestamp: 1710000120000,
          open: 2,
          high: 2.5,
          low: 1.8,
          close: 2.75,
          volume: 155
        },
        isClosed: false
      });
    });

    expect(screen.getByText(/tiempo real: conectado/i)).toBeTruthy();
    expect(screen.getByText(/velas: 3/i)).toBeTruthy();
    expect(screen.getByText('2.75')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/marco temporal/i), {
      target: { value: '5m' }
    });

    await waitFor(() => {
      expect(getMarketCandles).toHaveBeenLastCalledWith({
        provider: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '5m',
        limit: 100
      });
    });
  });

  it('renders an explicit error state when historical loading fails', async () => {
    getMarketSymbols.mockResolvedValue({
      provider: 'binance',
      count: 1,
      symbols: [
        { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' }
      ]
    });

    getMarketCandles.mockRejectedValue(new Error('backend offline'));
    connectMarketDataStream.mockImplementation(() => ({ close: vi.fn() }));

    render(<BacktestingPage />);

    expect(await screen.findByText(/no se pudo cargar el market data/i)).toBeTruthy();
    expect(screen.getByText(/backend offline/i)).toBeTruthy();
  });
});
