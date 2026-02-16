/**
 * Generator Test Harness Store
 *
 * Holds generated puzzle results so that the game screen can
 * load them by ID without passing huge payloads via route params.
 */

import { create } from 'zustand';
import { LevelData } from '../game/types';
import { generateOnePuzzle } from '../generator/adapter';

// ── Types ──

export type SeedMode = 'random' | 'manual';

export interface GeneratedPuzzleEntry {
    /** Unique identifier — used as route param with "gen_" prefix */
    id: string;
    level: number;
    seed: number;
    gridSize: number;
    difficultyScore: number;
    genTimeMs: number;
    createdAtISO: string;
    status: 'success' | 'failed';
    error?: string;
    /** The game-ready payload. Only present when status === 'success' */
    payload?: LevelData;
}

export interface GenerateManyParams {
    level: number;
    count: number;
    seedMode: SeedMode;
    manualSeed?: number;
}

interface GeneratorStore {
    generatedPuzzles: GeneratedPuzzleEntry[];
    isGenerating: boolean;
    successCount: number;
    totalAttempted: number;

    generateMany: (params: GenerateManyParams) => Promise<void>;
    clear: () => void;
    getById: (id: string) => GeneratedPuzzleEntry | undefined;
}

const MAX_STORED = 50;

/** Simple short ID generator */
function shortId(): string {
    return Math.random().toString(36).slice(2, 8);
}

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
    generatedPuzzles: [],
    isGenerating: false,
    successCount: 0,
    totalAttempted: 0,

    generateMany: async ({ level, count, seedMode, manualSeed }) => {
        set({ isGenerating: true, successCount: 0, totalAttempted: 0 });

        const results: GeneratedPuzzleEntry[] = [];
        let successes = 0;

        for (let i = 0; i < count; i++) {
            const seed =
                seedMode === 'manual' && manualSeed != null
                    ? manualSeed + i
                    : Date.now() + i * 997; // spread random seeds

            const puzzleId = shortId();
            const numericId = 9000 + i; // high numeric ID to avoid clashing with real levels

            // Yield to UI between generates so the loading state renders
            await new Promise<void>((r) => setTimeout(r, 10));

            const result = generateOnePuzzle(level, seed, numericId);

            const entry: GeneratedPuzzleEntry = {
                id: puzzleId,
                level,
                seed,
                gridSize: result.gridSize ?? 0,
                difficultyScore: result.difficultyScore ?? 0,
                genTimeMs: result.genTimeMs,
                createdAtISO: new Date().toISOString(),
                status: result.success ? 'success' : 'failed',
                error: result.error,
                payload: result.levelData,
            };

            results.push(entry);
            if (result.success) successes++;

            // Live-update count for progress display
            set({ successCount: successes, totalAttempted: i + 1 });
        }

        set((state) => {
            // Prepend new results, cap at MAX_STORED
            const combined = [...results, ...state.generatedPuzzles].slice(0, MAX_STORED);
            return {
                generatedPuzzles: combined,
                isGenerating: false,
                successCount: successes,
                totalAttempted: count,
            };
        });
    },

    clear: () =>
        set({
            generatedPuzzles: [],
            successCount: 0,
            totalAttempted: 0,
        }),

    getById: (id: string) => get().generatedPuzzles.find((p) => p.id === id),
}));
