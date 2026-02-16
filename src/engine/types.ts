/**
 * Engine-specific types for the crossword generation system.
 * These are internal to the solver — the existing game types remain untouched.
 */

// ═══════════════════════════════════════════════════════════════
// Grid Templates
// ═══════════════════════════════════════════════════════════════

export type SymmetryType = 'rotational_180' | 'mirror_hv' | 'none';

export interface GridTemplate {
    id: string;
    size: number; // 7, 9, 11, 13, 15
    cells: boolean[][]; // true = white (letter), false = black
    symmetry: SymmetryType;
    slotCount: number; // precomputed
    avgSlotLength: number; // precomputed
    difficultyTier: 'easy' | 'medium' | 'hard';
}

// ═══════════════════════════════════════════════════════════════
// Slots & Constraints
// ═══════════════════════════════════════════════════════════════

export interface Intersection {
    otherSlotId: number;
    thisPosition: number; // index in THIS slot's word
    otherPosition: number; // index in OTHER slot's word
}

export interface Slot {
    id: number;
    direction: 'across' | 'down';
    row: number; // start row
    col: number; // start col
    length: number;
    cells: [number, number][]; // (row, col) pairs
    intersections: Intersection[];
    assignedWord: WordEntry | null;
    domain: WordEntry[]; // current candidates
    domainSnapshot: WordEntry[] | null; // for undo during backtracking
}

// ═══════════════════════════════════════════════════════════════
// Word Bank
// ═══════════════════════════════════════════════════════════════

export interface WordEntry {
    id: string;
    answer: string; // UPPERCASE Turkish
    length: number;
    clue: string;
    difficulty: 'easy' | 'medium' | 'hard';
    difficultyScore: number; // 1.0–10.0
    category: string;
    tags: string[];
    letterFreqScore: number; // lower = rarer letters
}

// ═══════════════════════════════════════════════════════════════
// Difficulty Configuration
// ═══════════════════════════════════════════════════════════════

export interface DifficultyConfig {
    level: number;
    gridSize: number;
    wordDifficultyBand: [number, number]; // [min, max]
    minWordLength: number;
    targetAvgWordLength: number;
    rareLetterRatioTarget: number;
    difficultyTier: 'easy' | 'medium' | 'hard';
}

// ═══════════════════════════════════════════════════════════════
// Puzzle Output
// ═══════════════════════════════════════════════════════════════

export interface GeneratedPuzzle {
    templateId: string;
    gridSize: number;
    words: GeneratedWord[];
    difficultyScore: number;
    level: number;
    seed: number;
}

export interface GeneratedWord {
    id: string;
    direction: 'across' | 'down';
    startRow: number;
    startCol: number;
    answer: string;
    clue: string;
    num: number;
    wordEntryId: string; // reference back to the word bank
}

// ═══════════════════════════════════════════════════════════════
// Solver Config
// ═══════════════════════════════════════════════════════════════

export interface SolverConfig {
    maxBacktrackDepth: number;
    maxTimeMs: number;
    rng: { next(): number; shuffle<T>(arr: T[]): T[] };
}
