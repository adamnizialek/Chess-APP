// ============================================
// MODAL KOŃCA GRY
// ============================================

import type { PieceColor } from '../types/chess';

type GameOverReason = 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'draw';

interface GameOverModalProps {
  winner: PieceColor | null;
  reason: GameOverReason;
  onNewGame: () => void;
  onAnalysis: () => void;
}

const REASON_CONFIG: Record<GameOverReason, { title: string; icon: string }> = {
  checkmate: { title: 'Szach-mat!', icon: '♚' },
  stalemate: { title: 'Pat!', icon: '½' },
  timeout: { title: 'Czas minął!', icon: '⏱' },
  resignation: { title: 'Rezygnacja!', icon: '⚑' },
  draw: { title: 'Remis!', icon: '½' },
};

function getSubtitle(winner: PieceColor | null, reason: GameOverReason): string {
  if (reason === 'stalemate' || reason === 'draw') {
    return 'Partia zakończyła się remisem';
  }
  if (!winner) return '';
  const winnerName = winner === 'white' ? 'Białe' : 'Czarne';
  return `${winnerName} wygrywają!`;
}

export function GameOverModal({ winner, reason, onNewGame, onAnalysis }: GameOverModalProps) {
  const { title, icon } = REASON_CONFIG[reason];
  const subtitle = getSubtitle(winner, reason);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg">
      <div className="bg-slate-800/95 rounded-2xl p-8 shadow-2xl border border-slate-700 min-w-[260px] max-w-[80%] text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-sm mb-6">{subtitle}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNewGame}
            className="
              w-full px-6 py-3 rounded-xl
              bg-emerald-600 hover:bg-emerald-500
              text-white font-semibold
              transition-colors duration-200
            "
          >
            Nowa partia
          </button>
          <button
            onClick={onAnalysis}
            className="
              w-full px-6 py-3 rounded-xl
              border-2 border-blue-500 text-blue-400
              hover:bg-blue-500/10
              font-semibold
              transition-colors duration-200
            "
          >
            Analiza partii
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
