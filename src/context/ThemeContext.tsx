// ============================================
// KONTEKST MOTYWU SZACHOWNICY
// ============================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { BoardTheme } from '../types/theme';
import { defaultTheme, availableThemes } from '../types/theme';

interface ThemeContextType {
  theme: BoardTheme;
  setTheme: (themeId: string) => void;
  availableThemes: BoardTheme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<BoardTheme>(() => {
    // Próba odczytania zapisanego motywu z localStorage
    const savedThemeId = localStorage.getItem('chess-theme');
    if (savedThemeId) {
      const savedTheme = availableThemes.find(t => t.id === savedThemeId);
      if (savedTheme) return savedTheme;
    }
    return defaultTheme;
  });

  const setTheme = useCallback((themeId: string) => {
    const newTheme = availableThemes.find(t => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
      localStorage.setItem('chess-theme', themeId);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
