// ============================================
// KOMPONENT SZACHOWNICY
// ============================================

import { useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GameState, Position, Piece as PieceType } from '../types/chess';
import { positionsEqual } from '../engine/chessLogic';
import Square from './Square';
import Piece from './Piece';

// Dane animacji ruchu
interface MoveAnimation {
  piece: PieceType;
  from: Position;
  to: Position;
  startTime: number;
}

// Dane przeciągania
interface DragState {
  piece: PieceType;
  from: Position;
  mouseX: number;
  mouseY: number;
}

interface BoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onMovePiece: (from: Position, to: Position) => void;
  flipped?: boolean;
  premove?: { from: Position; to: Position } | null;
  premoveSelection?: Position | null;
  hint?: { from: Position; to: Position } | null;
}

/**
 * Renderuje szachownicę 8x8
 *
 * Obsługuje:
 * - Kliknięcie w pole (click-to-move)
 * - Przeciąganie figur (drag & drop)
 * - Podświetlanie wybranego pola i dostępnych ruchów
 * - Podświetlanie ostatniego ruchu
 */
const ANIMATION_DURATION = 250; // ms

export function Board({ gameState, onSquareClick, onMovePiece, flipped = false, premove = null, premoveSelection = null, hint = null }: BoardProps) {
  const [draggedFrom, setDraggedFrom] = useState<Position | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [moveAnimation, setMoveAnimation] = useState<MoveAnimation | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const lastMoveRef = useRef<typeof gameState.lastMove>(null);

  const {
    board,
    selectedSquare,
    validMoves,
    lastMove,
    gameStatus,
    currentPlayer,
  } = gameState;

  // Stała kolejność renderowania - obrót realizowany przez CSS
  const rowIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = [0, 1, 2, 3, 4, 5, 6, 7];

  // Wykryj nowy ruch i uruchom animację
  useEffect(() => {
    if (lastMove && lastMove !== lastMoveRef.current) {
      // Nowy ruch - uruchom animację
      setMoveAnimation({
        piece: lastMove.piece,
        from: lastMove.from,
        to: lastMove.to,
        startTime: Date.now(),
      });

      // Zakończ animację po określonym czasie
      const timer = setTimeout(() => {
        setMoveAnimation(null);
      }, ANIMATION_DURATION);

      lastMoveRef.current = lastMove;
      return () => clearTimeout(timer);
    }
  }, [lastMove]);

  // Oblicz pozycję animowanej figury
  const getAnimationStyle = useCallback(() => {
    if (!moveAnimation || !boardRef.current) return {};

    const elapsed = Date.now() - moveAnimation.startTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);

    const squareSize = boardRef.current.offsetWidth / 8;

    // Pozycje bazowe (CSS rotation obsługuje wizualny obrót)
    const startX = moveAnimation.from.col * squareSize;
    const startY = moveAnimation.from.row * squareSize;
    const endX = moveAnimation.to.col * squareSize;
    const endY = moveAnimation.to.row * squareSize;

    const currentX = startX + (endX - startX) * easeOut;
    const currentY = startY + (endY - startY) * easeOut;

    return {
      position: 'absolute' as const,
      left: currentX,
      top: currentY,
      width: squareSize,
      height: squareSize,
      zIndex: 100,
      pointerEvents: 'none' as const,
    };
  }, [moveAnimation]);

  // Odświeżaj animację w pętli
  const [animationTick, setAnimationTick] = useState(0);
  useEffect(() => {
    if (moveAnimation) {
      const animationFrame = requestAnimationFrame(() => {
        setAnimationTick(t => t + 1);
      });
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [moveAnimation, animationTick]);

  // Oblicz pozycję pola na podstawie współrzędnych myszy
  const getSquareFromMouse = useCallback((mouseX: number, mouseY: number): Position | null => {
    if (!boardRef.current) return null;

    const rect = boardRef.current.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    // Sprawdź czy mysz jest nad szachownicą
    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return null;

    const squareSize = rect.width / 8;
    let col = Math.floor(x / squareSize);
    let row = Math.floor(y / squareSize);

    // Uwzględnij obrót szachownicy
    if (flipped) {
      col = 7 - col;
      row = 7 - row;
    }

    return { row, col };
  }, [flipped]);

  // Śledzenie pozycji myszy/dotyku podczas przeciągania
  const isDraggingActive = dragState !== null;
  useEffect(() => {
    if (!isDraggingActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragState(prev => prev ? {
        ...prev,
        mouseX: e.clientX,
        mouseY: e.clientY,
      } : null);
    };

    // Obsługa upuszczenia figury
    const handleMouseUp = (e: MouseEvent) => {
      if (draggedFrom) {
        const targetPosition = getSquareFromMouse(e.clientX, e.clientY);

        if (targetPosition) {
          const isValid = validMoves.some(move =>
            positionsEqual(move, targetPosition)
          );

          if (isValid) {
            onMovePiece(draggedFrom, targetPosition);
          }
        }
      }

      setDraggedFrom(null);
      setDragState(null);
    };

    // Obsługa dotyku - przesuwanie
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setDragState(prev => prev ? {
        ...prev,
        mouseX: touch.clientX,
        mouseY: touch.clientY,
      } : null);
    };

    // Obsługa dotyku - upuszczenie
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (draggedFrom) {
        const targetPosition = getSquareFromMouse(touch.clientX, touch.clientY);

        if (targetPosition) {
          const isValid = validMoves.some(move =>
            positionsEqual(move, targetPosition)
          );

          if (isValid) {
            onMovePiece(draggedFrom, targetPosition);
          }
        }
      }

      setDraggedFrom(null);
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingActive, draggedFrom, validMoves, onMovePiece, getSquareFromMouse]);

  // Obsługa rozpoczęcia przeciągania
  const handleDragStart = useCallback(
    (position: Position) => (e: React.DragEvent) => {
      const piece = board[position.row][position.col];
      if (!piece || piece.color !== currentPlayer) {
        e.preventDefault();
        return;
      }

      setDraggedFrom(position);
      onSquareClick(position);

      // Ukryj domyślny obraz przeciągania
      const emptyImg = new Image();
      emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(emptyImg, 0, 0);

      // Ustawienie danych przeciągania
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(position));

      // Ustaw stan przeciągania
      setDragState({
        piece,
        from: position,
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
    },
    [board, currentPlayer, onSquareClick]
  );

  // Obsługa przeciągania nad polem
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    []
  );

  // Obsługa upuszczenia figury
  const handleDrop = useCallback(
    (targetPosition: Position) => (e: React.DragEvent) => {
      e.preventDefault();

      if (draggedFrom) {
        // Sprawdź czy ruch jest dozwolony
        const isValidMove = validMoves.some(move =>
          positionsEqual(move, targetPosition)
        );

        if (isValidMove) {
          onMovePiece(draggedFrom, targetPosition);
        }
      }

      setDraggedFrom(null);
      setDragState(null);
    },
    [draggedFrom, validMoves, onMovePiece]
  );

  // Obsługa zakończenia przeciągania (bez upuszczenia)
  const handleDragEnd = useCallback(
    () => {
      setDraggedFrom(null);
      setDragState(null);
    },
    []
  );

  // Obsługa rozpoczęcia przeciągania dotykiem (mobile)
  const handleTouchStart = useCallback(
    (position: Position) => (e: React.TouchEvent) => {
      const piece = board[position.row][position.col];
      if (!piece || piece.color !== currentPlayer) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];

      setDraggedFrom(position);
      onSquareClick(position);

      setDragState({
        piece,
        from: position,
        mouseX: touch.clientX,
        mouseY: touch.clientY,
      });
    },
    [board, currentPlayer, onSquareClick]
  );

  // Obsługa kliknięcia w pole
  const handleSquareClick = useCallback(
    (position: Position) => () => {
      // Jeśli pole jest dostępnym ruchem - wykonaj ruch
      const isValidMove = validMoves.some(move =>
        positionsEqual(move, position)
      );

      if (isValidMove && selectedSquare) {
        onMovePiece(selectedSquare, position);
      } else {
        onSquareClick(position);
      }
    },
    [validMoves, selectedSquare, onMovePiece, onSquareClick]
  );

  // Sprawdź czy pole jest częścią ostatniego ruchu
  const isLastMoveFrom = useCallback(
    (position: Position) => {
      return lastMove ? positionsEqual(lastMove.from, position) : false;
    },
    [lastMove]
  );

  const isLastMoveTo = useCallback(
    (position: Position) => {
      return lastMove ? positionsEqual(lastMove.to, position) : false;
    },
    [lastMove]
  );

  // Sprawdź czy pole zawiera króla w szachu
  const isKingInCheck = useCallback(
    (position: Position) => {
      if (gameStatus !== 'check' && gameStatus !== 'checkmate') return false;
      const piece = board[position.row][position.col];
      return piece?.type === 'king' && piece?.color === currentPlayer;
    },
    [board, gameStatus, currentPlayer]
  );

  // Sprawdź czy pole jest aktualnie animowane (ukryj figurę)
  const isAnimatingTo = useCallback(
    (position: Position) => {
      return moveAnimation && positionsEqual(moveAnimation.to, position);
    },
    [moveAnimation]
  );

  return (
    <div className="w-full h-full perspective-1000">
      <div
        ref={boardRef}
        className={`
          grid grid-cols-8 grid-rows-8
          w-full h-full
          border-4 border-slate-800
          rounded-lg overflow-hidden
          shadow-2xl
          relative
          transition-transform duration-300 ease-in-out
          ${flipped ? 'rotate-180' : ''}
        `}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {rowIndices.map((rowIndex) =>
          colIndices.map((colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex };
            const piece = board[rowIndex][colIndex];
            const isSelected = positionsEqual(selectedSquare, position);
            const isValidMoveSquare = validMoves.some(move =>
              positionsEqual(move, position)
            );

            // Ukryj figurę na polu docelowym podczas animacji
            const hidePiece = isAnimatingTo(position);
            // Ukryj figurę która jest przeciągana
            const isDragging = draggedFrom && positionsEqual(draggedFrom, position);

            // Sprawdź czy pole jest częścią premove
            const isPremoveFrom = premove && positionsEqual(premove.from, position);
            const isPremoveTo = premove && positionsEqual(premove.to, position);
            const isPremoveSelected = premoveSelection && positionsEqual(premoveSelection, position);

            // Sprawdź czy pole jest częścią podpowiedzi
            const isHintFrom = hint && positionsEqual(hint.from, position);
            const isHintTo = hint && positionsEqual(hint.to, position);

            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                position={position}
                piece={hidePiece || isDragging ? null : piece}
                isSelected={isSelected || !!isPremoveSelected}
                isValidMove={isValidMoveSquare}
                isLastMoveFrom={isLastMoveFrom(position)}
                isLastMoveTo={isLastMoveTo(position)}
                isCheck={isKingInCheck(position)}
                isDragging={!!dragState}
                isPremoveFrom={!!isPremoveFrom}
                isPremoveTo={!!isPremoveTo}
                isHintFrom={!!isHintFrom}
                isHintTo={!!isHintTo}
                onClick={handleSquareClick(position)}
                onDragStart={handleDragStart(position)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop(position)}
                onTouchStart={handleTouchStart(position)}
                flipped={flipped}
              />
            );
          })
        )}

        {/* Animowana figura */}
        {moveAnimation && (
          <div style={getAnimationStyle()}>
            <div className={`w-full h-full transition-transform duration-300 ${flipped ? 'rotate-180' : ''}`}>
              <Piece piece={moveAnimation.piece} />
            </div>
          </div>
        )}
      </div>

      {/* Przeciągana figura (ghost) - renderowana przez portal w body */}
      {dragState && boardRef.current && createPortal(
        <div
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
          style={{
            transform: `translate(${dragState.mouseX - (boardRef.current.offsetWidth / 16)}px, ${dragState.mouseY - (boardRef.current.offsetWidth / 16)}px)`,
            width: boardRef.current.offsetWidth / 8,
            height: boardRef.current.offsetWidth / 8,
          }}
        >
          <Piece piece={dragState.piece} isDragging />
        </div>,
        document.body
      )}
    </div>
  );
}

export default Board;
