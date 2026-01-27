// ============================================
// BAZA OTWARĆ SZACHOWYCH
// ============================================

import type { Move } from '../types/chess';

interface Opening {
  name: string;
  moves: string; // Format: "e2e4 e7e5 g1f3" (from-to pairs)
}

// Baza popularnych otwarć szachowych
const OPENINGS_DATABASE: Opening[] = [
  // ========== OTWARCIA NA 1.e4 ==========

  // Włoska
  { name: 'Partia Włoska', moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5' },
  { name: 'Partia Włoska - Giuoco Piano', moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3' },
  { name: 'Partia Włoska - Atak Evansa', moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4' },

  // Hiszpańska (Ruy Lopez)
  { name: 'Partia Hiszpańska', moves: 'e2e4 e7e5 g1f3 b8c6 f1b5' },
  { name: 'Partia Hiszpańska - Obrona Berlińska', moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6' },
  { name: 'Partia Hiszpańska - Wariant Morphy\'ego', moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6' },
  { name: 'Partia Hiszpańska - Wariant Zamknięty', moves: 'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 f1a4 g8f6 e1g1' },

  // Sycylijska
  { name: 'Obrona Sycylijska', moves: 'e2e4 c7c5' },
  { name: 'Obrona Sycylijska - Wariant Otwarty', moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4' },
  { name: 'Obrona Sycylijska - Wariant Najdorfa', moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6' },
  { name: 'Obrona Sycylijska - Wariant Drakona', moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6' },
  { name: 'Obrona Sycylijska - Wariant Scheveningeński', moves: 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e6' },
  { name: 'Obrona Sycylijska - Wariant Alapina', moves: 'e2e4 c7c5 c2c3' },
  { name: 'Obrona Sycylijska - Atak Grand Prix', moves: 'e2e4 c7c5 f2f4' },
  { name: 'Obrona Sycylijska - Wariant Zamknięty', moves: 'e2e4 c7c5 b1c3' },

  // Francuska
  { name: 'Obrona Francuska', moves: 'e2e4 e7e6' },
  { name: 'Obrona Francuska - Wariant Wymienny', moves: 'e2e4 e7e6 d2d4 d7d5 e4d5' },
  { name: 'Obrona Francuska - Wariant Awansowy', moves: 'e2e4 e7e6 d2d4 d7d5 e4e5' },
  { name: 'Obrona Francuska - Wariant Tarrascha', moves: 'e2e4 e7e6 d2d4 d7d5 b1d2' },
  { name: 'Obrona Francuska - Wariant Winawera', moves: 'e2e4 e7e6 d2d4 d7d5 b1c3 f8b4' },
  { name: 'Obrona Francuska - Wariant Klasyczny', moves: 'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6' },

  // Caro-Kann
  { name: 'Obrona Caro-Kann', moves: 'e2e4 c7c6' },
  { name: 'Obrona Caro-Kann - Wariant Awansowy', moves: 'e2e4 c7c6 d2d4 d7d5 e4e5' },
  { name: 'Obrona Caro-Kann - Wariant Klasyczny', moves: 'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5' },
  { name: 'Obrona Caro-Kann - Wariant Wymienny', moves: 'e2e4 c7c6 d2d4 d7d5 e4d5 c6d5' },

  // Skandynawska
  { name: 'Obrona Skandynawska', moves: 'e2e4 d7d5' },
  { name: 'Obrona Skandynawska - Wariant z Dd6', moves: 'e2e4 d7d5 e4d5 d8d5 b1c3 d5d6' },
  { name: 'Obrona Skandynawska - Wariant z Da5', moves: 'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5' },

  // Pirc
  { name: 'Obrona Pirca', moves: 'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6' },
  { name: 'Obrona Pirca - Atak Austriacki', moves: 'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 f2f4' },

  // Alekhine
  { name: 'Obrona Alekhina', moves: 'e2e4 g8f6' },
  { name: 'Obrona Alekhina - Wariant Czterech Pionów', moves: 'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6 c2c4 d5b6 f2f4' },

  // Partia Szkocka
  { name: 'Partia Szkocka', moves: 'e2e4 e7e5 g1f3 b8c6 d2d4' },
  { name: 'Partia Szkocka - Wariant Klasyczny', moves: 'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4' },
  { name: 'Gambit Szkocki', moves: 'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f1c4' },

  // Obrona Węgierska i inne
  { name: 'Obrona Węgierska', moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 f8e7' },
  { name: 'Obrona Rosyjska (Pietrowa)', moves: 'e2e4 e7e5 g1f3 g8f6' },
  { name: 'Obrona Filidor', moves: 'e2e4 e7e5 g1f3 d7d6' },

  // Gambit Królewski
  { name: 'Gambit Królewski', moves: 'e2e4 e7e5 f2f4' },
  { name: 'Gambit Królewski Przyjęty', moves: 'e2e4 e7e5 f2f4 e5f4' },
  { name: 'Gambit Królewski Odrzucony', moves: 'e2e4 e7e5 f2f4 f8c5' },

  // Partia Wiedeńska
  { name: 'Partia Wiedeńska', moves: 'e2e4 e7e5 b1c3' },

  // Partia Centrowa
  { name: 'Partia Centrowa', moves: 'e2e4 e7e5 d2d4' },

  // Partia Biskupia
  { name: 'Partia Biskupia', moves: 'e2e4 e7e5 f1c4' },

  // ========== OTWARCIA NA 1.d4 ==========

  // Gambit Hetmański
  { name: 'Gambit Hetmański', moves: 'd2d4 d7d5 c2c4' },
  { name: 'Gambit Hetmański Przyjęty', moves: 'd2d4 d7d5 c2c4 d5c4' },
  { name: 'Gambit Hetmański Odrzucony', moves: 'd2d4 d7d5 c2c4 e7e6' },
  { name: 'Obrona Słowiańska', moves: 'd2d4 d7d5 c2c4 c7c6' },
  { name: 'Obrona Półsłowiańska', moves: 'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6' },
  { name: 'Obrona Słowiańska - Wariant Merana', moves: 'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 e7e6 e2e3 b8d7 f1d3 d5c4' },

  // Obrona Królewskoindyjska
  { name: 'Obrona Królewskoindyjska', moves: 'd2d4 g8f6 c2c4 g7g6' },
  { name: 'Obrona Królewskoindyjska - Wariant Klasyczny', moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8 f1e2' },
  { name: 'Obrona Królewskoindyjska - Atak Samisch', moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f3' },
  { name: 'Obrona Królewskoindyjska - Wariant Czterech Pionów', moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 f2f4' },

  // Obrona Nimzoindyjska
  { name: 'Obrona Nimzoindyjska', moves: 'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4' },
  { name: 'Obrona Nimzoindyjska - Wariant Rubinsteina', moves: 'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3' },
  { name: 'Obrona Nimzoindyjska - Wariant Kasparowa', moves: 'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 g1f3' },

  // Obrona Hetmańskoindyjska
  { name: 'Obrona Hetmańskoindyjska', moves: 'd2d4 g8f6 c2c4 e7e6 g1f3 b7b6' },

  // Obrona Grünfelda
  { name: 'Obrona Grünfelda', moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5' },
  { name: 'Obrona Grünfelda - Wariant Wymienny', moves: 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5 c4d5 f6d5 e2e4 d5c3 b2c3' },

  // Obrona Holenderska
  { name: 'Obrona Holenderska', moves: 'd2d4 f7f5' },
  { name: 'Obrona Holenderska - Wariant Leningradzki', moves: 'd2d4 f7f5 g2g3 g8f6 f1g2 g7g6' },
  { name: 'Obrona Holenderska - Wariant Kamienny Mur', moves: 'd2d4 f7f5 g1f3 g8f6 g2g3 e7e6 f1g2 f8e7' },

  // Obrona Benoni
  { name: 'Obrona Benoni', moves: 'd2d4 g8f6 c2c4 c7c5' },
  { name: 'Obrona Benoni - Wariant Nowoczesny', moves: 'd2d4 g8f6 c2c4 c7c5 d4d5 e7e6' },

  // Obrona Bogo-indyjska
  { name: 'Obrona Bogo-indyjska', moves: 'd2d4 g8f6 c2c4 e7e6 g1f3 f8b4' },

  // System Londyński
  { name: 'System Londyński', moves: 'd2d4 d7d5 c1f4' },
  { name: 'System Londyński', moves: 'd2d4 g8f6 c1f4' },

  // System Colle
  { name: 'System Colle', moves: 'd2d4 d7d5 g1f3 g8f6 e2e3' },

  // Torre Attack
  { name: 'Atak Torre', moves: 'd2d4 g8f6 g1f3 e7e6 c1g5' },

  // Trompowsky
  { name: 'Atak Trompowsky\'ego', moves: 'd2d4 g8f6 c1g5' },

  // ========== OTWARCIA NA 1.c4 (ANGIELSKIE) ==========

  { name: 'Partia Angielska', moves: 'c2c4' },
  { name: 'Partia Angielska - Symetryczna', moves: 'c2c4 c7c5' },
  { name: 'Partia Angielska - Sycylijska Odwrócona', moves: 'c2c4 e7e5' },

  // ========== OTWARCIA NA 1.Nf3 (RÉTI) ==========

  { name: 'Debiut Rétiego', moves: 'g1f3 d7d5 c2c4' },
  { name: 'Debiut Rétiego', moves: 'g1f3' },

  // ========== INNE OTWARCIA ==========

  // Bird
  { name: 'Debiut Birda', moves: 'f2f4' },
  { name: 'Gambit Froma', moves: 'f2f4 e7e5' },

  // Sokolski (Orangutan)
  { name: 'Debiut Sokolskiego', moves: 'b2b4' },

  // Grob
  { name: 'Debiut Groba', moves: 'g2g4' },

  // Nimzo-Larsen
  { name: 'Atak Nimzowitscha-Larsena', moves: 'b2b3' },

  // Fianchetto królewskie
  { name: 'Fianchetto Królewskie', moves: 'g2g3' },

  // Podstawowe odpowiedzi
  { name: 'Partia Włoska - Wstęp', moves: 'e2e4 e7e5 g1f3 b8c6 f1c4' },
  { name: 'Obrona Dwóch Skoczków', moves: 'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6' },
];

/**
 * Konwertuje ruch na prosty format "e2e4"
 */
function moveToSimpleNotation(move: Move): string {
  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fromCol = colNames[move.from.col];
  const fromRow = 8 - move.from.row;
  const toCol = colNames[move.to.col];
  const toRow = 8 - move.to.row;
  return `${fromCol}${fromRow}${toCol}${toRow}`;
}

/**
 * Konwertuje historię ruchów na ciąg znaków do porównania
 */
function movesToString(moves: Move[]): string {
  return moves.map(moveToSimpleNotation).join(' ');
}

/**
 * Wykrywa nazwę otwarcia na podstawie historii ruchów
 * Zwraca najdłuższe pasujące otwarcie
 */
export function detectOpening(moves: Move[]): string | null {
  if (moves.length === 0) return null;

  const moveString = movesToString(moves);

  let bestMatch: Opening | null = null;
  let bestMatchLength = 0;

  for (const opening of OPENINGS_DATABASE) {
    // Sprawdź czy otwarcie jest prefiksem naszych ruchów lub czy nasze ruchy są prefiksem otwarcia
    if (moveString.startsWith(opening.moves) || opening.moves.startsWith(moveString)) {
      const openingMoveCount = opening.moves.split(' ').length;

      // Preferuj dłuższe otwarcia (bardziej szczegółowe)
      // Ale tylko jeśli mamy wystarczająco dużo ruchów
      const matchedMoves = Math.min(moves.length, openingMoveCount);

      if (matchedMoves > bestMatchLength ||
          (matchedMoves === bestMatchLength && openingMoveCount > (bestMatch?.moves.split(' ').length || 0))) {
        // Sprawdź czy rzeczywiście pasuje
        const openingMoves = opening.moves.split(' ').slice(0, moves.length).join(' ');
        const ourMoves = moveString.split(' ').slice(0, openingMoves.split(' ').length).join(' ');

        if (openingMoves === ourMoves) {
          bestMatch = opening;
          bestMatchLength = matchedMoves;
        }
      }
    }
  }

  return bestMatch?.name || null;
}
