import { useState, useRef, useCallback, useEffect } from 'react';
import { CandlestickData } from 'lightweight-charts';

export type PlaybackSpeed = 1 | 2 | 5 | 10 | 20 | 50 | 100;

export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  speed: PlaybackSpeed;
  totalCandles: number;
}

export function useBacktestPlayer(candles: CandlestickData[]) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentIndex: 0,
    speed: 1,
    totalCandles: candles.length,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setState(prev => ({ ...prev, currentIndex: 0 }));
  }, [pause]);

  const forward = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.totalCandles - 1),
    }));
  }, []);

  const backward = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const jumpTo = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.totalCandles - 1)),
    }));
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      const interval = 1000 / state.speed;

      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextIndex = prev.currentIndex + 1;

          if (nextIndex >= prev.totalCandles) {
            pause();
            return prev;
          }

          return { ...prev, currentIndex: nextIndex };
        });
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.isPlaying, state.speed, pause]);

  useEffect(() => {
    setState(prev => ({ ...prev, totalCandles: candles.length }));
  }, [candles.length]);

  const visibleCandles = candles.slice(0, state.currentIndex + 1);
  const currentCandle = candles[state.currentIndex];

  return {
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
  };
}
