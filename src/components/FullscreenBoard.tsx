import { useEffect } from 'react';
import { RotateCcw, Minimize2 } from 'lucide-react';
import Board from './Board';
import PromotionModal from './PromotionModal';
import type { GameState, Position, PieceType } from '../types/chess';

interface FullscreenBoardProps {
  gameState: GameState;
  actualGameState: GameState;
  onSquareClick: (position: Position) => void;
  onMovePiece: (from: Position, to: Position) => void;
  onPromotePawn: (pieceType: PieceType) => void;
  flipped: boolean;
  onFlipBoard: () => void;
  onExit: () => void;
  premove?: { from: Position; to: Position } | null;
  premoveSelection?: Position | null;
  hint?: { from: Position; to: Position } | null;
}

export function FullscreenBoard({
  gameState,
  actualGameState,
  onSquareClick,
  onMovePiece,
  onPromotePawn,
  flipped,
  onFlipBoard,
  onExit,
  premove,
  premoveSelection,
  hint,
}: FullscreenBoardProps) {
  // Prevent body scroll when in fullscreen
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center">
      {/* Exit button - top right */}
      <button
        onClick={onExit}
        className="
          absolute top-4 right-4 z-[110]
          p-3 rounded-xl
          bg-slate-800/80 hover:bg-slate-700
          text-slate-200 hover:text-white
          backdrop-blur-sm
          border border-slate-700
          transition-all duration-200
          shadow-lg
        "
        aria-label="Wyjdź z pełnego ekranu"
        title="Wyjdź z pełnego ekranu (ESC)"
      >
        <Minimize2 className="w-6 h-6" />
      </button>

      {/* Rotate board button - bottom right */}
      <button
        onClick={onFlipBoard}
        className="
          absolute bottom-4 right-4 z-[110]
          p-3 rounded-xl
          bg-slate-800/80 hover:bg-slate-700
          text-slate-200 hover:text-white
          backdrop-blur-sm
          border border-slate-700
          transition-all duration-200
          shadow-lg
        "
        aria-label="Obróć szachownicę"
        title="Obróć szachownicę"
      >
        <RotateCcw className="w-6 h-6" />
      </button>

      {/* Board container - fills available space with padding */}
      <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
        <div
          className="
            w-[min(calc(100vw-2rem),calc(100vh-2rem))]
            md:w-[min(calc(100vw-4rem),calc(100vh-4rem))]
            aspect-square
            [&>div]:!max-w-none
            [&>div]:!w-full
            [&>div]:!h-full
          "
        >
          <Board
            gameState={gameState}
            onSquareClick={onSquareClick}
            onMovePiece={onMovePiece}
            flipped={flipped}
            premove={premove}
            premoveSelection={premoveSelection}
            hint={hint}
          />
        </div>
      </div>

      {/* Promotion modal (if needed) */}
      {actualGameState.promotionPending && (
        <PromotionModal
          color={actualGameState.currentPlayer}
          onSelect={onPromotePawn}
        />
      )}
    </div>
  );
}

export default FullscreenBoard;
