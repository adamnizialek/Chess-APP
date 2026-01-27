// ============================================
// KOMPONENT STATUSU GRY
// ============================================

import type { GameStatus as GameStatusType, PieceColor } from '../types/chess';
import { Undo2, RotateCcw, PartyPopper } from 'lucide-react';

interface GameStatusProps {
  status: GameStatusType;
  currentPlayer: PieceColor;
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
  timeOutColor?: PieceColor | null;
  resignedColor?: PieceColor | null;
  isDraw?: boolean;
}

/**
 * Wyświetla aktualny status gry:
 * - Czyja tura
 * - Czy jest szach
 * - Czy gra się zakończyła (mat/pat)
 * - Przyciski akcji (cofnij, restart)
 */
export function GameStatus({ status, currentPlayer, onNewGame, onUndo, canUndo, timeOutColor, resignedColor, isDraw }: GameStatusProps) {
  const getStatusMessage = () => {
    // Sprawdź czy ktoś przegrał na czasie
    if (timeOutColor) {
      const winner = timeOutColor === 'white' ? 'Czarne' : 'Białe';
      return {
        title: 'Czas minął!',
        subtitle: `${winner} wygrywają`,
        isGameOver: true,
        color: 'text-red-400',
      };
    }

    // Sprawdź czy ktoś się poddał
    if (resignedColor) {
      const winner = resignedColor === 'white' ? 'Czarne' : 'Białe';
      return {
        title: 'Rezygnacja!',
        subtitle: `${winner} wygrywają`,
        isGameOver: true,
        color: 'text-red-400',
      };
    }

    // Sprawdź czy jest remis przez zgodę
    if (isDraw) {
      return {
        title: 'Remis!',
        subtitle: 'Gra zakończona przez zgodę',
        isGameOver: true,
        color: 'text-yellow-400',
      };
    }

    switch (status) {
      case 'checkmate':
        const winner = currentPlayer === 'white' ? 'Czarne' : 'Białe';
        return {
          title: 'Szach-mat!',
          subtitle: `${winner} wygrywają`,
          isGameOver: true,
          color: 'text-red-400',
        };
      case 'stalemate':
        return {
          title: 'Pat!',
          subtitle: 'Gra zakończona remisem',
          isGameOver: true,
          color: 'text-yellow-400',
        };
      case 'check':
        return {
          title: 'Szach!',
          subtitle: `Ruch: ${currentPlayer === 'white' ? 'Białe' : 'Czarne'}`,
          isGameOver: false,
          color: 'text-orange-400',
        };
      default:
        return {
          title: currentPlayer === 'white' ? 'Białe' : 'Czarne',
          subtitle: 'Twój ruch',
          isGameOver: false,
          color: 'text-slate-200',
        };
    }
  };

  const { title, subtitle, isGameOver, color } = getStatusMessage();

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Wskaźnik aktualnego gracza */}
          <div
            className={`
              w-10 h-10 rounded-full flex-shrink-0
              flex items-center justify-center
              shadow-lg
              ${currentPlayer === 'white'
                ? 'bg-white text-slate-900'
                : 'bg-slate-900 text-white border-2 border-slate-600'}
              ${status === 'check' || status === 'checkmate'
                ? 'animate-pulse'
                : ''}
            `}
          >
            <span className="text-2xl">♔</span>
          </div>

          <div>
            <h2 className={`text-xl font-bold ${color}`}>
              {title}
            </h2>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Przyciski akcji */}
        <div className="flex items-center gap-2">
          {/* Przycisk cofnij */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Cofnij ruch"
            className={`
              p-2 rounded-lg
              transition-all duration-200
              ${canUndo
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
            `}
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Przycisk nowej gry / restart */}
          <button
            onClick={onNewGame}
            title={isGameOver ? 'Nowa gra' : 'Restart'}
            className={`
              p-2 rounded-lg
              transition-all duration-200
              ${isGameOver
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
            `}
          >
            {isGameOver ? (
              <PartyPopper className="w-5 h-5" />
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Pasek postępu gry */}
      <div className="mt-4 flex gap-2">
        <div
          className={`
            flex-1 h-2 rounded-full
            ${currentPlayer === 'white' ? 'bg-white' : 'bg-slate-600'}
            transition-colors duration-300
          `}
        />
        <div
          className={`
            flex-1 h-2 rounded-full
            ${currentPlayer === 'black' ? 'bg-slate-200' : 'bg-slate-700'}
            transition-colors duration-300
          `}
        />
      </div>
    </div>
  );
}

export default GameStatus;
