import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateISO, getDaysDifference } from '../utils/dateHelpers';
import { getLevel } from '../utils/rewards';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export type StreakMilestone = 3 | 7 | 30;

export interface StreakMilestoneReward {
    milestone: StreakMilestone;
    type: 'xp' | 'coins' | 'badge';
    amount: number;
    label: string;
}

const STREAK_MILESTONES: StreakMilestoneReward[] = [
    { milestone: 3, type: 'xp', amount: 10, label: '3 Gün Serisi' },
    { milestone: 7, type: 'coins', amount: 30, label: '1 Hafta Serisi' },
    { milestone: 30, type: 'badge', amount: 0, label: '30 Gün Serisi' },
];

interface GamificationState {
    // Streak
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
    streakFreezes: number;
    streakMilestonesAchieved: number[]; // milestone values already claimed

    // XP & Level
    totalXP: number;
    weeklyXP: number;
    weekStartDate: string | null;
    currentLevel: number;

    // XP Boost
    xpBoostUntil: number | null; // timestamp in ms, null = no boost

    // Actions
    addXP: (amount: number) => {
        xpGained: number;
        levelUp: boolean;
        newLevel: number;
        streakMilestone: StreakMilestoneReward | null;
    };
    recordPuzzleCompletion: () => void; // handles streak (call once per puzzle)
    checkDailyStreak: () => void;
    checkWeeklyReset: () => void;
    consumeFreeze: () => boolean;
    addFreezes: (amount: number) => void;
    activateXPBoost: (durationMs: number) => void;
    getXPMultiplier: () => number;
}

function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? 6 : day - 1); // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    return monday.toISOString().split('T')[0];
}

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
            streakFreezes: 2,
            streakMilestonesAchieved: [],

            totalXP: 0,
            weeklyXP: 0,
            weekStartDate: null,
            currentLevel: 1,

            xpBoostUntil: null,

            // ── Add XP (called after puzzle completion) ──
            addXP: (amount) => {
                const state = get();
                const multiplier = state.getXPMultiplier();
                const boostedAmount = Math.round(amount * multiplier);

                const newTotalXP = state.totalXP + boostedAmount;
                const newWeeklyXP = state.weeklyXP + boostedAmount;
                const newLevel = getLevel(newTotalXP);
                const levelUp = newLevel > state.currentLevel;

                // Check streak milestones (only unclaimed ones)
                let streakMilestone: StreakMilestoneReward | null = null;
                for (const ms of STREAK_MILESTONES) {
                    if (
                        state.currentStreak >= ms.milestone &&
                        !state.streakMilestonesAchieved.includes(ms.milestone)
                    ) {
                        streakMilestone = ms;
                        set({
                            streakMilestonesAchieved: [
                                ...state.streakMilestonesAchieved,
                                ms.milestone,
                            ],
                        });
                        break; // only one per call
                    }
                }

                set({
                    totalXP: newTotalXP,
                    weeklyXP: newWeeklyXP,
                    currentLevel: newLevel,
                });

                return {
                    xpGained: boostedAmount,
                    levelUp,
                    newLevel,
                    streakMilestone,
                };
            },

            // ── Record puzzle completion (handles streak only) ──
            recordPuzzleCompletion: () => {
                const state = get();
                const today = getCurrentDateISO();
                let { currentStreak, longestStreak, lastCompletedDate } = state;

                if (lastCompletedDate !== today) {
                    if (lastCompletedDate) {
                        const diff = getDaysDifference(lastCompletedDate, today);
                        if (diff === 1) {
                            currentStreak += 1;
                        } else if (diff > 1) {
                            currentStreak = 1;
                        }
                    } else {
                        currentStreak = 1;
                    }
                    if (currentStreak > longestStreak) {
                        longestStreak = currentStreak;
                    }
                    lastCompletedDate = today;

                    set({ currentStreak, longestStreak, lastCompletedDate });
                }
            },

            // ── Check if streak is broken on app open ──
            checkDailyStreak: () => {
                const state = get();
                const { lastCompletedDate, currentStreak, streakFreezes } = state;
                const today = getCurrentDateISO();

                if (!lastCompletedDate || currentStreak === 0) return;

                const diff = getDaysDifference(lastCompletedDate, today);

                if (diff > 1) {
                    const missedDays = diff - 1;
                    if (streakFreezes >= missedDays) {
                        set({ streakFreezes: streakFreezes - missedDays });
                        const date = new Date();
                        date.setDate(date.getDate() - 1);
                        const yesterday = date.toISOString().split('T')[0];
                        set({ lastCompletedDate: yesterday });
                    } else {
                        set({
                            currentStreak: 0,
                            streakMilestonesAchieved: [],  // reset milestones on break
                        });
                    }
                }
            },

            // ── Weekly XP reset (call on app open) ──
            checkWeeklyReset: () => {
                const currentWeek = getWeekStart();
                const { weekStartDate } = get();
                if (weekStartDate !== currentWeek) {
                    set({
                        weeklyXP: 0,
                        weekStartDate: currentWeek,
                    });
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

            activateXPBoost: (durationMs) => {
                set({ xpBoostUntil: Date.now() + durationMs });
            },

            getXPMultiplier: () => {
                const { xpBoostUntil } = get();
                if (xpBoostUntil && Date.now() < xpBoostUntil) return 2;
                return 1;
            },
        }),
        {
            name: 'gamification-storage-v2',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Re-export level helpers for convenience
export { getLevel, getXPForNextLevel, getLevelProgress, getLevelProgressPercent } from '../utils/rewards';
