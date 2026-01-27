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

// Wartości figur do oceny pozycji
const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Tablice pozycyjne - bonus za pozycję figury na szachownicy
// Wartości z perspektywy białych (dla czarnych są odwrócone)

const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20],
];

const POSITION_TABLES: Record<string, number[][]> = {
  pawn: PAWN_TABLE,
  knight: KNIGHT_TABLE,
  bishop: BISHOP_TABLE,
  rook: ROOK_TABLE,
  queen: QUEEN_TABLE,
  king: KING_TABLE,
};

/**
 * Pobiera wartość pozycyjną figury
 */
function getPositionValue(piece: Piece, row: number, col: number): number {
  const table = POSITION_TABLES[piece.type];
  if (!table) return 0;

  // Dla czarnych odwróć tablicę
  const tableRow = piece.color === 'white' ? row : 7 - row;
  return table[tableRow][col];
}

/**
 * Ocenia pozycję na szachownicy
 * Dodatnia wartość = przewaga białych
 * Ujemna wartość = przewaga czarnych
 */
function evaluateBoard(board: (Piece | null)[][]): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type];
        const positionValue = getPositionValue(piece, row, col);
        const totalValue = pieceValue + positionValue;

        if (piece.color === 'white') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }

  return score;
}

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
