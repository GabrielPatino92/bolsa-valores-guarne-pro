function makeSeriesKey({ providerName, symbol, timeframe }) {
  return `${providerName}:${symbol}:${timeframe}`;
}

function cloneCandle(candle) {
  return {
    symbol: candle.symbol,
    timeframe: candle.timeframe,
    timestamp: Number(candle.timestamp),
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume)
  };
}

export function createMemoryMarketDataRepository(seed = {}) {
  const candleStore = new Map();
  const coverageStore = new Map();

  for (const entry of seed.candles ?? []) {
    const key = makeSeriesKey(entry);
    const series = candleStore.get(key) ?? [];
    series.push(cloneCandle(entry));
    candleStore.set(key, series);
  }

  for (const entry of seed.coverages ?? []) {
    const key = makeSeriesKey(entry);
    const ranges = coverageStore.get(key) ?? [];
    ranges.push({
      startTime: Number(entry.startTime),
      endTime: Number(entry.endTime)
    });
    coverageStore.set(key, ranges);
  }

  return {
    async hasCoverage({ providerName, symbol, timeframe, startTime, endTime }) {
      const key = makeSeriesKey({ providerName, symbol, timeframe });
      const ranges = coverageStore.get(key) ?? [];
      return ranges.some(
        (range) => range.startTime <= Number(startTime) && range.endTime >= Number(endTime)
      );
    },

    async listCandlesByRange({ providerName, symbol, timeframe, startTime, endTime, limit = 500 }) {
      const key = makeSeriesKey({ providerName, symbol, timeframe });
      const series = (candleStore.get(key) ?? [])
        .filter((candle) => startTime === undefined || candle.timestamp >= Number(startTime))
        .filter((candle) => endTime === undefined || candle.timestamp <= Number(endTime))
        .sort((left, right) => left.timestamp - right.timestamp);

      return series.slice(0, limit).map(cloneCandle);
    },

    async listLatestCandles({ providerName, symbol, timeframe, limit = 5 }) {
      const key = makeSeriesKey({ providerName, symbol, timeframe });
      const series = [...(candleStore.get(key) ?? [])].sort(
        (left, right) => left.timestamp - right.timestamp
      );

      return series.slice(-limit).map(cloneCandle);
    },

    async upsertCandles({ providerName, symbol, timeframe, candles }) {
      const key = makeSeriesKey({ providerName, symbol, timeframe });
      const current = candleStore.get(key) ?? [];
      const byTimestamp = new Map(current.map((candle) => [Number(candle.timestamp), cloneCandle(candle)]));

      for (const candle of candles) {
        byTimestamp.set(Number(candle.timestamp), cloneCandle(candle));
      }

      candleStore.set(
        key,
        [...byTimestamp.values()].sort((left, right) => left.timestamp - right.timestamp)
      );

      return candles.length;
    },

    async mergeCoverage({ providerName, symbol, timeframe, startTime, endTime }) {
      const key = makeSeriesKey({ providerName, symbol, timeframe });
      const nextRange = {
        startTime: Number(startTime),
        endTime: Number(endTime)
      };
      const existing = coverageStore.get(key) ?? [];
      const overlapping = existing.filter(
        (range) => !(range.endTime < nextRange.startTime || range.startTime > nextRange.endTime)
      );
      const untouched = existing.filter(
        (range) => range.endTime < nextRange.startTime || range.startTime > nextRange.endTime
      );

      const merged = overlapping.reduce(
        (current, range) => ({
          startTime: Math.min(current.startTime, range.startTime),
          endTime: Math.max(current.endTime, range.endTime)
        }),
        nextRange
      );

      coverageStore.set(key, [...untouched, merged]);
    }
  };
}
