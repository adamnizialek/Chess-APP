// ============================================
// KOMPONENT ZBITYCH FIGUR
// ============================================

import type { Piece, PieceColor } from '../types/chess';
import { PIECE_SYMBOLS, PIECE_VALUES } from '../types/chess';

interface CapturedPiecesProps {
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
}

/**
 * Wyświetla zbite figury dla obu graczy
 *
 * Figury są sortowane według wartości (od najniższej)
 * i wyświetlane jako symbole Unicode
 */
export function CapturedPieces({ capturedPieces }: CapturedPiecesProps) {
  // Sortuj figury według wartości
  const sortByValue = (pieces: Piece[]) => {
    return [...pieces].sort(
      (a, b) => PIECE_VALUES[a.type] - PIECE_VALUES[b.type]
    );
  };

  // Oblicz różnicę materiału
  const calculateMaterialDiff = () => {
    const whiteCaptured = capturedPieces.white.reduce(
      (sum, p) => sum + PIECE_VALUES[p.type],
      0
    );
    const blackCaptured = capturedPieces.black.reduce(
      (sum, p) => sum + PIECE_VALUES[p.type],
      0
    );
    return whiteCaptured - blackCaptured;
  };

  const materialDiff = calculateMaterialDiff();

  const renderPieceGroup = (color: PieceColor) => {
    const pieces = sortByValue(
      color === 'white' ? capturedPieces.white : capturedPieces.black
    );
    // Zbite przez białe = czarne figury, zbite przez czarne = białe figury
    const capturedColor = color === 'white' ? 'black' : 'white';

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`
              w-3 h-3 rounded-full
              ${color === 'white' ? 'bg-white' : 'bg-slate-800 border border-slate-600'}
            `}
          />
          <span className="text-sm text-slate-400">
            {color === 'white' ? 'Białe zbiły:' : 'Czarne zbiły:'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 min-h-[2rem] pl-5">
          {pieces.length === 0 ? (
            <span className="text-slate-600 text-sm italic">-</span>
          ) : (
            pieces.map((piece, index) => (
              <span
                key={index}
                className="text-2xl"
                style={{
                  color: capturedColor === 'white' ? '#ffffff' : '#1e1e1e',
                  textShadow: capturedColor === 'white'
                    ? '0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.5)'
                    : '0 0 0 1px #94a3b8, 0 1px 2px rgba(148,163,184,0.5)',
                  WebkitTextStroke: capturedColor === 'black' ? '0.5px #94a3b8' : 'none',
                }}
                title={piece.type}
              >
                {PIECE_SYMBOLS[capturedColor][piece.type]}
              </span>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Zbite figury
      </h2>

      <div className="space-y-4">
        {renderPieceGroup('white')}
        {renderPieceGroup('black')}
      </div>

      {/* Wskaźnik przewagi materiałowej */}
      {materialDiff !== 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Przewaga materiałowa:</span>
            <span
              className={`
                font-semibold
                ${materialDiff > 0 ? 'text-white' : 'text-slate-300'}
              `}
            >
              {materialDiff > 0 ? '+' : ''}{materialDiff} ({materialDiff > 0 ? 'Białe' : 'Czarne'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CapturedPieces;
