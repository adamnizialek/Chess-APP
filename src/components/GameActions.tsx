// ============================================
// KOMPONENT AKCJI GRY (REZYGNACJA, REMIS)
// ============================================

import { useState } from 'react';
import { Flag, Handshake, X, Check } from 'lucide-react';
import type { PieceColor } from '../types/chess';

interface GameActionsProps {
  currentPlayer: PieceColor;
  gameMode: 'pvp' | 'ai';
  isGameOver: boolean;
  onResign: (color: PieceColor) => void;
  onDrawOffer: () => void;
  onDrawAccept: () => void;
  onDrawDecline: () => void;
  drawOfferedBy: PieceColor | null;
}

export function GameActions({
  currentPlayer,
  gameMode,
  isGameOver,
  onResign,
  onDrawOffer,
  onDrawAccept,
  onDrawDecline,
  drawOfferedBy,
}: GameActionsProps) {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  if (isGameOver) return null;

  const handleResignClick = () => {
    setShowResignConfirm(true);
  };

  const handleResignConfirm = () => {
    onResign(currentPlayer);
    setShowResignConfirm(false);
  };

  const handleResignCancel = () => {
    setShowResignConfirm(false);
  };

  // Pokaż dialog potwierdzenia rezygnacji
  if (showResignConfirm) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-200 text-sm mb-3 text-center">
          Czy na pewno chcesz się poddać?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleResignCancel}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Nie
          </button>
          <button
            onClick={handleResignConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Tak
          </button>
        </div>
      </div>
    );
  }

  // Pokaż propozycję remisu (dla drugiego gracza)
  if (drawOfferedBy && drawOfferedBy !== currentPlayer) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-yellow-600/50">
        <p className="text-slate-200 text-sm mb-3 text-center">
          {drawOfferedBy === 'white' ? 'Białe' : 'Czarne'} proponują remis
        </p>
        <div className="flex gap-2">
          <button
            onClick={onDrawDecline}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Odrzuć
          </button>
          <button
            onClick={onDrawAccept}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
          >
            <Handshake className="w-4 h-4" />
            Akceptuj
          </button>
        </div>
      </div>
    );
  }

  // W trybie AI nie pokazuj propozycji remisu (komputer nie akceptuje)
  const showDrawButton = gameMode === 'pvp';

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
      <div className="flex gap-2">
        {/* Przycisk rezygnacji */}
        <button
          onClick={handleResignClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-red-600/80 text-slate-300 hover:text-white transition-colors"
          title="Poddaj się"
        >
          <Flag className="w-4 h-4" />
          <span className="text-sm">Poddaj się</span>
        </button>

        {/* Przycisk propozycji remisu (tylko PvP) */}
        {showDrawButton && (
          <button
            onClick={onDrawOffer}
            disabled={drawOfferedBy === currentPlayer}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors
              ${drawOfferedBy === currentPlayer
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-yellow-600/80 text-slate-300 hover:text-white'}
            `}
            title={drawOfferedBy === currentPlayer ? 'Propozycja wysłana' : 'Zaproponuj remis'}
          >
            <Handshake className="w-4 h-4" />
            <span className="text-sm">
              {drawOfferedBy === currentPlayer ? 'Wysłano' : 'Remis'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default GameActions;
