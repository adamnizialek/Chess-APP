// ============================================
// KOMPONENT POJEDYNCZEGO POLA SZACHOWNICY
// ============================================

import { useMemo } from 'react';
import type { Position, Piece as PieceType } from '../types/chess';
import { useTheme } from '../context/ThemeContext';
import Piece from './Piece';

interface SquareProps {
  position: Position;
  piece: PieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMoveFrom: boolean;
  isLastMoveTo: boolean;
  isCheck: boolean;
  isDragging?: boolean;
  isPremoveFrom?: boolean;
  isPremoveTo?: boolean;
  isHintFrom?: boolean;
  isHintTo?: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  flipped?: boolean;
}

/**
 * Renderuje pojedyncze pole szachownicy
 *
 * Pola mają różne stany wizualne:
 * - Jasne/ciemne tło (wzór szachownicy)
 * - Podświetlenie gdy wybrane
 * - Wskaźnik dostępnego ruchu (kropka lub pierścień)
 * - Podświetlenie ostatniego ruchu
 * - Czerwone podświetlenie gdy król w szachu
 */
export function Square({
  position,
  piece,
  isSelected,
  isValidMove,
  isLastMoveFrom,
  isLastMoveTo,
  isCheck,
  isDragging = false,
  isPremoveFrom = false,
  isPremoveTo = false,
  isHintFrom = false,
  isHintTo = false,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  flipped = false,
}: SquareProps) {
  const { theme } = useTheme();

  // Określ kolor pola (jasne/ciemne)
  const isLightSquare = useMemo(
    () => (position.row + position.col) % 2 === 0,
    [position.row, position.col]
  );

  // Klasy CSS dla różnych stanów pola
  const squareClasses = useMemo(() => {
    const classes = [
      'relative',
      'aspect-square',
      'flex items-center justify-center',
      'transition-all duration-150',
    ];

    // Kolor tła zależny od stanu i motywu
    if (isCheck && piece?.type === 'king') {
      // Król w szachu - czerwone tło
      classes.push(theme.checkSquare);
    } else if (isPremoveFrom || isPremoveTo) {
      // Premove - niebieskie podświetlenie
      classes.push(isLightSquare ? 'bg-blue-300' : 'bg-blue-500');
    } else if (isSelected) {
      // Wybrane pole
      classes.push(isLightSquare ? theme.selectedLight : theme.selectedDark);
    } else if (isLastMoveFrom || isLastMoveTo) {
      // Ostatni ruch
      classes.push(isLightSquare ? theme.lastMoveLight : theme.lastMoveDark);
    } else {
      // Normalny kolor pola
      classes.push(isLightSquare ? theme.lightSquare : theme.darkSquare);
    }

    // Podświetlenie podczas przeciągania na dozwolone pole
    if (isDragging && isValidMove) {
      classes.push('ring-4 ring-inset ring-emerald-400/50');
    }

    // Podświetlenie podpowiedzi (żółta ramka)
    if (isHintFrom || isHintTo) {
      classes.push('ring-4 ring-inset ring-yellow-400');
    }

    return classes.join(' ');
  }, [isLightSquare, isSelected, isLastMoveFrom, isLastMoveTo, isCheck, piece, theme, isDragging, isValidMove, isPremoveFrom, isPremoveTo, isHintFrom, isHintTo]);

  return (
    <div
      className={squareClasses}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Zawartość pola - przeciwnie obracana gdy szachownica jest obrócona */}
      <div className={`w-full h-full relative transition-transform duration-300 ${flipped ? 'rotate-180' : ''}`}>
        {/* Wskaźnik dostępnego ruchu */}
        {isValidMove && (
          <div
            className={`
              absolute inset-0
              flex items-center justify-center
              pointer-events-none
              z-10
            `}
          >
            {piece ? (
              // Pole z figurą przeciwnika - pierścień
              <div className={`absolute inset-1 rounded-full border-4 ${theme.validMoveRing}`} />
            ) : (
              // Puste pole - kropka
              <div className={`w-1/3 h-1/3 rounded-full ${theme.validMoveDot}`} />
            )}
          </div>
        )}

        {/* Figura */}
        {piece && (
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Piece piece={piece} />
          </div>
        )}

        {/* Etykiety pól (a-h, 1-8) - zawsze na dole i po lewej z perspektywy gracza */}
        {(flipped ? position.col === 7 : position.col === 0) && (
          <span
            className={`
              absolute left-0.5 top-0 md:left-1 md:top-1
              text-[9px] md:text-xs font-semibold
              ${isLightSquare ? 'text-slate-700/70' : 'text-slate-200/70'}
            `}
          >
            {8 - position.row}
          </span>
        )}
        {(flipped ? position.row === 0 : position.row === 7) && (
          <span
            className={`
              absolute right-0.5 bottom-0 md:right-1 md:bottom-1
              text-[9px] md:text-xs font-semibold
              ${isLightSquare ? 'text-slate-700/70' : 'text-slate-200/70'}
            `}
          >
            {String.fromCharCode(97 + position.col)}
          </span>
        )}
      </div>
    </div>
  );
}

export default Square;
