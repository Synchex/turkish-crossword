/**
 * Top-level puzzle generation orchestrator.
 *
 * Flow:
 * 1. Select template based on level/difficulty
 * 2. Extract slots
 * 3. Initialize word domains
 * 4. Run CSP solver
 * 5. Score difficulty
 * 6. Emit puzzle or retry
 */

import { GeneratedPuzzle, GeneratedWord, Slot } from './types';
import { SeededRandom } from './seededRandom';
import { getTemplatesBySize, getTemplatesByTier, extractSlots, getAllTemplates } from './templates';
import { WordIndex, buildWordIndex } from './wordIndex';
import { solve, initializeDomains } from './cspSolver';
import {
    getDifficultyConfig,
    scorePuzzle,
    computeMetrics,
    isInDifficultyBand,
} from './difficultyScorer';

// ═══════════════════════════════════════════════════════════════
// Singleton Word Index
// ═══════════════════════════════════════════════════════════════

let _wordIndex: WordIndex | null = null;

/**
 * Initialize the word index from raw question data.
 * Must be called once before generating puzzles.
 */
export function initializeEngine(rawQuestions: any[]): void {
    _wordIndex = buildWordIndex(rawQuestions);
}

function getWordIndex(): WordIndex {
    if (!_wordIndex) {
        throw new Error('Engine not initialized. Call initializeEngine() first.');
    }
    return _wordIndex;
}

// ═══════════════════════════════════════════════════════════════
// Main Generator
// ═══════════════════════════════════════════════════════════════

export interface GenerateOptions {
    level: number;
    seed?: number;
    excludeWordIds?: Set<string>;
}

/**
 * Generate a crossword puzzle procedurally.
 *
 * @param options Level, seed, and optional word exclusions
 * @returns GeneratedPuzzle or null if unable to generate
 */
export function generatePuzzle(options: GenerateOptions): GeneratedPuzzle | null {
    const { level, excludeWordIds = new Set() } = options;
    const seed = options.seed ?? Date.now();
    const rng = new SeededRandom(seed);

    const wordIndex = getWordIndex();
    const config = getDifficultyConfig(level);

    // Build template candidate list: prefer target size, then fall back to others
    const targetTemplates = getTemplatesBySize(config.gridSize);
    const tierTemplates = getTemplatesByTier(config.difficultyTier)
        .filter(t => !targetTemplates.includes(t));
    const allOther = getAllTemplates()
        .filter(t => !targetTemplates.includes(t) && !tierTemplates.includes(t));

    const templateCandidates = rng.shuffle([
        ...targetTemplates,
        ...tierTemplates,
        ...allOther,
    ]);

    const MAX_TEMPLATE_RETRIES = Math.min(templateCandidates.length, 8);
    const MAX_DIFFICULTY_RETRIES = 4;

    // Attempt limits by grid size (total solver iterations)
    const attemptLimits: Record<number, number> = {
        7: 2000,
        9: 5000,
        11: 8000,
        13: 12000,
        15: 15000,
    };

    for (let templateIdx = 0; templateIdx < MAX_TEMPLATE_RETRIES; templateIdx++) {
        const template = templateCandidates[templateIdx];

        // Extract slots for this template
        const slots = extractSlots(template);
        if (slots.length === 0) continue;

        // Check that we have at least SOME words for all slot lengths
        const maxSlotLen = Math.max(...slots.map(s => s.length));
        let hasEnoughWords = true;
        for (const slot of slots) {
            const available = wordIndex.byLength.get(slot.length);
            if (!available || available.length === 0) {
                hasEnoughWords = false;
                break;
            }
        }
        if (!hasEnoughWords) continue;

        // Try generating with this template, progressively widening difficulty
        let difficultyBand: [number, number] | null = [...config.wordDifficultyBand] as [number, number];

        for (let diffRetry = 0; diffRetry < MAX_DIFFICULTY_RETRIES; diffRetry++) {
            // Fresh slots for each attempt
            const attemptSlots = extractSlots(template);

            // Initialize domains (null band = all words accepted)
            initializeDomains(attemptSlots, wordIndex, difficultyBand, excludeWordIds);

            // Check all slots have at least 1 candidate
            const emptySlots = attemptSlots.filter(s => s.domain.length === 0);
            if (emptySlots.length > 0) {
                // Widen band, then try null (all words)
                if (difficultyBand) {
                    difficultyBand = [
                        Math.max(1.0, difficultyBand[0] - 2.0),
                        Math.min(10.0, difficultyBand[1] + 2.0),
                    ];
                    // If band is already maxed out, drop it entirely
                    if (difficultyBand[0] <= 1.0 && difficultyBand[1] >= 10.0) {
                        difficultyBand = null;
                    }
                }
                continue;
            }

            // Solve
            const result = solve(attemptSlots, {
                maxBacktrackDepth: attemptLimits[template.size] ?? 800,
                maxTimeMs: 3000,
                rng,
            });

            if (!result.success) continue;

            // Score difficulty
            const metrics = computeMetrics(result.slots);
            const score = scorePuzzle(metrics);

            // Accept the puzzle (difficulty scoring is informational)
            return buildOutput(result.slots, template.id, template.size, score, level, seed);
        }
    }

    // All retries exhausted — return null (caller should handle gracefully)
    return null;
}

// ═══════════════════════════════════════════════════════════════
// Output Builder
// ═══════════════════════════════════════════════════════════════

function buildOutput(
    slots: Slot[],
    templateId: string,
    gridSize: number,
    difficultyScore: number,
    level: number,
    seed: number
): GeneratedPuzzle {
    // Get filled slots, sorted by position (top-left to bottom-right)
    const filledSlots = slots
        .filter(s => s.assignedWord !== null)
        .sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            if (a.col !== b.col) return a.col - b.col;
            // Across before down at same position
            return a.direction === 'across' ? -1 : 1;
        });

    // Assign clue numbers
    // Standard crossword numbering: assign number to each cell that starts a word,
    // in reading order (top-left to bottom-right)
    const cellNumbers = new Map<string, number>();
    let currentNum = 1;

    for (const slot of filledSlots) {
        const key = `${slot.row},${slot.col}`;
        if (!cellNumbers.has(key)) {
            cellNumbers.set(key, currentNum++);
        }
    }

    const words: GeneratedWord[] = filledSlots.map(slot => {
        const key = `${slot.row},${slot.col}`;
        const num = cellNumbers.get(key)!;

        return {
            id: `${num}${slot.direction === 'across' ? 'a' : 'd'}`,
            direction: slot.direction,
            startRow: slot.row,
            startCol: slot.col,
            answer: slot.assignedWord!.answer,
            clue: slot.assignedWord!.clue,
            num,
            wordEntryId: slot.assignedWord!.id,
        };
    });

    return {
        templateId,
        gridSize,
        words,
        difficultyScore,
        level,
        seed,
    };
}

// ═══════════════════════════════════════════════════════════════
// Convenience: Convert to existing LevelData format
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a GeneratedPuzzle to the existing LevelData format
 * used by the game UI.
 */
export function toLevelData(puzzle: GeneratedPuzzle): {
    id: number;
    gridSize: number;
    words: { id: string; direction: 'across' | 'down'; startRow: number; startCol: number; answer: string; clue: string; num: number }[];
    difficulty: 'Kolay' | 'Orta' | 'Zor';
    title: string;
} {
    const diffMap: Record<string, 'Kolay' | 'Orta' | 'Zor'> = {
        easy: 'Kolay',
        medium: 'Orta',
        hard: 'Zor',
    };

    const tier = puzzle.difficultyScore <= 4 ? 'easy' : puzzle.difficultyScore <= 7 ? 'medium' : 'hard';

    const titles: Record<string, string[]> = {
        easy: ['Başlangıç', 'Isınma', 'Harfler', 'İlk Adım', 'Kolay Bulmaca'],
        medium: ['Kelime Avı', 'Keşif', 'Zihin Jimnastiği', 'Meydan Okuma', 'Bilgi Küpü'],
        hard: ['Kelime Üstadı', 'Zorlu Yarış', 'Efsane', 'Akıl Oyunları', 'Büyük Final'],
    };

    const titlePool = titles[tier] ?? titles.medium;
    const title = titlePool[puzzle.level % titlePool.length];

    return {
        id: puzzle.level,
        gridSize: puzzle.gridSize,
        words: puzzle.words.map(w => ({
            id: w.id,
            direction: w.direction,
            startRow: w.startRow,
            startCol: w.startCol,
            answer: w.answer,
            clue: w.clue,
            num: w.num,
        })),
        difficulty: diffMap[tier],
        title,
    };
}
