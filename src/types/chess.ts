// ============================================
// TYPY I INTERFEJSY DLA GRY SZACHOWEJ
// ============================================

// Kolory graczy
export type PieceColor = 'white' | 'black';

// Typy figur szachowych
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

// Figura szachowa
export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean; // Ważne dla roszady i ruchu piona o 2 pola
}

// Pozycja na szachownicy (0-7 dla obu osi)
export interface Position {
  row: number;
  col: number;
}

// Pojedyncze pole szachownicy
export interface Square {
  position: Position;
  piece: Piece | null;
}

// Ruch szachowy
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece: Piece | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastling: 'kingside' | 'queenside' | null;
  isEnPassant: boolean;
  promotion: PieceType | null;
}

// Status gry
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'resignation';

// Tryb gry
export type GameMode = 'pvp' | 'ai';

// Poziom trudności AI
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Kontrola czasu
export interface TimeControl {
  id: string;
  name: string;
  initialTime: number;  // czas początkowy w sekundach
  increment: number;    // dodawany czas po ruchu w sekundach
}

// Predefiniowane kontrole czasu
export const TIME_CONTROLS: TimeControl[] = [
  { id: 'none', name: 'Bez limitu', initialTime: 0, increment: 0 },
  { id: 'bullet1', name: 'Bullet 1 min', initialTime: 60, increment: 0 },
  { id: 'bullet2', name: 'Bullet 2 min', initialTime: 120, increment: 1 },
  { id: 'blitz3', name: 'Blitz 3 min', initialTime: 180, increment: 0 },
  { id: 'blitz5', name: 'Blitz 5 min', initialTime: 300, increment: 0 },
  { id: 'rapid10', name: 'Rapid 10 min', initialTime: 600, increment: 0 },
  { id: 'rapid15', name: 'Rapid 15+10', initialTime: 900, increment: 10 },
  { id: 'classical30', name: 'Klasyczne 30 min', initialTime: 1800, increment: 0 },
];

// Stan gry
export interface GameState {
  board: (Piece | null)[][];          // Szachownica 8x8
  currentPlayer: PieceColor;           // Kto teraz gra
  selectedSquare: Position | null;     // Wybrane pole
  validMoves: Position[];              // Dostępne ruchy dla wybranej figury
  moveHistory: Move[];                 // Historia ruchów
  capturedPieces: {                    // Zbite figury
    white: Piece[];
    black: Piece[];
  };
  gameStatus: GameStatus;              // Status gry
  lastMove: Move | null;               // Ostatni ruch (do podświetlenia)
  enPassantTarget: Position | null;    // Pole dla bicia w przelocie
  promotionPending: Position | null;   // Pion czekający na promocję
}

// Akcje dla reducera
export type GameAction =
  | { type: 'SELECT_SQUARE'; position: Position }
  | { type: 'MOVE_PIECE'; from: Position; to: Position }
  | { type: 'PROMOTE_PAWN'; pieceType: PieceType }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO_MOVE' };

// Znaki Unicode dla figur szachowych
export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

// Nazwy kolumn szachownicy (notacja algebraiczna)
export const COLUMN_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Wartości figur (do oceny pozycji)
export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0, // Król jest bezcenny
};
