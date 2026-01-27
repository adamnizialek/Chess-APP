// ============================================
// KOMPONENT ZEGARA SZACHOWEGO
// ============================================

import { Clock } from 'lucide-react';
import type { PieceColor } from '../types/chess';

interface ChessClockProps {
  whiteTime: number;  // czas w sekundach
  blackTime: number;
  currentPlayer: PieceColor;
  isRunning: boolean;
  onTimeOut?: (color: PieceColor) => void;
}

/**
 * Formatuje czas w sekundach do formatu MM:SS lub H:MM:SS
 */
function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Pojedynczy zegar gracza
 */
function PlayerClock({
  time,
  isActive,
  color,
  label,
}: {
  time: number;
  isActive: boolean;
  color: PieceColor;
  label: string;
}) {
  const isLowTime = time < 30 && time > 0;
  const isVeryLowTime = time < 10 && time > 0;
  const isTimeOut = time <= 0;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-300
        ${isActive
          ? 'bg-emerald-600/30 border-2 border-emerald-500'
          : 'bg-slate-800/50 border-2 border-transparent'}
        ${isTimeOut ? 'bg-red-600/30 border-red-500' : ''}
      `}
    >
      {/* Wskaźnik koloru */}
      <div
        className={`
          w-4 h-4 rounded-full
          ${color === 'white' ? 'bg-white' : 'bg-slate-800 border-2 border-slate-400'}
        `}
      />

      {/* Etykieta i czas */}
      <div className="flex flex-col">
        <span className="text-xs text-slate-400">{label}</span>
        <span
          className={`
            font-mono font-bold text-lg
            ${isTimeOut
              ? 'text-red-400'
              : isVeryLowTime
                ? 'text-red-400 animate-pulse'
                : isLowTime
                  ? 'text-yellow-400'
                  : 'text-white'}
          `}
        >
          {formatTime(time)}
        </span>
      </div>

      {/* Wskaźnik aktywności */}
      {isActive && !isTimeOut && (
        <Clock className="w-4 h-4 text-emerald-400 animate-pulse ml-auto" />
      )}
    </div>
  );
}

/**
 * Zegar szachowy dla obu graczy
 */
export function ChessClock({
  whiteTime,
  blackTime,
  currentPlayer,
  isRunning,
}: ChessClockProps) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Zegar
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        <PlayerClock
          time={blackTime}
          isActive={isRunning && currentPlayer === 'black'}
          color="black"
          label="Czarne"
        />
        <PlayerClock
          time={whiteTime}
          isActive={isRunning && currentPlayer === 'white'}
          color="white"
          label="Białe"
        />
      </div>
    </div>
  );
}

export default ChessClock;
