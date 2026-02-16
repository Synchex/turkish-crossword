/**
 * Crossword Generator v1
 *
 * Pattern-based 15x15 crossword generator with backtracking fill.
 * Uses questions_tr.json as wordbank.
 * Deterministic when given the same seed.
 */

import { LevelData, Word } from '../game/types';
import { PATTERNS_15, Pattern15 } from './patterns15';
import questionsData from '../data/questions_db.json';

// ── Types ──

interface WordBankEntry {
    word: string;
    clue: string;
}

interface Slot {
    row: number;
    col: number;
    direction: 'across' | 'down';
    length: number;
}

interface FilledSlot extends Slot {
    word: string;
    clue: string;
}

// ── Seeded PRNG (mulberry32) ──

function mulberry32(seed: number) {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── Wordbank ──

function loadWordBank(): WordBankEntry[] {
    const raw = questionsData as Array<{
        answer: string;
        clue: string;
        answerLength: number;
    }>;
    const seen = new Set<string>();
    const bank: WordBankEntry[] = [];

    for (const q of raw) {
        const w = q.answer.toUpperCase().trim();
        // Skip words with spaces, hyphens, or that are too short
        if (w.length < 2 || /[\s\-']/.test(w) || seen.has(w)) continue;
        seen.add(w);
        bank.push({ word: w, clue: q.clue });
    }
    return bank;
}

let _bankCache: WordBankEntry[] | null = null;
function getWordBank(): WordBankEntry[] {
    if (!_bankCache) _bankCache = loadWordBank();
    return _bankCache;
}

// Group words by length for fast lookup
function buildLengthIndex(
    bank: WordBankEntry[],
    rng: () => number,
): Map<number, WordBankEntry[]> {
    const map = new Map<number, WordBankEntry[]>();
    for (const entry of bank) {
        const len = entry.word.length;
        if (!map.has(len)) map.set(len, []);
        map.get(len)!.push(entry);
    }
    // Shuffle each group with seeded RNG for deterministic variety
    for (const [len, entries] of map) {
        map.set(len, seededShuffle(entries, rng));
    }
    return map;
}

// ── Slot Extraction ──

function extractSlots(pattern: Pattern15): Slot[] {
    const size = pattern.length;
    const slots: Slot[] = [];

    // Across
    for (let r = 0; r < size; r++) {
        let c = 0;
        while (c < size) {
            if (pattern[r][c] === '.') {
                const start = c;
                while (c < size && pattern[r][c] === '.') c++;
                const len = c - start;
                if (len >= 2) {
                    slots.push({ row: r, col: start, direction: 'across', length: len });
                }
            } else {
                c++;
            }
        }
    }

    // Down
    for (let c = 0; c < size; c++) {
        let r = 0;
        while (r < size) {
            if (pattern[r][c] === '.') {
                const start = r;
                while (r < size && pattern[r][c] === '.') r++;
                const len = r - start;
                if (len >= 2) {
                    slots.push({ row: start, col: c, direction: 'down', length: len });
                }
            } else {
                r++;
            }
        }
    }

    return slots;
}

// ── Backtracking Fill ──

function fillGrid(
    pattern: Pattern15,
    slots: Slot[],
    lengthIndex: Map<number, WordBankEntry[]>,
    rng: () => number,
): FilledSlot[] | null {
    const size = pattern.length;
    // Grid of placed characters
    const grid: (string | null)[][] = Array.from({ length: size }, () =>
        Array(size).fill(null),
    );

    // Track used words
    const usedWords = new Set<string>();
    // Filled result
    const filled: (FilledSlot | null)[] = slots.map(() => null);

    // Sort by MRV — fewest candidates first (most constrained)
    const order = slots
        .map((s, i) => ({ slot: s, idx: i }))
        .sort((a, b) => {
            const aCount = lengthIndex.get(a.slot.length)?.length ?? 0;
            const bCount = lengthIndex.get(b.slot.length)?.length ?? 0;
            return aCount - bCount;
        });

    function getLetterAt(r: number, c: number): string | null {
        if (r < 0 || r >= size || c < 0 || c >= size) return null;
        return grid[r][c];
    }

    function fits(word: string, slot: Slot): boolean {
        for (let i = 0; i < word.length; i++) {
            const r = slot.direction === 'across' ? slot.row : slot.row + i;
            const c = slot.direction === 'across' ? slot.col + i : slot.col;
            const existing = getLetterAt(r, c);
            if (existing !== null && existing !== word[i]) return false;
        }
        return true;
    }

    function placeWord(word: string, slot: Slot): void {
        for (let i = 0; i < word.length; i++) {
            const r = slot.direction === 'across' ? slot.row : slot.row + i;
            const c = slot.direction === 'across' ? slot.col + i : slot.col;
            grid[r][c] = word[i];
        }
    }

    function removeWord(word: string, slot: Slot): void {
        for (let i = 0; i < word.length; i++) {
            const r = slot.direction === 'across' ? slot.row : slot.row + i;
            const c = slot.direction === 'across' ? slot.col + i : slot.col;
            // Only remove if no other slot depends on this cell
            // Simple approach: set to null only if it was placed by this word
            // We'll track by checking intersections after removal
            grid[r][c] = null;
        }
        // Restore letters from other placed words
        for (let oi = 0; oi < filled.length; oi++) {
            const f = filled[oi];
            if (!f) continue;
            for (let j = 0; j < f.word.length; j++) {
                const rr = f.direction === 'across' ? f.row : f.row + j;
                const cc = f.direction === 'across' ? f.col + j : f.col;
                grid[rr][cc] = f.word[j];
            }
        }
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 50000;

    function solve(depth: number): boolean {
        if (depth === order.length) return true;
        if (++attempts > MAX_ATTEMPTS) return false;

        const { slot, idx } = order[depth];
        const candidates = lengthIndex.get(slot.length);
        if (!candidates || candidates.length === 0) return false;

        for (const entry of candidates) {
            if (usedWords.has(entry.word)) continue;
            if (!fits(entry.word, slot)) continue;

            // Place
            placeWord(entry.word, slot);
            usedWords.add(entry.word);
            filled[idx] = { ...slot, word: entry.word, clue: entry.clue };

            if (solve(depth + 1)) return true;

            // Undo
            filled[idx] = null;
            usedWords.delete(entry.word);
            removeWord(entry.word, slot);
        }

        return false;
    }

    if (solve(0)) {
        return filled as FilledSlot[];
    }
    return null;
}

// ── Numbering ──

function numberGrid(
    filledSlots: FilledSlot[],
    size: number,
): { words: Word[]; numberedSlots: FilledSlot[] } {
    // Collect all positions that start a word
    const startPositions = new Map<string, number>();
    let nextNum = 1;

    // Sort slots by position (top-to-bottom, left-to-right)
    const sorted = [...filledSlots].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    const words: Word[] = [];

    for (const slot of sorted) {
        const key = `${slot.row},${slot.col}`;
        if (!startPositions.has(key)) {
            startPositions.set(key, nextNum++);
        }
        const num = startPositions.get(key)!;
        const wordId = `${slot.direction}_${num}`;
        words.push({
            id: wordId,
            direction: slot.direction,
            startRow: slot.row,
            startCol: slot.col,
            answer: slot.word,
            clue: slot.clue,
            num,
        });
    }

    return { words, numberedSlots: sorted };
}

// ── Public API ──

export interface GenerateOptions {
    seed: number;
    size?: 15;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GenerateResult {
    success: boolean;
    puzzle?: LevelData;
    puzzleId?: string;
    error?: string;
}

export function generateCrossword(options: GenerateOptions): GenerateResult {
    const { seed } = options;
    const rng = mulberry32(seed);

    const bank = getWordBank();
    const lengthIndex = buildLengthIndex(bank, rng);

    // Shuffle pattern order with seed for variety
    const patternOrder = seededShuffle(
        PATTERNS_15.map((p, i) => i),
        rng,
    );

    for (const pi of patternOrder) {
        const pattern = PATTERNS_15[pi];
        const slots = extractSlots(pattern);

        // Re-shuffle candidates for each pattern attempt
        const localIndex = buildLengthIndex(bank, rng);
        const result = fillGrid(pattern, slots, localIndex, rng);

        if (result) {
            const { words } = numberGrid(result, 15);
            const puzzleId = `${seed}_${pi}`;

            const puzzle: LevelData = {
                id: seed,
                gridSize: 15,
                words,
                difficulty: options.difficulty === 'easy'
                    ? 'Kolay'
                    : options.difficulty === 'hard'
                        ? 'Zor'
                        : 'Orta',
                title: `Bulmaca #${seed}`,
            };

            return { success: true, puzzle, puzzleId };
        }
    }

    return {
        success: false,
        error: 'Bulmaca olusturulamadi. Lutfen tekrar deneyin.',
    };
}
