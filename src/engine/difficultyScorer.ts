/**
 * Post-generation difficulty scoring.
 * Computes a numeric score (1.0–10.0) for a filled puzzle.
 */

import { Slot, DifficultyConfig, WordEntry } from './types';

// ═══════════════════════════════════════════════════════════════
// Difficulty Scorer
// ═══════════════════════════════════════════════════════════════

const RARE_LETTERS = new Set(['Ğ', 'Ş', 'Ç', 'Ü', 'Ö', 'İ', 'Â']);

export interface PuzzleMetrics {
    avgWordDifficulty: number;
    maxWordDifficulty: number;
    avgWordLength: number;
    intersectionDensity: number;
    rareLetterRatio: number;
    wordCount: number;
}

/**
 * Compute difficulty metrics for a filled puzzle.
 */
export function computeMetrics(slots: Slot[]): PuzzleMetrics {
    const filledSlots = slots.filter(s => s.assignedWord !== null);
    if (filledSlots.length === 0) {
        return { avgWordDifficulty: 0, maxWordDifficulty: 0, avgWordLength: 0, intersectionDensity: 0, rareLetterRatio: 0, wordCount: 0 };
    }

    const scores = filledSlots.map(s => s.assignedWord!.difficultyScore);
    const lengths = filledSlots.map(s => s.assignedWord!.length);

    // All letters in the puzzle
    let allLetters = '';
    for (const s of filledSlots) {
        allLetters += s.assignedWord!.answer;
    }

    let rareCount = 0;
    for (const ch of allLetters) {
        if (RARE_LETTERS.has(ch)) rareCount++;
    }

    const totalIntersections = filledSlots.reduce((sum, s) => sum + s.intersections.length, 0) / 2; // each counted twice

    return {
        avgWordDifficulty: scores.reduce((a, b) => a + b, 0) / scores.length,
        maxWordDifficulty: Math.max(...scores),
        avgWordLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
        intersectionDensity: totalIntersections / filledSlots.length,
        rareLetterRatio: allLetters.length > 0 ? rareCount / allLetters.length : 0,
        wordCount: filledSlots.length,
    };
}

/**
 * Normalize a value into [0, 10] scale given known min/max bounds.
 */
function normalize(value: number, min: number, max: number): number {
    if (max <= min) return 5;
    return Math.max(0, Math.min(10, ((value - min) / (max - min)) * 10));
}

/**
 * Compute a composite difficulty score (1.0–10.0) from metrics.
 */
export function scorePuzzle(metrics: PuzzleMetrics): number {
    const score =
        0.30 * metrics.avgWordDifficulty +
        0.15 * metrics.maxWordDifficulty +
        0.15 * normalize(metrics.avgWordLength, 2, 10) +
        0.15 * normalize(metrics.intersectionDensity, 0.5, 3.0) +
        0.15 * normalize(metrics.rareLetterRatio, 0, 0.5) +
        0.10 * normalize(metrics.wordCount, 5, 35);

    return Math.round(Math.max(1, Math.min(10, score)) * 10) / 10;
}

// ═══════════════════════════════════════════════════════════════
// Difficulty Configuration by Level
// ═══════════════════════════════════════════════════════════════

const DIFFICULTY_BANDS: Record<string, [number, number]> = {
    easy: [1.0, 4.0],
    medium: [3.0, 6.5],
    hard: [5.0, 9.0],
};

export function getDifficultyConfig(level: number): DifficultyConfig {
    // NOTE: Grid sizes capped at 9×9 for current ~700-word bank.
    // When word bank grows to 2000+, enable 11×11 and 13×13 grids.
    // Difficulty bands are wide to ensure sufficient candidates for the solver.

    if (level <= 5) {
        return {
            level,
            gridSize: 7,
            wordDifficultyBand: [1.0, 6.0],
            minWordLength: 2,
            targetAvgWordLength: 3.5,
            rareLetterRatioTarget: 0.08,
            difficultyTier: 'easy',
        };
    }
    if (level <= 10) {
        return {
            level,
            gridSize: 7,
            wordDifficultyBand: [1.0, 8.0],
            minWordLength: 2,
            targetAvgWordLength: 4.0,
            rareLetterRatioTarget: 0.12,
            difficultyTier: 'medium',
        };
    }
    if (level <= 20) {
        return {
            level,
            gridSize: 9,
            wordDifficultyBand: [1.0, 10.0], // full range for 9×9
            minWordLength: 2,
            targetAvgWordLength: 4.5,
            rareLetterRatioTarget: 0.18,
            difficultyTier: 'medium',
        };
    }
    // Expert (21+)
    return {
        level,
        gridSize: 9,
        wordDifficultyBand: [1.0, 10.0],
        minWordLength: 3,
        targetAvgWordLength: 5.0,
        rareLetterRatioTarget: 0.22,
        difficultyTier: 'hard',
    };
}

/**
 * Check if a puzzle score falls within the target difficulty band.
 */
export function isInDifficultyBand(
    score: number,
    tier: 'easy' | 'medium' | 'hard'
): boolean {
    const band = DIFFICULTY_BANDS[tier];
    return score >= band[0] && score <= band[1];
}
