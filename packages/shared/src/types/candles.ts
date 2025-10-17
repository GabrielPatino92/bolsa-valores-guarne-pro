/**
 * Tipos para velas (candles) OHLCV
 */

export interface OHLCV {
  timestamp: number; // Unix timestamp en milisegundos
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Candle extends OHLCV {
  symbol: string; // BTC/USDT, ETH/USDT, etc
  timeframe: string; // 1m, 5m, 1h, etc
}

export interface TickData {
  timestamp: number;
  price: number;
  volume: number;
  side: 'buy' | 'sell';
}

/**
 * Resultado de agregar ticks en velas
 */
export interface CandleAggregation {
  candles: Candle[];
  from: number; // timestamp inicial
  to: number; // timestamp final
  count: number; // número de velas
}
