import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from '../achievements/achievementDefs';

// ── Types ──

interface PendingToast {
    id: string;
    title: string;
    icon: string;
}

interface AchievementsState {
    /** Current progress count per achievement ID */
    progress: Record<string, number>;
    /** IDs of unlocked achievements */
    unlockedIds: string[];
    /** Queued unlock toast (shown once then cleared) */
    pendingToast: PendingToast | null;

    // Actions
    /** Increment progress for an achievement. Auto-unlocks if target met. */
    updateProgress: (id: string, increment: number) => void;
    /** Set progress to an absolute value (for streak-type achievements). */
    setProgress: (id: string, value: number) => void;
    /** Clear the pending toast after it's shown */
    dismissToast: () => void;
    /** Get progress for an achievement */
    getProgress: (id: string) => number;
}

// ── Store ──

export const useAchievementsStore = create<AchievementsState>()(
    persist(
        (set, get) => ({
            progress: {},
            unlockedIds: [],
            pendingToast: null,

            updateProgress: (id, increment) => {
                const state = get();
                const def = ACHIEVEMENT_MAP.get(id);
                if (!def) return;
                if (state.unlockedIds.includes(id)) return; // already unlocked

                const current = state.progress[id] ?? 0;
                const next = current + increment;

                const newProgress = { ...state.progress, [id]: next };

                if (next >= def.target) {
                    // Unlock!
                    set({
                        progress: newProgress,
                        unlockedIds: [...state.unlockedIds, id],
                        pendingToast: {
                            id: def.id,
                            title: def.title,
                            icon: def.icon,
                        },
                    });
                } else {
                    set({ progress: newProgress });
                }
            },

            setProgress: (id, value) => {
                const state = get();
                const def = ACHIEVEMENT_MAP.get(id);
                if (!def) return;
                if (state.unlockedIds.includes(id)) return;

                const newProgress = { ...state.progress, [id]: value };

                if (value >= def.target) {
                    set({
                        progress: newProgress,
                        unlockedIds: [...state.unlockedIds, id],
                        pendingToast: {
                            id: def.id,
                            title: def.title,
                            icon: def.icon,
                        },
                    });
                } else {
                    set({ progress: newProgress });
                }
            },

            dismissToast: () => {
                set({ pendingToast: null });
            },

            getProgress: (id) => {
                return get().progress[id] ?? 0;
            },
        }),
        {
            name: 'achievements-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

/**
 * Check streak-based achievements. Call on app open or after streak update.
 */
export function checkStreakAchievements(currentStreak: number) {
    const store = useAchievementsStore.getState();
    if (currentStreak >= 3) store.setProgress('streak_3', currentStreak);
    if (currentStreak >= 7) store.setProgress('streak_7', currentStreak);
    if (currentStreak >= 30) store.setProgress('streak_30', currentStreak);
}
