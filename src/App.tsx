// ============================================
// GŁÓWNY KOMPONENT APLIKACJI SZACHOWEJ
// ============================================

import { useState, useEffect, lazy, Suspense } from 'react';
import { useChessGame } from './hooks/useChessGame';
import { useChessClock } from './hooks/useChessClock';
import { ThemeProvider } from './context/ThemeContext';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import MoveHistory from './components/MoveHistory';
import CapturedPieces from './components/CapturedPieces';
import PromotionModal from './components/PromotionModal';
import Sidebar from './components/Sidebar';
import ChessClock from './components/ChessClock';
import GameActions from './components/GameActions';
import EvaluationBar from './components/EvaluationBar';
import { RotateCcw, Lightbulb, Maximize2 } from 'lucide-react';
import { useFullscreen } from './hooks/useFullscreen';
import { TIME_CONTROLS } from './types/chess';
import type { PieceColor } from './types/chess';

// Lazy load FullscreenBoard - only needed when user enters fullscreen mode
const FullscreenBoard = lazy(() => import('./components/FullscreenBoard'));

/**
 * Zawartość gry - wydzielona, aby móc używać kontekstu motywu
 */
function GameContent() {
  const {
    gameState,
    actualGameState,
    selectSquare,
    movePiece,
    promotePawn,
    resetGame,
    undoMove,
    canUndo,
    // Tryb analizy
    analysisMode,
    enterAnalysis,
    exitAnalysis,
    goToMove,
    firstMove,
    prevMove,
    nextMove,
    lastMove,
    canEnterAnalysis,
    viewIndex,
    canGoPrev,
    canGoNext,
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
    // Podpowiedź
    hint,
    isCalculatingHint,
    getHint,
  } = useChessGame();

  // Stan obrotu szachownicy
  const [isBoardFlipped, setIsBoardFlipped] = useState(false);

  // Fullscreen
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen();

  // Zegar szachowy
  const {
    whiteTime,
    blackTime,
    isRunning: isClockRunning,
    timeOutColor,
    startClock,
    stopClock,
    switchTurn,
    resetClock,
    timeControl,
    setTimeControl,
  } = useChessClock();

  // Inicjalizuj zegar domyślną wartością
  useEffect(() => {
    if (!timeControl) {
      setTimeControl(TIME_CONTROLS[0]); // "Bez limitu" domyślnie
    }
  }, [timeControl, setTimeControl]);

  // Automatyczny obrót szachownicy
  useEffect(() => {
    if (gameMode === 'ai') {
      // W trybie AI: obróć gdy gracz gra czarnymi
      setIsBoardFlipped(playerColor === 'black');
    } else {
      // W trybie PvP: obróć po każdym ruchu (czarne na dole gdy ich tura)
      setIsBoardFlipped(gameState.currentPlayer === 'black');
    }
  }, [gameMode, playerColor, gameState.currentPlayer]);

  // Uruchom zegar po pierwszym ruchu
  const moveCount = actualGameState.moveHistory.length;
  useEffect(() => {
    if (moveCount === 1 && timeControl && timeControl.initialTime > 0) {
      startClock();
    }
  }, [moveCount, timeControl, startClock]);

  // Przełącz zegar po każdym ruchu
  useEffect(() => {
    if (moveCount > 0 && timeControl && timeControl.initialTime > 0) {
      switchTurn(gameState.currentPlayer);
    }
  }, [moveCount, gameState.currentPlayer, timeControl, switchTurn]);

  // Zatrzymaj zegar gdy gra się kończy
  useEffect(() => {
    if (actualGameState.gameStatus === 'checkmate' || actualGameState.gameStatus === 'stalemate') {
      stopClock();
    }
  }, [actualGameState.gameStatus, stopClock]);

  // Stan rezygnacji i propozycji remisu
  const [resignedColor, setResignedColor] = useState<PieceColor | null>(null);
  const [drawOfferedBy, setDrawOfferedBy] = useState<PieceColor | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  // Resetuj stan przy nowej grze
  useEffect(() => {
    if (moveCount === 0) {
      setResignedColor(null);
      setDrawOfferedBy(null);
      setIsDraw(false);
    }
  }, [moveCount]);

  // Obsługa rezygnacji
  const handleResign = (color: PieceColor) => {
    setResignedColor(color);
    stopClock();
  };

  // Obsługa propozycji remisu
  const handleDrawOffer = () => {
    setDrawOfferedBy(gameState.currentPlayer);
  };

  const handleDrawAccept = () => {
    setIsDraw(true);
    stopClock();
  };

  const handleDrawDecline = () => {
    setDrawOfferedBy(null);
  };

  // Obsługa zmiany kontroli czasu
  const handleTimeControlChange = (tc: typeof TIME_CONTROLS[0]) => {
    setTimeControl(tc);
    resetGame();
  };

  // Sprawdź czy gra się zakończyła
  const isGameOver =
    actualGameState.gameStatus === 'checkmate' ||
    actualGameState.gameStatus === 'stalemate' ||
    resignedColor !== null ||
    isDraw ||
    timeOutColor !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Menu boczne */}
      <Sidebar
        gameMode={gameMode}
        aiDifficulty={aiDifficulty}
        playerColor={playerColor}
        timeControl={timeControl}
        onGameModeChange={changeGameMode}
        onAiDifficultyChange={changeAiDifficulty}
        onPlayerColorChange={changePlayerColor}
        onTimeControlChange={handleTimeControlChange}
      />

      {/* Nagłówek - obok przycisku menu */}
      <header className="fixed left-20 top-4 z-30 h-12 flex items-center gap-4">
        <a href="/" className="text-2xl md:text-3xl font-bold text-white tracking-tight hover:text-emerald-400 transition-colors whitespace-nowrap">
          ♔ Szachy
        </a>
        {/* Komunikaty statusu */}
        <div className="h-6 flex items-center">
          {analysisMode && (
            <span className="text-emerald-400 text-sm">Tryb analizy</span>
          )}
          {isAIThinking && (
            <span className="text-blue-400 text-sm animate-pulse">Komputer myśli...</span>
          )}
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="container mx-auto px-4 pb-8 pt-16">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Szachownica z paskiem ewaluacji */}
          <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center pt-6 md:pt-0">
            <div className="w-full max-w-[min(85vh,500px)] md:max-w-[min(85vh,580px)] lg:max-w-[min(85vh,750px)] xl:max-w-[min(85vh,850px)] grid grid-cols-[auto_1fr] gap-2">
              <EvaluationBar board={gameState.board} flipped={isBoardFlipped} />
              <div className="aspect-square">
                <Board
                  gameState={gameState}
                  onSquareClick={selectSquare}
                  onMovePiece={movePiece}
                  flipped={isBoardFlipped}
                  premove={premove}
                  premoveSelection={premoveSelection}
                  hint={hint}
                />
              </div>
            </div>
            {/* Informacja o trybie gry i przycisk obrotu */}
            <div className="mt-2 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-slate-800/60 text-slate-400 text-xs flex items-center gap-2">
                {gameMode === 'pvp' ? (
                  <span>Gracz vs Gracz</span>
                ) : (
                  <>
                    <span>vs Komputer</span>
                    <span className="text-slate-500">•</span>
                    <span className={
                      aiDifficulty === 'easy' ? 'text-green-400' :
                      aiDifficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {aiDifficulty === 'easy' ? 'Łatwy' : aiDifficulty === 'medium' ? 'Średni' : 'Trudny'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>{playerColor === 'white' ? 'Białe' : 'Czarne'}</span>
                  </>
                )}
              </div>
              <button
                onClick={getHint}
                disabled={isCalculatingHint || analysisMode || isGameOver}
                className={`p-1.5 rounded-full transition-colors ${
                  hint
                    ? 'bg-yellow-500/80 text-white'
                    : isCalculatingHint
                    ? 'bg-slate-800/60 text-slate-500 cursor-wait'
                    : 'bg-slate-800/60 text-slate-400 hover:text-yellow-400 hover:bg-slate-700'
                } ${(analysisMode || isGameOver) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={hint ? 'Podpowiedź aktywna' : 'Pokaż podpowiedź'}
              >
                <Lightbulb className={`w-4 h-4 ${isCalculatingHint ? 'animate-pulse' : ''}`} />
              </button>
              <button
                onClick={() => setIsBoardFlipped(!isBoardFlipped)}
                className="p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Obróć szachownicę"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Pełny ekran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel boczny */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Status gry */}
            <GameStatus
              status={timeOutColor ? 'checkmate' : (analysisMode ? actualGameState.gameStatus : gameState.gameStatus)}
              currentPlayer={analysisMode ? actualGameState.currentPlayer : gameState.currentPlayer}
              onNewGame={() => {
                resetGame();
                if (timeControl) resetClock(timeControl);
              }}
              onUndo={undoMove}
              canUndo={canUndo}
              timeOutColor={timeOutColor}
              resignedColor={resignedColor}
              isDraw={isDraw}
            />

            {/* Akcje gry (rezygnacja, remis) */}
            {!analysisMode && (
              <GameActions
                currentPlayer={gameState.currentPlayer}
                gameMode={gameMode}
                isGameOver={isGameOver}
                onResign={handleResign}
                onDrawOffer={handleDrawOffer}
                onDrawAccept={handleDrawAccept}
                onDrawDecline={handleDrawDecline}
                drawOfferedBy={drawOfferedBy}
              />
            )}

            {/* Zegar szachowy */}
            {timeControl && timeControl.initialTime > 0 && (
              <ChessClock
                whiteTime={whiteTime}
                blackTime={blackTime}
                currentPlayer={gameState.currentPlayer}
                isRunning={isClockRunning && !analysisMode && actualGameState.gameStatus !== 'checkmate' && actualGameState.gameStatus !== 'stalemate'}
              />
            )}

            {/* Zbite figury */}
            <CapturedPieces capturedPieces={gameState.capturedPieces} />

            {/* Historia ruchów */}
            <MoveHistory
              moves={actualGameState.moveHistory}
              analysisMode={analysisMode}
              viewIndex={viewIndex}
              onMoveClick={goToMove}
              onEnterAnalysis={enterAnalysis}
              onExitAnalysis={exitAnalysis}
              onFirstMove={firstMove}
              onPrevMove={prevMove}
              onNextMove={nextMove}
              onLastMove={lastMove}
              canEnterAnalysis={canEnterAnalysis}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
            />
          </div>
        </div>
      </main>

      {/* Modal promocji piona */}
      {actualGameState.promotionPending && !isFullscreen && (
        <PromotionModal
          color={actualGameState.currentPlayer}
          onSelect={promotePawn}
        />
      )}

      {/* Fullscreen board overlay */}
      {isFullscreen && (
        <Suspense fallback={<div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center"><div className="text-white">Ładowanie...</div></div>}>
          <FullscreenBoard
            gameState={gameState}
            actualGameState={actualGameState}
            onSquareClick={selectSquare}
            onMovePiece={movePiece}
            onPromotePawn={promotePawn}
            flipped={isBoardFlipped}
            onFlipBoard={() => setIsBoardFlipped(!isBoardFlipped)}
            onExit={exitFullscreen}
            premove={premove}
            premoveSelection={premoveSelection}
            hint={hint}
          />
        </Suspense>
      )}

    </div>
  );
}

/**
 * Główny komponent aplikacji szachowej
 */
function App() {
  return (
    <ThemeProvider>
      <GameContent />
    </ThemeProvider>
  );
}

export default App;
