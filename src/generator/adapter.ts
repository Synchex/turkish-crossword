/**
 * Generator Adapter — bridges the crossword engine to the game's LevelData format.
 *
 * Lazy-initializes the engine on first call, then delegates to
 * generatePuzzle() + toLevelData() to produce game-ready payloads.
 */

import { LevelData } from '../game/types';
import {
    initializeEngine,
    generatePuzzle as engineGenerate,
    toLevelData,
} from '../engine';

// ── Singleton init guard ──
let _engineReady = false;

function ensureEngine(): void {
    if (_engineReady) return;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require('../data/questions_db.json');
    initializeEngine(data);
    _engineReady = true;
}

// ── Public result type ──
export interface GenerateResult {
    success: boolean;
    levelData?: LevelData;
    gridSize?: number;
    difficultyScore?: number;
    genTimeMs: number;
    error?: string;
}

/**
 * Generate a single crossword puzzle and return it as LevelData.
 *
 * @param level  Difficulty level (1–50)
 * @param seed   PRNG seed for deterministic generation
 * @param id     Unique ID to assign to the resulting LevelData
 */
export function generateOnePuzzle(
    level: number,
    seed: number,
    id: number,
): GenerateResult {
    try {
        ensureEngine();

        const start = Date.now();
        const puzzle = engineGenerate({ level, seed });
        const elapsed = Date.now() - start;

        if (!puzzle) {
            return { success: false, genTimeMs: elapsed, error: 'Solver returned null' };
        }

        const levelData = toLevelData(puzzle);
        // Override the id so each generated puzzle gets a unique one
        levelData.id = id;

        return {
            success: true,
            levelData,
            gridSize: puzzle.gridSize,
            difficultyScore: puzzle.difficultyScore,
            genTimeMs: elapsed,
        };
    } catch (e: any) {
        return {
            success: false,
            genTimeMs: 0,
            error: e?.message ?? 'Unknown error',
        };
    }
}
