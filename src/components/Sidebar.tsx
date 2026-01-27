// ============================================
// KOMPONENT ROZSUWANEGO MENU BOCZNEGO
// ============================================

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { GameMode, AIDifficulty, PieceColor, TimeControl } from '../types/chess';
import { TIME_CONTROLS } from '../types/chess';
import { isSoundMuted, setSoundMuted } from '../utils/sounds';
import { Menu, X, Palette, Check, Users, Bot, Zap, Brain, GraduationCap, Clock, Volume2, VolumeX } from 'lucide-react';

interface SidebarProps {
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColor: PieceColor;
  timeControl: TimeControl | null;
  onGameModeChange: (mode: GameMode) => void;
  onAiDifficultyChange: (difficulty: AIDifficulty) => void;
  onPlayerColorChange: (color: PieceColor) => void;
  onTimeControlChange: (tc: TimeControl) => void;
}

/**
 * Rozsuwane menu boczne z ustawieniami
 */
export function Sidebar({
  gameMode,
  aiDifficulty,
  playerColor,
  timeControl,
  onGameModeChange,
  onAiDifficultyChange,
  onPlayerColorChange,
  onTimeControlChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundMuted, setSoundMutedState] = useState(isSoundMuted());
  const [isScrolling, setIsScrolling] = useState(false);
  const { theme, setTheme, availableThemes } = useTheme();

  // Ukryj przycisk menu podczas przewijania na mobile
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleSoundToggle = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    setSoundMutedState(newMuted);
  };

  const gameModes: { id: GameMode; name: string; icon: typeof Users; description: string }[] = [
    { id: 'pvp', name: 'Gracz vs Gracz', icon: Users, description: 'Gra lokalna dla dwóch osób' },
    { id: 'ai', name: 'Gracz vs Komputer', icon: Bot, description: 'Zagraj przeciwko AI' },
  ];

  const difficulties: { id: AIDifficulty; name: string; icon: typeof Zap; description: string }[] = [
    { id: 'easy', name: 'Łatwy', icon: Zap, description: 'Dla początkujących' },
    { id: 'medium', name: 'Średni', icon: Brain, description: 'Zrównoważony poziom' },
    { id: 'hard', name: 'Trudny', icon: GraduationCap, description: 'Dla zaawansowanych' },
  ];

  const colors: { id: PieceColor; name: string }[] = [
    { id: 'white', name: 'Białe' },
    { id: 'black', name: 'Czarne' },
  ];

  return (
    <>
      {/* Przycisk otwierania menu */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed left-4 top-4 z-40
          p-3 rounded-xl
          bg-slate-800/80 hover:bg-slate-700
          text-slate-200 hover:text-white
          backdrop-blur-sm
          border border-slate-700
          transition-all duration-200
          shadow-lg
          ${isScrolling ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}
        `}
        aria-label="Otwórz menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel boczny */}
      <div
        className={`
          fixed left-0 top-0 z-50
          h-full w-96 max-w-[90vw]
          bg-slate-900 border-r border-slate-700
          shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Nagłówek */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            Ustawienia
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="
              p-2 rounded-lg
              text-slate-400 hover:text-white
              hover:bg-slate-800
              transition-colors
            "
            aria-label="Zamknij menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zawartość */}
        <div className="p-4 overflow-y-auto h-[calc(100%-73px)] space-y-6">
          {/* Sekcja trybu gry */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tryb gry
            </h3>

            <div className="space-y-2">
              {gameModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onGameModeChange(mode.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl
                      transition-all duration-200
                      ${gameMode === mode.id
                        ? 'bg-emerald-600/20 border-2 border-emerald-500'
                        : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-slate-600'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${gameMode === mode.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <div className="flex-1 text-left">
                      <span className="font-medium text-slate-200 block">{mode.name}</span>
                      <span className="text-xs text-slate-500">{mode.description}</span>
                    </div>
                    {gameMode === mode.id && (
                      <Check className="w-5 h-5 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sekcja ustawień AI (tylko gdy tryb AI) */}
          {gameMode === 'ai' && (
            <>
              {/* Poziom trudności */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Poziom trudności
                </h3>

                <div className="space-y-2">
                  {difficulties.map((diff) => {
                    const Icon = diff.icon;
                    return (
                      <button
                        key={diff.id}
                        onClick={() => onAiDifficultyChange(diff.id)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-xl
                          transition-all duration-200
                          ${aiDifficulty === diff.id
                            ? 'bg-blue-600/20 border-2 border-blue-500'
                            : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-slate-600'}
                        `}
                      >
                        <Icon className={`w-5 h-5 ${aiDifficulty === diff.id ? 'text-blue-400' : 'text-slate-400'}`} />
                        <div className="flex-1 text-left">
                          <span className="font-medium text-slate-200 block">{diff.name}</span>
                          <span className="text-xs text-slate-500">{diff.description}</span>
                        </div>
                        {aiDifficulty === diff.id && (
                          <Check className="w-5 h-5 text-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wybór koloru */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Graj jako
                </h3>

                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onPlayerColorChange(color.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                        transition-all duration-200
                        ${playerColor === color.id
                          ? 'bg-purple-600/20 border-2 border-purple-500'
                          : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-slate-600'}
                      `}
                    >
                      <div
                        className={`
                          w-6 h-6 rounded-full
                          ${color.id === 'white'
                            ? 'bg-white'
                            : 'bg-slate-800 border-2 border-slate-500'}
                        `}
                      />
                      <span className="font-medium text-slate-200">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sekcja kontroli czasu */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Kontrola czasu
            </h3>

            <div className="flex flex-wrap gap-2">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => onTimeControlChange(tc)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${timeControl?.id === tc.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}
                  `}
                >
                  {tc.name}
                  {tc.increment > 0 && (
                    <span className="ml-1 text-xs opacity-70">+{tc.increment}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sekcja dźwięku */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Dźwięk
            </h3>

            <button
              onClick={handleSoundToggle}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl
                transition-all duration-200
                ${!soundMuted
                  ? 'bg-emerald-600/20 border-2 border-emerald-500'
                  : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-slate-600'}
              `}
            >
              {soundMuted ? (
                <VolumeX className="w-5 h-5 text-slate-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
              <span className="flex-1 text-left font-medium text-slate-200">
                {soundMuted ? 'Dźwięk wyłączony' : 'Dźwięk włączony'}
              </span>
              {!soundMuted && (
                <Check className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Sekcja motywów */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Motyw szachownicy
            </h3>

            <div className="space-y-2">
              {availableThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl
                    transition-all duration-200
                    ${theme.id === t.id
                      ? 'bg-emerald-600/20 border-2 border-emerald-500'
                      : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-slate-600'}
                  `}
                >
                  {/* Podgląd kolorów motywu */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner">
                    <div className={`${t.lightSquare}`} />
                    <div className={`${t.darkSquare}`} />
                    <div className={`${t.darkSquare}`} />
                    <div className={`${t.lightSquare}`} />
                  </div>

                  {/* Nazwa motywu */}
                  <span className="flex-1 text-left font-medium text-slate-200">
                    {t.name}
                  </span>

                  {/* Znacznik wyboru */}
                  {theme.id === t.id && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Informacje */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Zmiana trybu gry rozpoczyna nową partię
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
