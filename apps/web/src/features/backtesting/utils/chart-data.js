export function toChartCandle(candle) {
  return {
    time: Math.floor(candle.timestamp / 1000),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close
  };
}

export function toChartCandles(candles) {
  return candles.map(toChartCandle);
}
