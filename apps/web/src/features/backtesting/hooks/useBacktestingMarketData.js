import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMarketCandles, getMarketSymbols } from '@/services/market-data/api.js';
import { connectMarketDataStream } from '@/services/market-data/ws.js';
import {
  BACKTESTING_TIMEFRAMES,
  DEFAULT_BACKTESTING_TIMEFRAME
} from '../constants/timeframes.js';

const DEFAULT_PROVIDER = 'binance';
const DEFAULT_SYMBOL = 'BTCUSDT';
const HISTORY_LIMIT = 100;
const MAX_VISIBLE_CANDLES = 200;

function formatErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error?.message || error?.message || fallbackMessage;
}

function mergeCandle(existingCandles, nextCandle) {
  const candles = [...existingCandles];
  const index = candles.findIndex((entry) => entry.timestamp === nextCandle.timestamp);

  if (index >= 0) {
    candles[index] = nextCandle;
  } else {
    candles.push(nextCandle);
  }

  candles.sort((left, right) => left.timestamp - right.timestamp);
  return candles.slice(-MAX_VISIBLE_CANDLES);
}

function mergeCandles(existingCandles, nextCandles) {
  return nextCandles.reduce(
    (currentCandles, candle) => mergeCandle(currentCandles, candle),
    existingCandles
  );
}

export function useBacktestingMarketData() {
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const [selectedTimeframe, setSelectedTimeframe] = useState(
    DEFAULT_BACKTESTING_TIMEFRAME
  );
  const [candles, setCandles] = useState([]);
  const [isSymbolsLoading, setIsSymbolsLoading] = useState(true);
  const [isCandlesLoading, setIsCandlesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [streamStatus, setStreamStatus] = useState('idle');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function loadSymbols() {
      setIsSymbolsLoading(true);
      setError(null);

      try {
        const response = await getMarketSymbols({ provider: DEFAULT_PROVIDER });

        if (isCancelled) {
          return;
        }

        const nextSymbols = response.symbols ?? [];
        setSymbols(nextSymbols);

        if (nextSymbols.length === 0) {
          setSelectedSymbol('');
          return;
        }

        setSelectedSymbol((current) => {
          if (current && nextSymbols.some((entry) => entry.symbol === current)) {
            return current;
          }

          const preferred = nextSymbols.find((entry) => entry.symbol === DEFAULT_SYMBOL);
          return preferred?.symbol ?? nextSymbols[0].symbol;
        });
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setError(
          formatErrorMessage(loadError, 'No se pudieron cargar los símbolos disponibles.')
        );
      } finally {
        if (!isCancelled) {
          setIsSymbolsLoading(false);
        }
      }
    }

    void loadSymbols();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSymbol) {
      return undefined;
    }

    let isCancelled = false;
    let streamConnection = null;

    async function loadHistoricalCandles() {
      setIsCandlesLoading(true);
      setError(null);
      setStreamError(null);
      setStreamStatus('connecting');

      try {
        const response = await getMarketCandles({
          provider: DEFAULT_PROVIDER,
          symbol: selectedSymbol,
          timeframe: selectedTimeframe,
          limit: HISTORY_LIMIT
        });

        if (isCancelled) {
          return;
        }

        setCandles(response.candles ?? []);
        setLastUpdatedAt(Date.now());
        setIsCandlesLoading(false);

        streamConnection = connectMarketDataStream({
          provider: DEFAULT_PROVIDER,
          symbol: selectedSymbol,
          timeframe: selectedTimeframe,
          onMessage(payload) {
            if (isCancelled) {
              return;
            }

            if (payload.type === 'status') {
              setStreamStatus(payload.state);
              if (payload.state !== 'error') {
                setStreamError(null);
              }
              return;
            }

            if (payload.type === 'snapshot') {
              setCandles((current) => mergeCandles(current, payload.candles ?? []));
              setLastUpdatedAt(Date.now());
              return;
            }

            if (payload.type === 'kline' && payload.candle) {
              setCandles((current) => mergeCandle(current, payload.candle));
              setLastUpdatedAt(Date.now());
              return;
            }

            if (payload.type === 'error') {
              setStreamStatus('error');
              setStreamError(payload.message || 'El stream realtime devolvió un error.');
            }
          },
          onError(streamFailure) {
            if (isCancelled) {
              return;
            }

            setStreamStatus('error');
            setStreamError(
              formatErrorMessage(
                streamFailure,
                'No se pudo abrir el stream realtime del market data.'
              )
            );
          }
        });
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setCandles([]);
        setError(
          formatErrorMessage(loadError, 'No se pudieron cargar las velas históricas.')
        );
        setStreamStatus('error');
        setIsCandlesLoading(false);
      }
    }

    void loadHistoricalCandles();

    return () => {
      isCancelled = true;
      streamConnection?.close?.();
    };
  }, [selectedSymbol, selectedTimeframe, refreshTick]);

  const refreshHistory = useCallback(() => {
    setRefreshTick((current) => current + 1);
  }, []);

  const isLoading = candles.length === 0 && (isSymbolsLoading || isCandlesLoading);
  const hasEmptyState = !isLoading && !error && candles.length === 0;

  return useMemo(
    () => ({
      provider: DEFAULT_PROVIDER,
      symbols,
      selectedSymbol,
      selectedTimeframe,
      timeframeOptions: BACKTESTING_TIMEFRAMES,
      candles,
      isLoading,
      isSymbolsLoading,
      isCandlesLoading,
      error,
      streamError,
      streamStatus,
      lastUpdatedAt,
      hasEmptyState,
      setSelectedSymbol,
      setSelectedTimeframe,
      refreshHistory
    }),
    [
      symbols,
      selectedSymbol,
      selectedTimeframe,
      candles,
      isLoading,
      isSymbolsLoading,
      isCandlesLoading,
      error,
      streamError,
      streamStatus,
      lastUpdatedAt,
      hasEmptyState,
      refreshHistory
    ]
  );
}
