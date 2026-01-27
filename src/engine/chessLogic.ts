// ============================================
// SILNIK GRY SZACHOWEJ
// ============================================
// Ten moduł zawiera całą logikę gry szachowej:
// - Generowanie ruchów dla każdej figury
// - Walidacja ruchów (z uwzględnieniem szacha)
// - Wykrywanie szacha, mata i pata
// - Obsługa roszady, bicia w przelocie i promocji
// ============================================

import type {
  Piece,
  PieceColor,
  PieceType,
  Position,
  Move,
  GameState,
  GameStatus,
} from '../types/chess';
import { COLUMN_NAMES } from '../types/chess';

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

/**
 * Sprawdza czy pozycja mieści się w granicach szachownicy
 */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row <= 7 && pos.col >= 0 && pos.col <= 7;
}

/**
 * Porównuje dwie pozycje
 */
export function positionsEqual(a: Position | null, b: Position | null): boolean {
  if (!a || !b) return false;
  return a.row === b.row && a.col === b.col;
}

/**
 * Tworzy głęboką kopię szachownicy
 */
export function copyBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(piece => (piece ? { ...piece } : null)));
}

/**
 * Zwraca przeciwny kolor
 */
export function getOppositeColor(color: PieceColor): PieceColor {
  return color === 'white' ? 'black' : 'white';
}

/**
 * Znajduje pozycję króla danego koloru
 */
export function findKingPosition(board: (Piece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

// ============================================
// GENEROWANIE RUCHÓW DLA FIGUR
// ============================================

/**
 * Generuje wszystkie możliwe ruchy dla piona
 *
 * Pion może:
 * - Ruszyć o 1 pole do przodu (jeśli pole jest puste)
 * - Ruszyć o 2 pola do przodu z pozycji startowej (jeśli oba pola są puste)
 * - Bić na ukos
 * - Wykonać bicie w przelocie (en passant)
 */
function getPawnMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor,
  enPassantTarget: Position | null
): Position[] {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1; // Białe idą w górę (-1), czarne w dół (+1)
  const startRow = color === 'white' ? 6 : 1;

  // Ruch o 1 pole do przodu
  const oneForward: Position = { row: position.row + direction, col: position.col };
  if (isValidPosition(oneForward) && !board[oneForward.row][oneForward.col]) {
    moves.push(oneForward);

    // Ruch o 2 pola do przodu (tylko z pozycji startowej)
    if (position.row === startRow) {
      const twoForward: Position = { row: position.row + 2 * direction, col: position.col };
      if (!board[twoForward.row][twoForward.col]) {
        moves.push(twoForward);
      }
    }
  }

  // Bicie na ukos
  const capturePositions: Position[] = [
    { row: position.row + direction, col: position.col - 1 },
    { row: position.row + direction, col: position.col + 1 },
  ];

  for (const capturePos of capturePositions) {
    if (isValidPosition(capturePos)) {
      const targetPiece = board[capturePos.row][capturePos.col];
      // Normalne bicie
      if (targetPiece && targetPiece.color !== color) {
        moves.push(capturePos);
      }
      // Bicie w przelocie (en passant)
      // En passant jest możliwe gdy pion przeciwnika właśnie ruszył o 2 pola
      // i minął pole, na które nasz pion może bić
      if (enPassantTarget && positionsEqual(capturePos, enPassantTarget)) {
        moves.push(capturePos);
      }
    }
  }

  return moves;
}

/**
 * Generuje wszystkie możliwe ruchy dla skoczka
 *
 * Skoczek porusza się w kształcie litery "L":
 * - 2 pola w jednym kierunku i 1 pole prostopadle
 * - Może przeskakiwać nad innymi figurami
 */
function getKnightMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  // Wszystkie 8 możliwych ruchów skoczka (w kształcie L)
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  for (const [rowOffset, colOffset] of offsets) {
    const newPos: Position = {
      row: position.row + rowOffset,
      col: position.col + colOffset,
    };
    if (isValidPosition(newPos)) {
      const targetPiece = board[newPos.row][newPos.col];
      // Może stanąć na pustym polu lub zbić figurę przeciwnika
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

/**
 * Generuje ruchy w linii prostej (dla wieży, gońca i hetmana)
 *
 * Funkcja pomocnicza - iteruje w danym kierunku aż do:
 * - Krawędzi szachownicy
 * - Napotkania własnej figury (nie można tam stanąć)
 * - Napotkania figury przeciwnika (można zbić, ale nie iść dalej)
 */
function getSlidingMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor,
  directions: [number, number][]
): Position[] {
  const moves: Position[] = [];

  for (const [rowDir, colDir] of directions) {
    let currentPos: Position = {
      row: position.row + rowDir,
      col: position.col + colDir,
    };

    // Kontynuuj w danym kierunku aż do przeszkody
    while (isValidPosition(currentPos)) {
      const targetPiece = board[currentPos.row][currentPos.col];

      if (!targetPiece) {
        // Puste pole - można tam stanąć i kontynuować
        moves.push({ ...currentPos });
      } else if (targetPiece.color !== color) {
        // Figura przeciwnika - można zbić, ale nie można iść dalej
        moves.push({ ...currentPos });
        break;
      } else {
        // Własna figura - nie można tam stanąć ani iść dalej
        break;
      }

      currentPos = {
        row: currentPos.row + rowDir,
        col: currentPos.col + colDir,
      };
    }
  }

  return moves;
}

/**
 * Generuje ruchy dla gońca (po przekątnych)
 */
function getBishopMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor
): Position[] {
  // Kierunki po przekątnych
  const diagonalDirections: [number, number][] = [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];
  return getSlidingMoves(board, position, color, diagonalDirections);
}

/**
 * Generuje ruchy dla wieży (w pionie i poziomie)
 */
function getRookMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor
): Position[] {
  // Kierunki wzdłuż wierszy i kolumn
  const straightDirections: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];
  return getSlidingMoves(board, position, color, straightDirections);
}

/**
 * Generuje ruchy dla hetmana (kombinacja wieży i gońca)
 */
function getQueenMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor
): Position[] {
  // Hetman łączy ruchy wieży i gońca
  const allDirections: [number, number][] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  return getSlidingMoves(board, position, color, allDirections);
}

/**
 * Generuje ruchy dla króla (bez roszady - ta jest dodawana osobno)
 *
 * Król może ruszyć o 1 pole w dowolnym kierunku
 */
function getKingBasicMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  // Wszystkie 8 kierunków wokół króla
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  for (const [rowDir, colDir] of directions) {
    const newPos: Position = {
      row: position.row + rowDir,
      col: position.col + colDir,
    };
    if (isValidPosition(newPos)) {
      const targetPiece = board[newPos.row][newPos.col];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

// ============================================
// WYKRYWANIE SZACHA I ATAKU
// ============================================

/**
 * Sprawdza czy dane pole jest atakowane przez figury przeciwnika
 *
 * ALGORYTM:
 * Zamiast sprawdzać wszystkie figury przeciwnika, sprawdzamy z perspektywy
 * atakowanego pola - czy w każdym możliwym kierunku ataku znajduje się
 * figura, która może z tego kierunku atakować.
 *
 * Dla każdego typu ataku:
 * - Linie proste (wieża/hetman) - sprawdź 4 kierunki
 * - Przekątne (goniec/hetman) - sprawdź 4 kierunki
 * - Ruchy skoczka - sprawdź 8 pozycji
 * - Ataki piona - sprawdź 2 pozycje (ukośne)
 * - Ataki króla - sprawdź 8 pozycji
 */
export function isSquareAttacked(
  board: (Piece | null)[][],
  position: Position,
  attackerColor: PieceColor
): boolean {
  // Sprawdź ataki po liniach prostych (wieża, hetman)
  const straightDirections: [number, number][] = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];
  for (const [rowDir, colDir] of straightDirections) {
    let currentPos = { row: position.row + rowDir, col: position.col + colDir };
    while (isValidPosition(currentPos)) {
      const piece = board[currentPos.row][currentPos.col];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break; // Przeszkoda - nie sprawdzaj dalej w tym kierunku
      }
      currentPos = { row: currentPos.row + rowDir, col: currentPos.col + colDir };
    }
  }

  // Sprawdź ataki po przekątnych (goniec, hetman)
  const diagonalDirections: [number, number][] = [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];
  for (const [rowDir, colDir] of diagonalDirections) {
    let currentPos = { row: position.row + rowDir, col: position.col + colDir };
    while (isValidPosition(currentPos)) {
      const piece = board[currentPos.row][currentPos.col];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break;
      }
      currentPos = { row: currentPos.row + rowDir, col: currentPos.col + colDir };
    }
  }

  // Sprawdź ataki skoczka
  const knightOffsets: [number, number][] = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [rowOff, colOff] of knightOffsets) {
    const checkPos = { row: position.row + rowOff, col: position.col + colOff };
    if (isValidPosition(checkPos)) {
      const piece = board[checkPos.row][checkPos.col];
      if (piece && piece.color === attackerColor && piece.type === 'knight') {
        return true;
      }
    }
  }

  // Sprawdź ataki piona (bije na ukos)
  const pawnDirection = attackerColor === 'white' ? 1 : -1; // Z której strony atakuje pion
  const pawnAttacks: [number, number][] = [
    [pawnDirection, -1], [pawnDirection, 1],
  ];
  for (const [rowOff, colOff] of pawnAttacks) {
    const checkPos = { row: position.row + rowOff, col: position.col + colOff };
    if (isValidPosition(checkPos)) {
      const piece = board[checkPos.row][checkPos.col];
      if (piece && piece.color === attackerColor && piece.type === 'pawn') {
        return true;
      }
    }
  }

  // Sprawdź ataki króla (sąsiednie pola)
  const kingOffsets: [number, number][] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  for (const [rowOff, colOff] of kingOffsets) {
    const checkPos = { row: position.row + rowOff, col: position.col + colOff };
    if (isValidPosition(checkPos)) {
      const piece = board[checkPos.row][checkPos.col];
      if (piece && piece.color === attackerColor && piece.type === 'king') {
        return true;
      }
    }
  }

  return false;
}

/**
 * Sprawdza czy król danego koloru jest w szachu
 */
export function isInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos, getOppositeColor(color));
}

// ============================================
// ROSZADA
// ============================================

/**
 * Sprawdza możliwość roszady i zwraca dostępne ruchy roszady
 *
 * WARUNKI ROSZADY:
 * 1. Król i wieża nie mogły się wcześniej ruszyć
 * 2. Pola między królem a wieżą muszą być puste
 * 3. Król nie może być w szachu
 * 4. Król nie może przechodzić przez szachowane pole
 * 5. Król nie może skończyć na szachowanym polu
 */
function getCastlingMoves(
  board: (Piece | null)[][],
  position: Position,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  const piece = board[position.row][position.col];

  // Król musi nie być ruszany
  if (!piece || piece.type !== 'king' || piece.hasMoved) {
    return moves;
  }

  // Król nie może być w szachu
  if (isInCheck(board, color)) {
    return moves;
  }

  const row = color === 'white' ? 7 : 0;
  const enemyColor = getOppositeColor(color);

  // Roszada królewska (krótka) - w prawo
  const kingsideRook = board[row][7];
  if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
    // Sprawdź czy pola między królem a wieżą są puste
    if (!board[row][5] && !board[row][6]) {
      // Sprawdź czy król nie przechodzi przez szachowane pole
      if (!isSquareAttacked(board, { row, col: 5 }, enemyColor) &&
          !isSquareAttacked(board, { row, col: 6 }, enemyColor)) {
        moves.push({ row, col: 6 }); // Pozycja króla po roszadzie
      }
    }
  }

  // Roszada hetmańska (długa) - w lewo
  const queensideRook = board[row][0];
  if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
    // Sprawdź czy pola między królem a wieżą są puste
    if (!board[row][1] && !board[row][2] && !board[row][3]) {
      // Sprawdź czy król nie przechodzi przez szachowane pole
      if (!isSquareAttacked(board, { row, col: 2 }, enemyColor) &&
          !isSquareAttacked(board, { row, col: 3 }, enemyColor)) {
        moves.push({ row, col: 2 }); // Pozycja króla po roszadzie
      }
    }
  }

  return moves;
}

// ============================================
// WALIDACJA RUCHÓW
// ============================================

/**
 * Pobiera wszystkie pseudo-legalne ruchy dla figury
 * (bez sprawdzania czy ruch naraża króla na szach)
 */
export function getPseudoLegalMoves(
  board: (Piece | null)[][],
  position: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  let moves: Position[] = [];

  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, position, piece.color, enPassantTarget);
      break;
    case 'knight':
      moves = getKnightMoves(board, position, piece.color);
      break;
    case 'bishop':
      moves = getBishopMoves(board, position, piece.color);
      break;
    case 'rook':
      moves = getRookMoves(board, position, piece.color);
      break;
    case 'queen':
      moves = getQueenMoves(board, position, piece.color);
      break;
    case 'king':
      moves = [
        ...getKingBasicMoves(board, position, piece.color),
        ...getCastlingMoves(board, position, piece.color),
      ];
      break;
  }

  return moves;
}

/**
 * Filtruje ruchy, usuwając te, które naraziłyby króla na szach
 *
 * Dla każdego ruchu:
 * 1. Symuluj wykonanie ruchu na kopii szachownicy
 * 2. Sprawdź czy król jest w szachu po ruchu
 * 3. Jeśli tak - ruch jest nielegalny
 */
export function getValidMoves(
  board: (Piece | null)[][],
  position: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  const pseudoLegalMoves = getPseudoLegalMoves(board, position, enPassantTarget);

  // Filtruj ruchy - tylko te, które nie naraża króla na szach
  return pseudoLegalMoves.filter(move => {
    const testBoard = copyBoard(board);

    // Symuluj ruch
    testBoard[move.row][move.col] = testBoard[position.row][position.col];
    testBoard[position.row][position.col] = null;

    // Obsługa en passant - usuń zbitego piona
    if (piece.type === 'pawn' && enPassantTarget && positionsEqual(move, enPassantTarget)) {
      const capturedPawnRow = piece.color === 'white' ? move.row + 1 : move.row - 1;
      testBoard[capturedPawnRow][move.col] = null;
    }

    // Obsługa roszady - przesuń także wieżę
    if (piece.type === 'king' && Math.abs(move.col - position.col) === 2) {
      if (move.col === 6) {
        // Roszada królewska
        testBoard[move.row][5] = testBoard[move.row][7];
        testBoard[move.row][7] = null;
      } else if (move.col === 2) {
        // Roszada hetmańska
        testBoard[move.row][3] = testBoard[move.row][0];
        testBoard[move.row][0] = null;
      }
    }

    // Sprawdź czy król jest w szachu po ruchu
    return !isInCheck(testBoard, piece.color);
  });
}

// ============================================
// WYKRYWANIE MATA I PATA
// ============================================

/**
 * Sprawdza czy gracz ma jakiekolwiek legalne ruchy
 */
export function hasLegalMoves(
  board: (Piece | null)[][],
  color: PieceColor,
  enPassantTarget: Position | null
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, enPassantTarget);
        if (moves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Określa status gry
 */
export function getGameStatus(
  board: (Piece | null)[][],
  currentPlayer: PieceColor,
  enPassantTarget: Position | null
): GameStatus {
  const inCheck = isInCheck(board, currentPlayer);
  const hasMovesAvailable = hasLegalMoves(board, currentPlayer, enPassantTarget);

  if (!hasMovesAvailable) {
    if (inCheck) {
      return 'checkmate'; // Mat - brak ruchów i król w szachu
    }
    return 'stalemate'; // Pat - brak ruchów ale król nie w szachu
  }

  if (inCheck) {
    return 'check'; // Szach - ale są dostępne ruchy
  }

  return 'playing'; // Normalna gra
}

// ============================================
// WYKONYWANIE RUCHÓW
// ============================================

/**
 * Wykonuje ruch na szachownicy i zwraca nowy stan
 */
export function makeMove(
  state: GameState,
  from: Position,
  to: Position,
  promotion?: PieceType
): GameState {
  const newBoard = copyBoard(state.board);
  const piece = newBoard[from.row][from.col];

  if (!piece) return state;

  let capturedPiece = newBoard[to.row][to.col];
  let isEnPassant = false;
  let isCastling: 'kingside' | 'queenside' | null = null;
  let newEnPassantTarget: Position | null = null;

  // Obsługa bicia w przelocie
  if (piece.type === 'pawn' && state.enPassantTarget && positionsEqual(to, state.enPassantTarget)) {
    isEnPassant = true;
    const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    capturedPiece = newBoard[capturedPawnRow][to.col];
    newBoard[capturedPawnRow][to.col] = null;
  }

  // Ustawienie en passant target dla następnego ruchu
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    const enPassantRow = piece.color === 'white' ? from.row - 1 : from.row + 1;
    newEnPassantTarget = { row: enPassantRow, col: from.col };
  }

  // Obsługa roszady
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      // Roszada królewska
      isCastling = 'kingside';
      const rook = newBoard[from.row][7];
      if (rook) {
        newBoard[from.row][5] = { ...rook, hasMoved: true };
        newBoard[from.row][7] = null;
      }
    } else if (to.col === 2) {
      // Roszada hetmańska
      isCastling = 'queenside';
      const rook = newBoard[from.row][0];
      if (rook) {
        newBoard[from.row][3] = { ...rook, hasMoved: true };
        newBoard[from.row][0] = null;
      }
    }
  }

  // Wykonaj ruch
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  newBoard[from.row][from.col] = null;

  // Obsługa promocji piona
  let promotionType: PieceType | null = null;
  const promotionRow = piece.color === 'white' ? 0 : 7;
  if (piece.type === 'pawn' && to.row === promotionRow) {
    if (promotion) {
      newBoard[to.row][to.col] = { type: promotion, color: piece.color, hasMoved: true };
      promotionType = promotion;
    } else {
      // Promocja oczekująca - zwróć stan z flagą
      return {
        ...state,
        board: newBoard,
        promotionPending: to,
        enPassantTarget: newEnPassantTarget,
      };
    }
  }

  const nextPlayer = getOppositeColor(piece.color);
  const newStatus = getGameStatus(newBoard, nextPlayer, newEnPassantTarget);

  // Utwórz rekord ruchu
  const move: Move = {
    from,
    to,
    piece: { ...piece },
    capturedPiece,
    isCheck: newStatus === 'check' || newStatus === 'checkmate',
    isCheckmate: newStatus === 'checkmate',
    isCastling,
    isEnPassant,
    promotion: promotionType,
  };

  // Zaktualizuj zbite figury
  const newCapturedPieces = { ...state.capturedPieces };
  if (capturedPiece) {
    const capturedBy = piece.color;
    newCapturedPieces[capturedBy] = [...newCapturedPieces[capturedBy], capturedPiece];
  }

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedSquare: null,
    validMoves: [],
    moveHistory: [...state.moveHistory, move],
    capturedPieces: newCapturedPieces,
    gameStatus: newStatus,
    lastMove: move,
    enPassantTarget: newEnPassantTarget,
    promotionPending: null,
  };
}

// ============================================
// NOTACJA ALGEBRAICZNA
// ============================================

/**
 * Konwertuje ruch na notację algebraiczną
 *
 * Przykłady:
 * - e4 (pion na e4)
 * - Nf3 (skoczek na f3)
 * - Bxe5 (goniec bije na e5)
 * - O-O (roszada królewska)
 * - O-O-O (roszada hetmańska)
 * - e8=Q (promocja na hetmana)
 * - Qh4+ (hetman na h4 z szachem)
 * - Qf7# (hetman na f7 z matem)
 */
export function moveToAlgebraic(move: Move): string {
  // Roszada
  if (move.isCastling === 'kingside') return 'O-O';
  if (move.isCastling === 'queenside') return 'O-O-O';

  let notation = '';

  // Symbol figury (pion nie ma symbolu)
  const pieceSymbols: Record<PieceType, string> = {
    pawn: '',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K',
  };
  notation += pieceSymbols[move.piece.type];

  // Dla piona bijącego - dodaj kolumnę źródłową
  if (move.piece.type === 'pawn' && (move.capturedPiece || move.isEnPassant)) {
    notation += COLUMN_NAMES[move.from.col];
  }

  // Symbol bicia
  if (move.capturedPiece || move.isEnPassant) {
    notation += 'x';
  }

  // Pole docelowe
  notation += COLUMN_NAMES[move.to.col];
  notation += (8 - move.to.row).toString();

  // Promocja
  if (move.promotion) {
    notation += '=' + pieceSymbols[move.promotion];
  }

  // Szach lub mat
  if (move.isCheckmate) {
    notation += '#';
  } else if (move.isCheck) {
    notation += '+';
  }

  return notation;
}

// ============================================
// INICJALIZACJA SZACHOWNICY
// ============================================

/**
 * Tworzy początkową konfigurację szachownicy
 */
export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Ustawienie figur
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  // Czarne figury (rząd 0)
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'black', hasMoved: false };
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
  }

  // Białe figury (rząd 7)
  for (let col = 0; col < 8; col++) {
    board[7][col] = { type: backRow[col], color: 'white', hasMoved: false };
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }

  return board;
}

/**
 * Tworzy początkowy stan gry
 */
export function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    capturedPieces: {
      white: [],
      black: [],
    },
    gameStatus: 'playing',
    lastMove: null,
    enPassantTarget: null,
    promotionPending: null,
  };
}
