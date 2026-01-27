// ============================================
// KOMPONENT FIGURY SZACHOWEJ
// ============================================

import type { Piece as PieceType } from '../types/chess';
import { PIECE_SYMBOLS } from '../types/chess';

interface PieceProps {
  piece: PieceType;
  isDragging?: boolean;
}

/**
 * Renderuje figurę szachową używając symboli Unicode
 *
 * Symbole Unicode zapewniają:
 * - Brak zależności od zewnętrznych zasobów
 * - Łatwe skalowanie
 * - Doskonałą czytelność
 */
export function Piece({ piece, isDragging }: PieceProps) {
  const symbol = PIECE_SYMBOLS[piece.color][piece.type];

  return (
    <div
      className={`
        flex items-center justify-center
        w-full h-full
        text-5xl md:text-6xl lg:text-7xl xl:text-8xl
        select-none cursor-grab
        transition-transform duration-150
        ${isDragging ? 'scale-100 cursor-grabbing opacity-80' : 'scale-[0.85]'}
        ${piece.color === 'white' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]'}
      `}
      style={{
        // Dodatkowy cień dla lepszej widoczności
        textShadow: piece.color === 'white'
          ? '0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)'
          : '0 1px 2px rgba(255,255,255,0.4)',
      }}
    >
      {symbol}
    </div>
  );
}

export default Piece;
