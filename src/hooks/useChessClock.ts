// ============================================
// HOOK ZARZĄDZAJĄCY ZEGAREM SZACHOWYM
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PieceColor, TimeControl } from '../types/chess';

interface ChessClockState {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  timeOutColor: PieceColor | null;
}

interface UseChessClockReturn {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  timeOutColor: PieceColor | null;
  startClock: () => void;
  stopClock: () => void;
  switchTurn: (currentPlayer: PieceColor) => void;
  resetClock: (timeControl: TimeControl) => void;
  timeControl: TimeControl | null;
  setTimeControl: (tc: TimeControl) => void;
}

export function useChessClock(): UseChessClockReturn {
  const [timeControl, setTimeControlState] = useState<TimeControl | null>(null);
  const [state, setState] = useState<ChessClockState>({
    whiteTime: 0,
    blackTime: 0,
    isRunning: false,
    timeOutColor: null,
  });

  const activePlayerRef = useRef<PieceColor>('white');
  const lastTickRef = useRef<number>(Date.now());
  const incrementRef = useRef<number>(0);

  // Aktualizuj czas co 100ms
  useEffect(() => {
    if (!state.isRunning || !timeControl || timeControl.initialTime === 0) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setState((prev) => {
        const activePlayer = activePlayerRef.current;
        const timeKey = activePlayer === 'white' ? 'whiteTime' : 'blackTime';
        const newTime = Math.max(0, prev[timeKey] - elapsed);

        // Sprawdź czy czas się skończył
        if (newTime <= 0 && !prev.timeOutColor) {
          return {
            ...prev,
            [timeKey]: 0,
            isRunning: false,
            timeOutColor: activePlayer,
          };
        }

        return {
          ...prev,
          [timeKey]: newTime,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.isRunning, timeControl]);

  const startClock = useCallback(() => {
    if (!timeControl || timeControl.initialTime === 0) return;
    lastTickRef.current = Date.now();
    setState((prev) => ({ ...prev, isRunning: true }));
  }, [timeControl]);

  const stopClock = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const switchTurn = useCallback((newPlayer: PieceColor) => {
    if (!timeControl || timeControl.initialTime === 0) return;

    // Dodaj increment poprzedniemu graczowi
    const prevPlayer = activePlayerRef.current;
    if (incrementRef.current > 0 && prevPlayer !== newPlayer) {
      setState((prev) => {
        const timeKey = prevPlayer === 'white' ? 'whiteTime' : 'blackTime';
        return {
          ...prev,
          [timeKey]: prev[timeKey] + incrementRef.current,
        };
      });
    }

    activePlayerRef.current = newPlayer;
    lastTickRef.current = Date.now();
  }, [timeControl]);

  const resetClock = useCallback((tc: TimeControl) => {
    setTimeControlState(tc);
    incrementRef.current = tc.increment;
    activePlayerRef.current = 'white';
    setState({
      whiteTime: tc.initialTime,
      blackTime: tc.initialTime,
      isRunning: false,
      timeOutColor: null,
    });
  }, []);

  const setTimeControl = useCallback((tc: TimeControl) => {
    resetClock(tc);
  }, [resetClock]);

  return {
    whiteTime: state.whiteTime,
    blackTime: state.blackTime,
    isRunning: state.isRunning,
    timeOutColor: state.timeOutColor,
    startClock,
    stopClock,
    switchTurn,
    resetClock,
    timeControl,
    setTimeControl,
  };
}

export default useChessClock;
