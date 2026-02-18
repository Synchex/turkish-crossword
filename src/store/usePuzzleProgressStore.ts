import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════
// Per-puzzle completion tracking
// ═══════════════════════════════════════════════

export interface PuzzleProgressEntry {
    completed: boolean;
    stars: number;     // 0-3
    bestTime: number;  // seconds
}

interface PuzzleProgressState {
    progress: Record<string, PuzzleProgressEntry>;

    /** Mark a puzzle as completed (upserts best stars/time) */
    markCompleted: (puzzleId: string, stars: number, time: number) => void;

    /** Get progress for a puzzle (returns default if none) */
    getProgress: (puzzleId: string) => PuzzleProgressEntry;

    /** Check if a specific puzzle is completed */
    isCompleted: (puzzleId: string) => boolean;

    /** Reset all progress (dev only) */
    resetAll: () => void;
}

const DEFAULT_ENTRY: PuzzleProgressEntry = {
    completed: false,
    stars: 0,
    bestTime: 0,
};

export const usePuzzleProgressStore = create<PuzzleProgressState>()(
    persist(
        (set, get) => ({
            progress: {},

            markCompleted: (puzzleId, stars, time) => {
                const current = get().progress[puzzleId];
                const newEntry: PuzzleProgressEntry = {
                    completed: true,
                    stars: Math.max(current?.stars ?? 0, stars),
                    bestTime: current?.bestTime
                        ? Math.min(current.bestTime, time)
                        : time,
                };
                set({
                    progress: {
                        ...get().progress,
                        [puzzleId]: newEntry,
                    },
                });
            },

            getProgress: (puzzleId) => {
                return get().progress[puzzleId] ?? DEFAULT_ENTRY;
            },

            isCompleted: (puzzleId) => {
                return get().progress[puzzleId]?.completed ?? false;
            },

            resetAll: () => set({ progress: {} }),
        }),
        {
            name: 'puzzle-progress-v1',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
