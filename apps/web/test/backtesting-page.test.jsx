import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BacktestingPage from '../src/features/backtesting/pages/BacktestingPage.jsx';
import { getMarketCandles, getMarketSymbols } from '@/services/market-data/api.js';
import { connectMarketDataStream } from '@/services/market-data/ws.js';

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

  it('loads backend symbols and candles, then updates rows with realtime kline messages', async () => {
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
      count: 1,
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
        }
      ]
    });

    connectMarketDataStream.mockImplementation(({ onMessage }) => {
      messageHandler = onMessage;
      return { close: vi.fn() };
    });

    render(<BacktestingPage />);

    expect(screen.getByText(/cargando market data/i)).toBeTruthy();
    expect(await screen.findByText(/velas recientes/i)).toBeTruthy();

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
        type: 'status',
        state: 'connected'
      });
      messageHandler({
        type: 'kline',
        candle: {
          symbol: 'BTCUSDT',
          timeframe: '1m',
          timestamp: 1710000000000,
          open: 1,
          high: 2,
          low: 0.5,
          close: 2.75,
          volume: 155
        },
        isClosed: false
      });
    });

    expect(screen.getByText(/stream: conectado/i)).toBeTruthy();
    expect(screen.getByText('2.75')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/timeframe/i), {
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
