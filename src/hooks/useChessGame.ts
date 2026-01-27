// ============================================
// HOOK ZARZĄDZAJĄCY STANEM GRY SZACHOWEJ
// ============================================

import { useReducer, useCallback, useEffect, useState, useRef } from 'react';
import type {
  GameState,
  GameAction,
  Position,
  PieceType,
  GameMode,
  AIDifficulty,
  PieceColor,
} from '../types/chess';
import {
  createInitialState,
  getValidMoves,
  makeMove,
  positionsEqual,
} from '../engine/chessLogic';
import { playSound } from '../utils/sounds';

// Dynamic import for chess AI - only loaded when needed
const loadChessAI = () => import('../engine/chessAI');

// Rozszerzony stan z historią i trybem analizy
interface GameStateWithHistory {
  current: GameState;
  history: GameState[];
  analysisMode: boolean;
  viewIndex: number;
}

// Rozszerzone akcje
type ExtendedGameAction =
  | GameAction
  | { type: 'UNDO_MOVE' }
  | { type: 'ENTER_ANALYSIS' }
  | { type: 'EXIT_ANALYSIS' }
  | { type: 'GO_TO_MOVE'; moveIndex: number }
  | { type: 'FIRST_MOVE' }
  | { type: 'PREV_MOVE' }
  | { type: 'NEXT_MOVE' }
  | { type: 'LAST_MOVE' }
  | { type: 'AI_MOVE'; from: Position; to: Position };

/**
 * Reducer zarządzający stanem gry szachowej
 */
function gameReducer(
  state: GameStateWithHistory,
  action: ExtendedGameAction
): GameStateWithHistory {
  switch (action.type) {
    case 'SELECT_SQUARE': {
      if (state.analysisMode) {
        return state;
      }

      const { position } = action;
      const piece = state.current.board[position.row][position.col];

      if (state.current.gameStatus === 'checkmate' || state.current.gameStatus === 'stalemate') {
        return state;
      }

      if (state.current.promotionPending) {
        return state;
      }

      if (piece && piece.color === state.current.currentPlayer) {
        const validMoves = getValidMoves(state.current.board, position, state.current.enPassantTarget);
        return {
          ...state,
          current: {
            ...state.current,
            selectedSquare: position,
            validMoves,
          },
        };
      }

      if (state.current.selectedSquare) {
        const isValidMove = state.current.validMoves.some(move =>
          positionsEqual(move, position)
        );

        if (isValidMove) {
          const newState = makeMove(state.current, state.current.selectedSquare, position);
          return {
            ...state,
            current: newState,
            history: [...state.history, state.current],
          };
        }
      }

      return {
        ...state,
        current: {
          ...state.current,
          selectedSquare: null,
          validMoves: [],
        },
      };
    }

    case 'MOVE_PIECE': {
      if (state.analysisMode) {
        return state;
      }

      const { from, to } = action;

      if (state.current.gameStatus === 'checkmate' || state.current.gameStatus === 'stalemate') {
        return state;
      }

      const validMoves = getValidMoves(state.current.board, from, state.current.enPassantTarget);
      const isValidMove = validMoves.some(move => positionsEqual(move, to));

      if (!isValidMove) {
        return state;
      }

      const newState = makeMove(state.current, from, to);
      return {
        ...state,
        current: newState,
        history: [...state.history, state.current],
      };
    }

    case 'AI_MOVE': {
      if (state.analysisMode) {
        return state;
      }

      const { from, to } = action;

      if (state.current.gameStatus === 'checkmate' || state.current.gameStatus === 'stalemate') {
        return state;
      }

      const newState = makeMove(state.current, from, to, 'queen'); // AI auto-promocja na hetmana
      return {
        ...state,
        current: newState,
        history: [...state.history, state.current],
      };
    }

    case 'PROMOTE_PAWN': {
      if (state.analysisMode || !state.current.promotionPending) {
        return state;
      }

      const { pieceType } = action;
      const position = state.current.promotionPending;

      const newBoard = state.current.board.map(row => row.map(piece => piece ? { ...piece } : null));
      const pawn = newBoard[position.row][position.col];

      if (pawn) {
        newBoard[position.row][position.col] = {
          type: pieceType,
          color: pawn.color,
          hasMoved: true,
        };
      }

      const updatedHistory = [...state.current.moveHistory];
      if (updatedHistory.length > 0) {
        const lastMove = { ...updatedHistory[updatedHistory.length - 1] };
        lastMove.promotion = pieceType;
        updatedHistory[updatedHistory.length - 1] = lastMove;
      }

      const nextPlayer = pawn?.color === 'white' ? 'black' : 'white';

      return {
        ...state,
        current: {
          ...state.current,
          board: newBoard,
          currentPlayer: nextPlayer,
          promotionPending: null,
          selectedSquare: null,
          validMoves: [],
          moveHistory: updatedHistory,
        },
      };
    }

    case 'UNDO_MOVE': {
      if (state.analysisMode || state.history.length === 0) {
        return state;
      }

      const newHistory = [...state.history];
      const previousState = newHistory.pop()!;

      return {
        ...state,
        current: {
          ...previousState,
          selectedSquare: null,
          validMoves: [],
        },
        history: newHistory,
      };
    }

    case 'ENTER_ANALYSIS': {
      if (state.history.length === 0) {
        return state;
      }

      return {
        ...state,
        analysisMode: true,
        viewIndex: state.history.length,
      };
    }

    case 'EXIT_ANALYSIS': {
      return {
        ...state,
        analysisMode: false,
        viewIndex: -1,
      };
    }

    case 'GO_TO_MOVE': {
      if (!state.analysisMode) {
        return state;
      }

      const { moveIndex } = action;
      const maxIndex = state.history.length;

      if (moveIndex < 0 || moveIndex > maxIndex) {
        return state;
      }

      return {
        ...state,
        viewIndex: moveIndex,
      };
    }

    case 'FIRST_MOVE': {
      if (!state.analysisMode) {
        return state;
      }
      return {
        ...state,
        viewIndex: 0,
      };
    }

    case 'PREV_MOVE': {
      if (!state.analysisMode || state.viewIndex <= 0) {
        return state;
      }
      return {
        ...state,
        viewIndex: state.viewIndex - 1,
      };
    }

    case 'NEXT_MOVE': {
      if (!state.analysisMode || state.viewIndex >= state.history.length) {
        return state;
      }
      return {
        ...state,
        viewIndex: state.viewIndex + 1,
      };
    }

    case 'LAST_MOVE': {
      if (!state.analysisMode) {
        return state;
      }
      return {
        ...state,
        viewIndex: state.history.length,
      };
    }

    case 'RESET_GAME': {
      return {
        current: createInitialState(),
        history: [],
        analysisMode: false,
        viewIndex: -1,
      };
    }

    default:
      return state;
  }
}

function initializeState(): GameStateWithHistory {
  return {
    current: createInitialState(),
    history: [],
    analysisMode: false,
    viewIndex: -1,
  };
}

/**
 * Hook dostarczający logikę gry szachowej
 */
export function useChessGame() {
  const [state, dispatch] = useReducer(gameReducer, null, initializeState);

  // Tryb gry i ustawienia AI
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Premove (kolejkowany ruch)
  const [premove, setPremove] = useState<{ from: Position; to: Position } | null>(null);
  const [premoveSelection, setPremoveSelection] = useState<Position | null>(null);

  // Podpowiedź najlepszego ruchu
  const [hint, setHint] = useState<{ from: Position; to: Position } | null>(null);
  const [isCalculatingHint, setIsCalculatingHint] = useState(false);

  // Pobierz stan do wyświetlenia
  const displayState = state.analysisMode
    ? (state.viewIndex === state.history.length
        ? state.current
        : state.history[state.viewIndex])
    : state.current;

  // Efekt wykonujący ruch AI
  useEffect(() => {
    if (
      gameMode !== 'ai' ||
      state.analysisMode ||
      state.current.currentPlayer === playerColor ||
      state.current.gameStatus === 'checkmate' ||
      state.current.gameStatus === 'stalemate' ||
      state.current.promotionPending
    ) {
      return;
    }

    setIsAIThinking(true);
    let cancelled = false;

    // Opóźnienie dla lepszego UX - symulacja "myślenia"
    const timeoutId = setTimeout(async () => {
      const { getAIMove } = await loadChessAI();
      if (cancelled) return;

      const aiMove = getAIMove(state.current, aiDifficulty);

      if (aiMove) {
        dispatch({ type: 'AI_MOVE', from: aiMove.from, to: aiMove.to });
      }

      setIsAIThinking(false);
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    gameMode,
    state.current.currentPlayer,
    state.current.gameStatus,
    state.current.promotionPending,
    state.analysisMode,
    playerColor,
    aiDifficulty,
    state.current,
  ]);

  // Efekt wykonujący premove gdy nadchodzi tura gracza
  useEffect(() => {
    if (
      !premove ||
      gameMode !== 'ai' ||
      state.current.currentPlayer !== playerColor ||
      state.current.gameStatus === 'checkmate' ||
      state.current.gameStatus === 'stalemate' ||
      isAIThinking
    ) {
      return;
    }

    // Sprawdź czy premove jest nadal legalny
    const piece = state.current.board[premove.from.row][premove.from.col];
    if (piece && piece.color === playerColor) {
      const validMoves = getValidMoves(state.current.board, premove.from, state.current.enPassantTarget);
      const isValid = validMoves.some(move => positionsEqual(move, premove.to));

      if (isValid) {
        // Wykonaj premove z małym opóźnieniem dla lepszego UX
        const timeoutId = setTimeout(() => {
          dispatch({ type: 'MOVE_PIECE', from: premove.from, to: premove.to });
          setPremove(null);
          setPremoveSelection(null);
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }

    // Premove nie jest już legalny - wyczyść
    setPremove(null);
    setPremoveSelection(null);
  }, [
    premove,
    gameMode,
    state.current.currentPlayer,
    state.current.gameStatus,
    state.current.board,
    state.current.enPassantTarget,
    playerColor,
    isAIThinking,
  ]);

  // Efekt odtwarzający dźwięki
  const lastMoveCountRef = useRef(0);
  const lastGameStatusRef = useRef(state.current.gameStatus);

  useEffect(() => {
    const currentMoveCount = state.current.moveHistory.length;
    const lastMove = state.current.lastMove;

    // Nowy ruch został wykonany
    if (currentMoveCount > lastMoveCountRef.current && lastMove) {
      // Sprawdź typ ruchu i odtwórz odpowiedni dźwięk
      if (state.current.gameStatus === 'checkmate' || state.current.gameStatus === 'stalemate') {
        playSound('gameEnd');
      } else if (state.current.gameStatus === 'check') {
        playSound('check');
      } else if (lastMove.isCastling) {
        playSound('castle');
      } else if (lastMove.promotion) {
        playSound('promote');
      } else if (lastMove.capturedPiece) {
        playSound('capture');
      } else {
        playSound('move');
      }
    }

    // Zawsze aktualizuj ref (ważne po cofnięciu ruchu)
    lastMoveCountRef.current = currentMoveCount;

    // Zmiana statusu gry (np. po promocji)
    if (state.current.gameStatus !== lastGameStatusRef.current) {
      if (state.current.gameStatus === 'checkmate' || state.current.gameStatus === 'stalemate') {
        playSound('gameEnd');
      }
      lastGameStatusRef.current = state.current.gameStatus;
    }
  }, [state.current.moveHistory.length, state.current.lastMove, state.current.gameStatus]);

  const selectSquare = useCallback((position: Position) => {
    // Blokuj ruchy gdy AI myśli - ale pozwól na premove
    if (isAIThinking && gameMode === 'ai') {
      // Premove - wybierz figurę gracza
      const piece = state.current.board[position.row][position.col];
      if (piece && piece.color === playerColor) {
        setPremoveSelection(position);
        setPremove(null);
        return;
      }

      // Premove - wybierz pole docelowe
      if (premoveSelection) {
        setPremove({ from: premoveSelection, to: position });
        setPremoveSelection(null);
        return;
      }

      // Anuluj premove jeśli kliknięto gdzie indziej
      setPremoveSelection(null);
      setPremove(null);
      return;
    }

    // Normalna tura gracza
    if (gameMode === 'ai' && state.current.currentPlayer !== playerColor) {
      // Premove podczas tury przeciwnika
      const piece = state.current.board[position.row][position.col];
      if (piece && piece.color === playerColor) {
        setPremoveSelection(position);
        setPremove(null);
        return;
      }

      if (premoveSelection) {
        setPremove({ from: premoveSelection, to: position });
        setPremoveSelection(null);
        return;
      }

      setPremoveSelection(null);
      setPremove(null);
      return;
    }

    // Wyczyść premove i hint gdy gracz wykonuje normalny ruch
    setPremove(null);
    setPremoveSelection(null);
    setHint(null);

    dispatch({ type: 'SELECT_SQUARE', position });
  }, [isAIThinking, gameMode, state.current.currentPlayer, state.current.board, playerColor, premoveSelection]);

  const movePiece = useCallback((from: Position, to: Position) => {
    // Premove podczas tury przeciwnika lub gdy AI myśli
    if (gameMode === 'ai' && (state.current.currentPlayer !== playerColor || isAIThinking)) {
      const piece = state.current.board[from.row][from.col];
      if (piece && piece.color === playerColor) {
        setPremove({ from, to });
        setPremoveSelection(null);
      }
      return;
    }

    // Wyczyść premove i hint gdy gracz wykonuje normalny ruch
    setPremove(null);
    setPremoveSelection(null);
    setHint(null);

    dispatch({ type: 'MOVE_PIECE', from, to });
  }, [isAIThinking, gameMode, state.current.currentPlayer, state.current.board, playerColor]);

  const promotePawn = useCallback((pieceType: PieceType) => {
    dispatch({ type: 'PROMOTE_PAWN', pieceType });
  }, []);

  const resetGame = useCallback(() => {
    setPremove(null);
    setPremoveSelection(null);
    hintCancelledRef.current = true;
    setHint(null);
    setIsCalculatingHint(false);
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const clearPremove = useCallback(() => {
    setPremove(null);
    setPremoveSelection(null);
  }, []);

  // Ref do anulowania obliczeń podpowiedzi
  const hintCancelledRef = useRef(false);

  // Funkcja do pobierania podpowiedzi
  const getHint = useCallback(() => {
    if (
      isCalculatingHint ||
      isAIThinking ||
      state.current.gameStatus === 'checkmate' ||
      state.current.gameStatus === 'stalemate' ||
      state.analysisMode
    ) {
      return;
    }

    setIsCalculatingHint(true);
    hintCancelledRef.current = false;

    // Oblicz najlepszy ruch (używamy depth 3 dla dobrej jakości)
    setTimeout(async () => {
      if (hintCancelledRef.current) return;
      const { findBestMove } = await loadChessAI();
      if (hintCancelledRef.current) return;
      const bestMove = findBestMove(state.current, 3);
      if (hintCancelledRef.current) return;
      setHint(bestMove);
      setIsCalculatingHint(false);
    }, 100);
  }, [isCalculatingHint, isAIThinking, state.current, state.analysisMode]);

  const clearHint = useCallback(() => {
    hintCancelledRef.current = true;
    setHint(null);
    setIsCalculatingHint(false);
  }, []);

  const undoMove = useCallback(() => {
    // W trybie AI cofnij 2 ruchy (gracz + AI)
    if (gameMode === 'ai' && state.history.length >= 2) {
      dispatch({ type: 'UNDO_MOVE' });
      dispatch({ type: 'UNDO_MOVE' });
    } else {
      dispatch({ type: 'UNDO_MOVE' });
    }
  }, [gameMode, state.history.length]);

  // Funkcje trybu analizy
  const enterAnalysis = useCallback(() => {
    dispatch({ type: 'ENTER_ANALYSIS' });
  }, []);

  const exitAnalysis = useCallback(() => {
    dispatch({ type: 'EXIT_ANALYSIS' });
  }, []);

  const goToMove = useCallback((moveIndex: number) => {
    dispatch({ type: 'GO_TO_MOVE', moveIndex });
  }, []);

  const firstMove = useCallback(() => {
    dispatch({ type: 'FIRST_MOVE' });
  }, []);

  const prevMove = useCallback(() => {
    dispatch({ type: 'PREV_MOVE' });
  }, []);

  const nextMove = useCallback(() => {
    dispatch({ type: 'NEXT_MOVE' });
  }, []);

  const lastMove = useCallback(() => {
    dispatch({ type: 'LAST_MOVE' });
  }, []);

  // Zmiana trybu gry
  const changeGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const changeAiDifficulty = useCallback((difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
  }, []);

  const changePlayerColor = useCallback((color: PieceColor) => {
    setPlayerColor(color);
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const isGameOver = state.current.gameStatus === 'checkmate' || state.current.gameStatus === 'stalemate';

  return {
    gameState: displayState,
    actualGameState: state.current,
    selectSquare,
    movePiece,
    promotePawn,
    resetGame,
    undoMove,
    canUndo: !state.analysisMode && state.history.length > 0 && !isAIThinking,
    // Tryb analizy
    analysisMode: state.analysisMode,
    enterAnalysis,
    exitAnalysis,
    goToMove,
    firstMove,
    prevMove,
    nextMove,
    lastMove,
    canEnterAnalysis: !state.analysisMode && state.history.length > 0,
    isGameOver,
    viewIndex: state.viewIndex,
    totalMoves: state.history.length,
    canGoPrev: state.analysisMode && state.viewIndex > 0,
    canGoNext: state.analysisMode && state.viewIndex < state.history.length,
    // Tryb gry z AI
    gameMode,
    aiDifficulty,
    playerColor,
    isAIThinking,
    changeGameMode,
    changeAiDifficulty,
    changePlayerColor,
    // Premove
    premove,
    premoveSelection,
    clearPremove,
    // Podpowiedź
    hint,
    isCalculatingHint,
    getHint,
    clearHint,
  };
}

export default useChessGame;
