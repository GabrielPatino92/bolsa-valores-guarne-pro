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
    <div className="px-4 py-2">
      {/* Barra de progreso con info integrada */}
      <div className="flex items-center gap-3">
        {/* Botón Reset */}
        <button
          onClick={onReset}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
          title="Reiniciar"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Botón Atrás */}
        <button
          onClick={onBackward}
          disabled={currentIndex === 0}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          title="Anterior"
        >
          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        {/* Botón Play/Pause */}
        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex-shrink-0"
            title="Reproducir"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors flex-shrink-0"
            title="Pausar"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}

        {/* Botón Adelante */}
        <button
          onClick={onForward}
          disabled={currentIndex >= totalCandles - 1}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          title="Siguiente"
        >
          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </button>

        {/* Barra de progreso */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalCandles - 1)}
            value={currentIndex}
            onChange={(e) => onSeek(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {currentIndex + 1} / {totalCandles}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 w-12 text-right">
            {progress.toFixed(1)}%
          </span>
        </div>

        {/* Selector de velocidad */}
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value) as PlaybackSpeed)}
          className="px-2 py-1 text-sm bg-gray-700 text-white rounded cursor-pointer border border-gray-600 flex-shrink-0"
        >
          {speeds.map(s => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>
    </div>
  );
}
