'use client';

import { PlaybackSpeed } from '@/hooks/useBacktestPlayer';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalCandles: number;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onForward: () => void;
  onBackward: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onSeek: (index: number) => void;
}

export function PlaybackControls({
  isPlaying,
  currentIndex,
  totalCandles,
  speed,
  onPlay,
  onPause,
  onReset,
  onForward,
  onBackward,
  onSpeedChange,
  onSeek,
}: PlaybackControlsProps) {
  const progress = totalCandles > 0 ? (currentIndex / totalCandles) * 100 : 0;
  const speeds: PlaybackSpeed[] = [1, 2, 5, 10, 20, 50, 100];

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4 border border-gray-700">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Vela {currentIndex + 1} de {totalCandles}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalCandles - 1)}
          value={currentIndex}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Reiniciar"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={onBackward}
          disabled={currentIndex === 0}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Retroceder"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            title="Reproducir"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            title="Pausar"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}

        <button
          onClick={onForward}
          disabled={currentIndex >= totalCandles - 1}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adelantar"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </button>

        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value) as PlaybackSpeed)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600"
        >
          {speeds.map(s => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>
    </div>
  );
}
