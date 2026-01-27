// ============================================
// SILNIK AI DLA GRY W SZACHY
// ============================================
// Prosty silnik oparty na algorytmie Minimax
// z optymalizacją Alpha-Beta Pruning
// ============================================

import type { Piece, PieceColor, Position, GameState } from '../types/chess';
import {
  getValidMoves,
  makeMove,
  isInCheck,
} from './chessLogic';
import { evaluateBoard, PIECE_VALUES } from './evaluation';

/**
 * Generuje wszystkie możliwe ruchy dla danego koloru
 */
function getAllMoves(
  state: GameState,
  color: PieceColor
): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === color) {
        const from: Position = { row, col };
        const validMoves = getValidMoves(state.board, from, state.enPassantTarget);

        for (const to of validMoves) {
          moves.push({ from, to });
        }
      }
    }
  }

  return moves;
}

/**
 * Sortuje ruchy według wartości (dla lepszego przycinania alpha-beta)
 * Ruchy z biciem są sprawdzane najpierw
 */
function orderMoves(
  moves: { from: Position; to: Position }[],
  board: (Piece | null)[][]
): { from: Position; to: Position }[] {
  return moves.sort((a, b) => {
    const captureA = board[a.to.row][a.to.col];
    const captureB = board[b.to.row][b.to.col];

    const valueA = captureA ? PIECE_VALUES[captureA.type] : 0;
    const valueB = captureB ? PIECE_VALUES[captureB.type] : 0;

    return valueB - valueA;
  });
}

/**
 * Algorytm Minimax z Alpha-Beta Pruning
 *
 * @param state - Aktualny stan gry
 * @param depth - Głębokość przeszukiwania
 * @param alpha - Najlepsza wartość dla maksymalizującego gracza
 * @param beta - Najlepsza wartość dla minimalizującego gracza
 * @param isMaximizing - Czy to tura maksymalizującego gracza (białe)
 * @returns Ocena pozycji
 */
function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  // Warunek końcowy - osiągnięto głębokość lub koniec gry
  if (depth === 0) {
    return evaluateBoard(state.board);
  }

  const color = isMaximizing ? 'white' : 'black';
  const moves = getAllMoves(state, color);

  // Brak ruchów - mat lub pat
  if (moves.length === 0) {
    if (isInCheck(state.board, color)) {
      // Mat - bardzo zła wartość dla przegranego
      return isMaximizing ? -100000 + (3 - depth) : 100000 - (3 - depth);
    }
    // Pat - remis
    return 0;
  }

  // Sortuj ruchy dla lepszego przycinania
  const orderedMoves = orderMoves(moves, state.board);

  if (isMaximizing) {
    let maxEval = -Infinity;

    for (const move of orderedMoves) {
      const newState = makeMove(state, move.from, move.to, 'queen'); // Auto-promocja na hetmana
      const evalScore = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);

      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    for (const move of orderedMoves) {
      const newState = makeMove(state, move.from, move.to, 'queen');
      const evalScore = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);

      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }

    return minEval;
  }
}

/**
 * Znajduje najlepszy ruch dla AI
 *
 * @param state - Aktualny stan gry
 * @param depth - Głębokość przeszukiwania (domyślnie 3)
 * @returns Najlepszy ruch lub null jeśli brak ruchów
 */
export function findBestMove(
  state: GameState,
  depth: number = 3
): { from: Position; to: Position } | null {
  const color = state.currentPlayer;
  const moves = getAllMoves(state, color);

  if (moves.length === 0) {
    return null;
  }

  // Dodaj losowość dla początkowych ruchów
  const orderedMoves = orderMoves(moves, state.board);

  let bestMove = orderedMoves[0];
  let bestValue = color === 'white' ? -Infinity : Infinity;
  const isMaximizing = color === 'white';

  for (const move of orderedMoves) {
    const newState = makeMove(state, move.from, move.to, 'queen');
    const evalScore = minimax(newState, depth - 1, -Infinity, Infinity, !isMaximizing);

    if (isMaximizing) {
      if (evalScore > bestValue) {
        bestValue = evalScore;
        bestMove = move;
      }
    } else {
      if (evalScore < bestValue) {
        bestValue = evalScore;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Poziomy trudności AI
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export const AI_DEPTH: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Znajduje ruch dla AI z określonym poziomem trudności
 */
export function getAIMove(
  state: GameState,
  difficulty: AIDifficulty = 'medium'
): { from: Position; to: Position } | null {
  const depth = AI_DEPTH[difficulty];

  // Dla łatwego poziomu czasami wybierz losowy ruch
  if (difficulty === 'easy' && Math.random() < 0.3) {
    const moves = getAllMoves(state, state.currentPlayer);
    if (moves.length > 0) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }

  return findBestMove(state, depth);
}
