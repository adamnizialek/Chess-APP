import { useMemo } from 'react';
import type { Piece } from '../types/chess';
import { evaluateBoard } from '../engine/evaluation';

interface EvaluationBarProps {
  board: (Piece | null)[][];
  flipped?: boolean;
}

/**
 * Pasek ewaluacji pokazujący przewagę gracza
 * Biały na dole, czarny na górze (lub odwrotnie gdy flipped)
 */
function EvaluationBar({ board, flipped = false }: EvaluationBarProps) {
  const evaluation = useMemo(() => evaluateBoard(board), [board]);

  // Konwertuj ewaluację na procent (50% = równa pozycja)
  // Używamy funkcji sigmoidalnej dla płynnego skalowania
  // Zakres ~1000 punktów (około 10 pionków) mapuje na 0-100%
  const whitePercent = useMemo(() => {
    const normalized = evaluation / 1000; // Normalizuj do zakresu -1 do 1
    const sigmoid = 1 / (1 + Math.exp(-normalized * 2)); // Sigmoid dla płynności
    return Math.round(sigmoid * 100);
  }, [evaluation]);

  const blackPercent = 100 - whitePercent;

  // Gdy szachownica jest odwrócona, odwróć też pasek
  const topPercent = flipped ? whitePercent : blackPercent;
  const bottomPercent = flipped ? blackPercent : whitePercent;
  const topColor = flipped ? 'bg-white' : 'bg-slate-900';
  const bottomColor = flipped ? 'bg-slate-900' : 'bg-white';

  return (
    <div className="w-4 md:w-5 rounded-sm overflow-hidden flex flex-col shadow-inner border border-slate-700">
      {/* Górna część (czarne lub białe gdy odwrócone) */}
      <div
        className={`${topColor} transition-all duration-300 ease-out`}
        style={{ flex: topPercent }}
      />
      {/* Dolna część (białe lub czarne gdy odwrócone) */}
      <div
        className={`${bottomColor} transition-all duration-300 ease-out`}
        style={{ flex: bottomPercent }}
      />
    </div>
  );
}

export default EvaluationBar;
