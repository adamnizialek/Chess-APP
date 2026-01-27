// ============================================
// MODAL PROMOCJI PIONA
// ============================================

import type { PieceType, PieceColor } from '../types/chess';
import { PIECE_SYMBOLS } from '../types/chess';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
}

/**
 * Modal pozwalający wybrać figurę dla promocji piona
 *
 * Wyświetla się gdy pion dotrze do ostatniego rzędu
 * Gracz może wybrać: Hetmana, Wieżę, Gońca lub Skoczka
 */
export function PromotionModal({ color, onSelect }: PromotionModalProps) {
  const promotionOptions: { type: PieceType; name: string }[] = [
    { type: 'queen', name: 'Hetman' },
    { type: 'rook', name: 'Wieża' },
    { type: 'bishop', name: 'Goniec' },
    { type: 'knight', name: 'Skoczek' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Wybierz figurę
        </h2>
        <p className="text-slate-400 text-sm mb-4 text-center">
          Pion dotarł do końca szachownicy
        </p>

        <div className="grid grid-cols-4 gap-3">
          {promotionOptions.map(({ type, name }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="
                flex flex-col items-center
                p-4 rounded-xl
                bg-slate-700 hover:bg-slate-600
                border-2 border-transparent hover:border-emerald-500
                transition-all duration-200
                group
              "
            >
              <span
                className={`
                  text-5xl mb-2
                  transition-transform duration-200
                  group-hover:scale-110
                  ${color === 'white'
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                    : 'text-slate-900'}
                `}
                style={{
                  textShadow: color === 'white'
                    ? '0 2px 4px rgba(0,0,0,0.8)'
                    : 'none',
                }}
              >
                {PIECE_SYMBOLS[color][type]}
              </span>
              <span className="text-sm text-slate-300 group-hover:text-white">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromotionModal;
