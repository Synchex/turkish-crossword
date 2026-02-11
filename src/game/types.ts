export type Direction = 'across' | 'down';

export interface Word {
  id: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  answer: string; // UPPERCASE Turkish letters
  clue: string;
  num: number;
}

export interface LevelData {
  id: number;
  gridSize: number;
  words: Word[];
  difficulty: 'Kolay' | 'Orta' | 'Zor'; // Easy/Medium/Hard
  title: string;
}

export interface CellData {
  row: number;
  col: number;
  letter: string; // correct letter
  userLetter: string;
  isBlack: boolean;
  wordIds: string[]; // which words this cell belongs to
  number?: number; // clue number if this cell starts a word
  isLocked: boolean; // green/locked after correct check
  isRevealed: boolean; // hint-revealed
}

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0-3
  bestHearts: number;
  bestTime: number; // seconds
}

export interface GameState {
  grid: CellData[][];
  selectedCell: { row: number; col: number } | null;
  selectedWordId: string | null;
  selectedDirection: Direction;
  hearts: number;
  score: number;
  coins: number;
  timeElapsed: number;
  isComplete: boolean;
  lockedWordIds: Set<string>;
}
