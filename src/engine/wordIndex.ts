/**
 * Word bank indexing system.
 * Builds O(1) lookup indices for candidate filtering:
 *   - By word length
 *   - By letter at position (e.g., "3:A" = letter A at index 3)
 *   - By difficulty tier
 */

import { WordEntry } from './types';

// ═══════════════════════════════════════════════════════════════
// Turkish Letter Frequency Data
// ═══════════════════════════════════════════════════════════════

const TURKISH_LETTER_FREQ: Record<string, number> = {
    E: 0.087, A: 0.085, İ: 0.07, N: 0.067, R: 0.063,
    L: 0.056, K: 0.051, D: 0.047, T: 0.046, S: 0.042,
    M: 0.037, U: 0.034, Y: 0.033, B: 0.028, O: 0.025,
    Ü: 0.019, Ş: 0.017, Z: 0.01, Ç: 0.012, H: 0.011,
    G: 0.01, P: 0.009, Ö: 0.007, C: 0.007, V: 0.004,
    F: 0.003, Ğ: 0.003, J: 0.001, I: 0.05,
};

const RARE_LETTERS = new Set(['Ğ', 'Ş', 'Ç', 'Ü', 'Ö', 'İ', 'Â']);

// ═══════════════════════════════════════════════════════════════
// Word Entry Scoring
// ═══════════════════════════════════════════════════════════════

function computeLetterFreqScore(word: string): number {
    let total = 0;
    for (const ch of word) {
        total += TURKISH_LETTER_FREQ[ch] ?? 0.005;
    }
    return total / word.length;
}

function computeDifficultyScore(
    word: string,
    baseDifficulty: 'easy' | 'medium' | 'hard',
    tags: string[]
): number {
    // Length factor (longer = harder)
    const lengthFactor = Math.min(word.length * 0.8, 7.5);

    // Rare letter ratio
    let rareCount = 0;
    for (const ch of word) {
        if (RARE_LETTERS.has(ch)) rareCount++;
    }
    const rareRatio = (rareCount / word.length) * 10;

    // Base difficulty contribution
    const baseFactor = baseDifficulty === 'easy' ? 2.0 : baseDifficulty === 'medium' ? 5.0 : 7.5;

    // Tag-based modifiers
    const isArchaic = tags.some(t => t === 'eski dil' || t === 'edebi');
    const archaicBonus = isArchaic ? 2.0 : 0;

    // Weighted composite
    const score = 0.3 * lengthFactor + 0.25 * baseFactor + 0.25 * rareRatio + 0.2 * archaicBonus;

    return Math.round(Math.max(1, Math.min(10, score)) * 10) / 10;
}

// ═══════════════════════════════════════════════════════════════
// Index Builder
// ═══════════════════════════════════════════════════════════════

export interface WordIndex {
    /** All word entries */
    all: WordEntry[];

    /** Words grouped by length: length → WordEntry[] */
    byLength: Map<number, WordEntry[]>;

    /** Words matching a letter at a position: "pos:letter" → Set<word_index> */
    byLetterPosition: Map<string, Set<number>>;

    /** Words grouped by difficulty tier */
    byDifficulty: Map<string, WordEntry[]>;

    /** Lookup word by ID */
    byId: Map<string, WordEntry>;
}

/**
 * Raw question format from questions_tr.json
 */
interface RawQuestion {
    id: string;
    type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    level: number;
    answer: string;
    answerLength: number;
    category: string;
    clue: string;
    tags: string[];
    createdAt: string;
}

/**
 * Build all indices from raw question data.
 * Call once at app startup; reuse the index for all puzzle generations.
 */
export function buildWordIndex(rawQuestions: RawQuestion[]): WordIndex {
    const all: WordEntry[] = [];
    const byLength = new Map<number, WordEntry[]>();
    const byLetterPosition = new Map<string, Set<number>>();
    const byDifficulty = new Map<string, WordEntry[]>();
    const byId = new Map<string, WordEntry>();

    for (const q of rawQuestions) {
        // Normalize answer to uppercase Turkish
        const answer = q.answer.toLocaleUpperCase('tr-TR');
        const length = answer.length;

        if (length < 2) continue; // skip single-letter entries

        const entry: WordEntry = {
            id: q.id,
            answer,
            length,
            clue: q.clue,
            difficulty: q.difficulty,
            difficultyScore: computeDifficultyScore(answer, q.difficulty, q.tags),
            category: q.category,
            tags: q.tags,
            letterFreqScore: computeLetterFreqScore(answer),
        };

        const idx = all.length;
        all.push(entry);

        // Index by length
        if (!byLength.has(length)) byLength.set(length, []);
        byLength.get(length)!.push(entry);

        // Index by letter-position
        for (let i = 0; i < answer.length; i++) {
            const key = `${i}:${answer[i]}`;
            if (!byLetterPosition.has(key)) byLetterPosition.set(key, new Set());
            byLetterPosition.get(key)!.add(idx);
        }

        // Index by difficulty
        if (!byDifficulty.has(q.difficulty)) byDifficulty.set(q.difficulty, []);
        byDifficulty.get(q.difficulty)!.push(entry);

        // Index by ID
        byId.set(entry.id, entry);
    }

    return { all, byLength, byLetterPosition, byDifficulty, byId };
}

// ═══════════════════════════════════════════════════════════════
// Pattern Matching
// ═══════════════════════════════════════════════════════════════

/**
 * Find all words matching a pattern with fixed letters at certain positions.
 * Pattern: array of (letter | null). null = any letter.
 *
 * Example: [null, 'A', null, null, 'K'] matches _A__K
 */
export function patternMatch(
    index: WordIndex,
    pattern: (string | null)[],
    length: number,
    difficultyBand: [number, number] | null,
    excludeIds: Set<string>
): WordEntry[] {
    // Start with all words of correct length
    let candidates = index.byLength.get(length);
    if (!candidates || candidates.length === 0) return [];

    // Apply letter-position constraints
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== null) {
            const key = `${i}:${pattern[i]}`;
            const matchingIndices = index.byLetterPosition.get(key);
            if (!matchingIndices || matchingIndices.size === 0) return [];

            // Filter candidates to those whose index is in the matching set
            const matchingEntries = new Set(
                Array.from(matchingIndices).map(idx => index.all[idx].id)
            );
            candidates = candidates.filter(w => matchingEntries.has(w.id));

            if (candidates.length === 0) return [];
        }
    }

    // Apply difficulty band filter
    if (difficultyBand) {
        candidates = candidates.filter(
            w => w.difficultyScore >= difficultyBand[0] && w.difficultyScore <= difficultyBand[1]
        );
    }

    // Exclude already-used words
    if (excludeIds.size > 0) {
        candidates = candidates.filter(w => !excludeIds.has(w.id));
    }

    return candidates;
}

/**
 * Build a pattern from a slot's current intersection constraints.
 * Uses the grid state (what words have been assigned to crossing slots).
 */
export function buildPatternForSlot(
    slot: { length: number; intersections: { otherSlotId: number; thisPosition: number; otherPosition: number }[] },
    allSlots: { assignedWord: WordEntry | null }[]
): (string | null)[] {
    const pattern: (string | null)[] = new Array(slot.length).fill(null);

    for (const ix of slot.intersections) {
        const otherSlot = allSlots[ix.otherSlotId];
        if (otherSlot.assignedWord) {
            pattern[ix.thisPosition] = otherSlot.assignedWord.answer[ix.otherPosition];
        }
    }

    return pattern;
}
