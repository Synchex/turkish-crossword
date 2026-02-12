import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateISO, getDaysDifference } from '../utils/dateHelpers';
import { Difficulty } from '../data/questions';

interface GamificationState {
    // Streak
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
    streakFreezes: number;

    // XP & Level
    totalXP: number;
    currentLevel: number;

    // Actions
    completePuzzle: (difficulty: Difficulty, perfect: boolean) => { xpGained: number; levelUp: boolean };
    checkDailyStreak: () => void; // checks if streak is broken
    consumeFreeze: () => boolean;
    addFreezes: (amount: number) => void;
}

const XP_VALUES: Record<Difficulty, number> = {
    easy: 10,
    medium: 20,
    hard: 35,
};

const BONUS_XP = 5;

// Level Formula: floor( sqrt(totalXP / 50) ) + 1
// XP for Level L: 50 * (L-1)^2
export const getLevelFromXP = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
};

export const getXPForNextLevel = (level: number): number => {
    return 50 * Math.pow(level, 2);
};

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
            streakFreezes: 2, // Start with 2 freezes
            totalXP: 0,
            currentLevel: 1,

            completePuzzle: (difficulty, perfect) => {
                const state = get();
                const today = getCurrentDateISO();
                let { currentStreak, longestStreak, lastCompletedDate, streakFreezes } = state;

                // ── Streak Logic ──
                if (lastCompletedDate !== today) {
                    // First puzzle of the day
                    if (lastCompletedDate) {
                        const diff = getDaysDifference(lastCompletedDate, today);
                        if (diff === 1) {
                            // Consecutive day
                            currentStreak += 1;
                        } else if (diff > 1) {
                            // Check logic handles identifying broken streaks usually on app open.
                            // But if user opens app after 2 days and solves immediately, ensure logic holds.
                            // Ideally checkDailyStreak runs on mount.
                            // If we are here and diff > 1, streak was likely broken unless frozen.
                            // Let's assume checkDailyStreak handled the break/freeze logic on mount.
                            // If streak is 0, we start new.
                            if (currentStreak === 0) {
                                currentStreak = 1;
                            } else {
                                // If user solves a puzzle after a break without opening app? Unlikely.
                                // We'll reset to 1 if it wasn't maintained.
                                // Actually, let's keep it simple: strict 1 if broken.
                                currentStreak = 1;
                            }
                        }
                    } else {
                        currentStreak = 1;
                    }
                    // Update Max
                    if (currentStreak > longestStreak) {
                        longestStreak = currentStreak;
                    }
                    lastCompletedDate = today;
                }

                // ── XP Logic ──
                let xpGained = XP_VALUES[difficulty];
                if (perfect) xpGained += BONUS_XP;

                const newTotalXP = state.totalXP + xpGained;
                const newLevel = getLevelFromXP(newTotalXP);
                const levelUp = newLevel > state.currentLevel;

                set({
                    currentStreak,
                    longestStreak,
                    lastCompletedDate,
                    totalXP: newTotalXP,
                    currentLevel: newLevel,
                });

                return { xpGained, levelUp };
            },

            checkDailyStreak: () => {
                const state = get();
                const { lastCompletedDate, currentStreak, streakFreezes } = state;
                const today = getCurrentDateISO();

                if (!lastCompletedDate || currentStreak === 0) return;

                const diff = getDaysDifference(lastCompletedDate, today);

                // diff 0: same day, fine.
                // diff 1: yesterday, fine/pending.
                // diff > 1: missed at least one day (yesterday).
                if (diff > 1) {
                    const missedDays = diff - 1;

                    if (streakFreezes >= missedDays) {
                        // Use freezes to cover all missed days
                        set({ streakFreezes: streakFreezes - missedDays });

                        // Set lastCompletedDate to yesterday so streak can continue today
                        // (This keeps the streak count but requires play today to increment)
                        const date = new Date();
                        date.setDate(date.getDate() - 1);
                        const yesterday = date.toISOString().split('T')[0];
                        set({ lastCompletedDate: yesterday });
                    } else {
                        // Not enough freezes, break streak
                        set({ currentStreak: 0 });
                    }
                }
            },

            consumeFreeze: () => {
                const { streakFreezes } = get();
                if (streakFreezes > 0) {
                    set({ streakFreezes: streakFreezes - 1 });
                    return true;
                }
                return false;
            },

            addFreezes: (amount) => {
                set((state) => ({ streakFreezes: state.streakFreezes + amount }));
            },
        }),
        {
            name: 'gamification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
