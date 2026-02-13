/**
 * Big Puzzle Store
 *
 * Holds big random puzzle state. Puzzles are stored by ID so the game
 * screen can load them via route param with "big_" prefix.
 *
 * Also holds prebuilt puzzles and a fallback mechanism:
 * if the generator fails, a random prebuilt puzzle is silently used.
 */

import { create } from 'zustand';
import { LevelData } from '../game/types';
import { generateCrossword } from '../generator/crosswordGenerator';
import {
    PREBUILT_BIG_PUZZLES,
    PREBUILT_META,
    PrebuiltMeta,
} from '../data/prebuiltBigPuzzles';

// ── Config ──

export type BigPuzzleSize = 15 | 17 | 21;
export type BigPuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface BigPuzzleConfig {
    size: BigPuzzleSize;
    difficulty: BigPuzzleDifficulty;
    theme: string;
}

// ── Entry ──

export interface BigPuzzleEntry {
    id: string;
    config: BigPuzzleConfig;
    createdAtISO: string;
    status: 'success' | 'failed';
    error?: string;
    payload?: LevelData;
}

// ── Store ──

interface BigPuzzleStore {
    currentPuzzleId: string | null;
    puzzles: Record<string, BigPuzzleEntry>;
    isLoading: boolean;
    error: string | null;
    config: BigPuzzleConfig;

    // Prebuilt
    prebuiltPuzzles: LevelData[];
    prebuiltMeta: PrebuiltMeta[];

    setConfig: (partial: Partial<BigPuzzleConfig>) => void;
    generate: (seed?: number) => string | null;
    selectPrebuilt: (id: number) => string;
    getPuzzleById: (id: string) => BigPuzzleEntry | undefined;
    clear: () => void;
}

const DEFAULT_CONFIG: BigPuzzleConfig = {
    size: 15,
    difficulty: 'medium',
    theme: 'Genel',
};

export const useBigPuzzleStore = create<BigPuzzleStore>((set, get) => ({
    currentPuzzleId: null,
    puzzles: {},
    isLoading: false,
    error: null,
    config: { ...DEFAULT_CONFIG },

    // Prebuilt data loaded at init
    prebuiltPuzzles: PREBUILT_BIG_PUZZLES,
    prebuiltMeta: PREBUILT_META,

    setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

    /**
     * Select a prebuilt puzzle by its numeric ID.
     * Creates a BigPuzzleEntry and sets currentPuzzleId.
     * Returns the store key (string) for navigation.
     */
    selectPrebuilt: (id: number) => {
        const puzzle = PREBUILT_BIG_PUZZLES.find((p) => p.id === id);
        if (!puzzle) {
            // Fallback to first prebuilt
            const fallback = PREBUILT_BIG_PUZZLES[0];
            const key = `prebuilt_${fallback.id}`;
            const entry: BigPuzzleEntry = {
                id: key,
                config: { ...DEFAULT_CONFIG },
                createdAtISO: new Date().toISOString(),
                status: 'success',
                payload: fallback,
            };
            set((st) => ({
                currentPuzzleId: key,
                puzzles: { ...st.puzzles, [key]: entry },
            }));
            return key;
        }

        const key = `prebuilt_${puzzle.id}`;
        const meta = PREBUILT_META.find((m) => m.id === id);
        const entry: BigPuzzleEntry = {
            id: key,
            config: {
                size: 15,
                difficulty:
                    meta?.difficultyLabel === 'Kolay'
                        ? 'easy'
                        : meta?.difficultyLabel === 'Zor'
                            ? 'hard'
                            : 'medium',
                theme: meta?.theme ?? 'Genel',
            },
            createdAtISO: new Date().toISOString(),
            status: 'success',
            payload: puzzle,
        };

        set((st) => ({
            currentPuzzleId: key,
            puzzles: { ...st.puzzles, [key]: entry },
        }));

        return key;
    },

    generate: (seed?: number) => {
        const s = seed ?? Date.now();
        const { config } = get();

        set({ isLoading: true, error: null });

        const result = generateCrossword({
            seed: s,
            size: 15,
            difficulty: config.difficulty,
        });

        if (result.success && result.puzzle && result.puzzleId) {
            const entry: BigPuzzleEntry = {
                id: result.puzzleId,
                config: { ...config },
                createdAtISO: new Date().toISOString(),
                status: 'success',
                payload: result.puzzle,
            };

            set((st) => ({
                isLoading: false,
                error: null,
                currentPuzzleId: result.puzzleId!,
                puzzles: { ...st.puzzles, [result.puzzleId!]: entry },
            }));

            return result.puzzleId;
        }

        // ── Fallback: pick a random prebuilt puzzle ──
        const prebuilt = PREBUILT_BIG_PUZZLES;
        const randomIdx = Math.floor(Math.random() * prebuilt.length);
        const fallback = prebuilt[randomIdx];
        const fallbackKey = `prebuilt_${fallback.id}`;

        const fallbackEntry: BigPuzzleEntry = {
            id: fallbackKey,
            config: { ...config },
            createdAtISO: new Date().toISOString(),
            status: 'success',
            payload: fallback,
        };

        set((st) => ({
            isLoading: false,
            error: null, // NO error — silent fallback
            currentPuzzleId: fallbackKey,
            puzzles: { ...st.puzzles, [fallbackKey]: fallbackEntry },
        }));

        return fallbackKey;
    },

    getPuzzleById: (id) => get().puzzles[id],

    clear: () =>
        set({
            currentPuzzleId: null,
            puzzles: {},
            isLoading: false,
            error: null,
        }),
}));
