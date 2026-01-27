// ============================================
// TYPY I DEFINICJE MOTYWÓW SZACHOWNICY
// ============================================

export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  selectedLight: string;
  selectedDark: string;
  lastMoveLight: string;
  lastMoveDark: string;
  validMoveDot: string;
  validMoveRing: string;
  checkSquare: string;
}

// Motyw domyślny - nowoczesny, ciemny
export const defaultTheme: BoardTheme = {
  id: 'default',
  name: 'Nowoczesny',
  lightSquare: 'bg-slate-300',
  darkSquare: 'bg-slate-600',
  selectedLight: 'bg-yellow-300',
  selectedDark: 'bg-yellow-600',
  lastMoveLight: 'bg-amber-200',
  lastMoveDark: 'bg-amber-500',
  validMoveDot: 'bg-black/30',
  validMoveRing: 'border-black/30',
  checkSquare: 'bg-red-600',
};

// Motyw klasyczny - tradycyjne kolory szachownicy
export const classicTheme: BoardTheme = {
  id: 'classic',
  name: 'Klasyczny',
  lightSquare: 'bg-amber-100',
  darkSquare: 'bg-amber-800',
  selectedLight: 'bg-lime-300',
  selectedDark: 'bg-lime-600',
  lastMoveLight: 'bg-yellow-200',
  lastMoveDark: 'bg-yellow-600',
  validMoveDot: 'bg-black/25',
  validMoveRing: 'border-black/40',
  checkSquare: 'bg-red-500',
};

// Motyw drewniany
export const woodTheme: BoardTheme = {
  id: 'wood',
  name: 'Drewniany',
  lightSquare: 'bg-orange-200',
  darkSquare: 'bg-orange-900',
  selectedLight: 'bg-emerald-300',
  selectedDark: 'bg-emerald-600',
  lastMoveLight: 'bg-lime-200',
  lastMoveDark: 'bg-lime-700',
  validMoveDot: 'bg-black/30',
  validMoveRing: 'border-black/40',
  checkSquare: 'bg-red-600',
};

// Motyw niebieski
export const blueTheme: BoardTheme = {
  id: 'blue',
  name: 'Niebieski',
  lightSquare: 'bg-blue-100',
  darkSquare: 'bg-blue-700',
  selectedLight: 'bg-cyan-300',
  selectedDark: 'bg-cyan-600',
  lastMoveLight: 'bg-sky-200',
  lastMoveDark: 'bg-sky-500',
  validMoveDot: 'bg-white/40',
  validMoveRing: 'border-white/50',
  checkSquare: 'bg-red-500',
};

// Lista wszystkich dostępnych motywów
export const availableThemes: BoardTheme[] = [
  defaultTheme,
  classicTheme,
  woodTheme,
  blueTheme,
];
