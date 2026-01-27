// ============================================
// KOMPONENT HISTORII RUCHÓW
// ============================================

import { useEffect, useRef } from 'react';
import type { Move } from '../types/chess';
import { moveToAlgebraic } from '../engine/chessLogic';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

interface MoveHistoryProps {
  moves: Move[];
  analysisMode: boolean;
  viewIndex: number;
  onMoveClick: (moveIndex: number) => void;
  onEnterAnalysis: () => void;
  onExitAnalysis: () => void;
  onFirstMove: () => void;
  onPrevMove: () => void;
  onNextMove: () => void;
  onLastMove: () => void;
  canEnterAnalysis: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/**
 * Wyświetla historię ruchów w notacji algebraicznej
 * W trybie analizy pozwala na klikanie ruchów i nawigację
 */
export function MoveHistory({
  moves,
  analysisMode,
  viewIndex,
  onMoveClick,
  onEnterAnalysis,
  onExitAnalysis,
  onFirstMove,
  onPrevMove,
  onNextMove,
  onLastMove,
  canEnterAnalysis,
  canGoPrev,
  canGoNext,
}: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedMoveRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll do wybranego ruchu w trybie analizy
  useEffect(() => {
    if (analysisMode && selectedMoveRef.current) {
      selectedMoveRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [viewIndex, analysisMode]);

  // Grupuj ruchy w pary (biały, czarny)
  const movePairs: { number: number; white: string; black?: string; whiteIndex: number; blackIndex?: number }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moveToAlgebraic(moves[i]),
      black: moves[i + 1] ? moveToAlgebraic(moves[i + 1]) : undefined,
      whiteIndex: i + 1, // +1 bo index 0 to pozycja startowa
      blackIndex: moves[i + 1] ? i + 2 : undefined,
    });
  }

  const renderMoveButton = (
    notation: string,
    moveIndex: number,
    isWhite: boolean
  ) => {
    const isSelected = analysisMode && viewIndex === moveIndex;
    const isClickable = analysisMode;

    return (
      <button
        ref={isSelected ? selectedMoveRef : undefined}
        onClick={() => isClickable && onMoveClick(moveIndex)}
        disabled={!isClickable}
        className={`
          font-mono text-left px-1 rounded
          transition-all duration-150
          ${isClickable ? 'cursor-pointer hover:bg-slate-600' : 'cursor-default'}
          ${isSelected
            ? 'bg-emerald-600 text-white'
            : isWhite
              ? 'text-white'
              : 'text-slate-300'}
        `}
      >
        {notation}
      </button>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm">
      {/* Nagłówek z przyciskiem analizy */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Historia ruchów
        </h2>

        {/* Przycisk wejścia/wyjścia z analizy */}
        {analysisMode ? (
          <button
            onClick={onExitAnalysis}
            className="
              flex items-center gap-1
              px-2 py-1 rounded-lg
              bg-red-600/20 text-red-400
              hover:bg-red-600/30
              text-xs font-medium
              transition-colors
            "
          >
            <X className="w-3 h-3" />
            Zamknij
          </button>
        ) : (
          <button
            onClick={onEnterAnalysis}
            disabled={!canEnterAnalysis}
            className={`
              flex items-center gap-1
              px-2 py-1 rounded-lg
              text-xs font-medium
              transition-colors
              ${canEnterAnalysis
                ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}
            `}
          >
            <Search className="w-3 h-3" />
            Analiza
          </button>
        )}
      </div>

      {/* Wskaźnik trybu analizy */}
      {analysisMode && (
        <div className="mb-3 px-2 py-1.5 bg-emerald-600/20 rounded-lg border border-emerald-600/30">
          <p className="text-xs text-emerald-400 text-center">
            Tryb analizy - kliknij na ruch aby go zobaczyć
          </p>
        </div>
      )}

      {/* Lista ruchów */}
      <div ref={scrollRef} className="max-h-48 overflow-y-auto pr-2 space-y-1">
        {movePairs.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Brak ruchów</p>
        ) : (
          <>
            {/* Pozycja startowa */}
            {analysisMode && (
              <button
                onClick={() => onMoveClick(0)}
                className={`
                  w-full text-left text-sm py-1 px-2 rounded
                  transition-colors
                  ${viewIndex === 0
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50'}
                `}
              >
                Pozycja startowa
              </button>
            )}

            {/* Ruchy */}
            {movePairs.map((pair) => (
              <div
                key={pair.number}
                className="
                  grid grid-cols-[2rem_1fr_1fr]
                  gap-2 text-sm
                  py-1 px-2
                  rounded
                "
              >
                <span className="text-slate-500 font-mono">{pair.number}.</span>
                {renderMoveButton(pair.white, pair.whiteIndex, true)}
                {pair.black && pair.blackIndex ? (
                  renderMoveButton(pair.black, pair.blackIndex, false)
                ) : (
                  <span className="text-slate-600 font-mono">...</span>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Nawigacja w trybie analizy */}
      {analysisMode && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={onFirstMove}
              disabled={!canGoPrev}
              className={`
                p-2 rounded-lg transition-colors
                ${canGoPrev
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'text-slate-600 cursor-not-allowed'}
              `}
              title="Pierwszy ruch"
            >
              <ChevronFirst className="w-5 h-5" />
            </button>
            <button
              onClick={onPrevMove}
              disabled={!canGoPrev}
              className={`
                p-2 rounded-lg transition-colors
                ${canGoPrev
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'text-slate-600 cursor-not-allowed'}
              `}
              title="Poprzedni ruch"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-3 text-sm text-slate-400 min-w-[4rem] text-center">
              {viewIndex} / {moves.length}
            </span>

            <button
              onClick={onNextMove}
              disabled={!canGoNext}
              className={`
                p-2 rounded-lg transition-colors
                ${canGoNext
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'text-slate-600 cursor-not-allowed'}
              `}
              title="Następny ruch"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onLastMove}
              disabled={!canGoNext}
              className={`
                p-2 rounded-lg transition-colors
                ${canGoNext
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'text-slate-600 cursor-not-allowed'}
              `}
              title="Ostatni ruch"
            >
              <ChevronLast className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Licznik ruchów (poza trybem analizy) */}
      {!analysisMode && moves.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Łącznie ruchów: {moves.length}
          </p>
        </div>
      )}
    </div>
  );
}

export default MoveHistory;
