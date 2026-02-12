import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateISO } from '../utils/dateHelpers';
import { useEconomyStore } from './useEconomyStore';
import { useGamificationStore } from './useGamificationStore';
import { dailyPuzzles, DAILY_COIN_REWARD, DAILY_XP_REWARD } from '../data/dailyPuzzles';
import { LevelData } from '../game/types';

// ── Helpers ──
function getDayOfYear(dateStr: string): number {
    const d = new Date(dateStr);
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── State ──
interface DailyPuzzleState {
    todayKey: string;
    todayPuzzleIndex: number;
    completedToday: boolean;
    completedDates: string[]; // capped at 60

    // Actions
    hydrate: () => void;
    getTodayPuzzle: () => LevelData;
    markCompletedToday: () => { coins: number; xp: number };
}

export const useDailyPuzzleStore = create<DailyPuzzleState>()(
    persist(
        (set, get) => ({
            todayKey: '',
            todayPuzzleIndex: 0,
            completedToday: false,
            completedDates: [],

            hydrate: () => {
                const today = getCurrentDateISO();
                const { todayKey } = get();

                if (todayKey !== today) {
                    // New day — pick a new puzzle
                    const dayIndex = getDayOfYear(today);
                    const puzzleIndex = dayIndex % dailyPuzzles.length;

                    set({
                        todayKey: today,
                        todayPuzzleIndex: puzzleIndex,
                        completedToday: false,
                    });
                }
            },

            getTodayPuzzle: () => {
                const { todayPuzzleIndex } = get();
                return dailyPuzzles[todayPuzzleIndex];
            },

            markCompletedToday: () => {
                const { completedToday, completedDates, todayKey } = get();
                if (completedToday) return { coins: 0, xp: 0 };

                // Award coins
                useEconomyStore.getState().addCoins(DAILY_COIN_REWARD);

                // Award XP via gamification
                useGamificationStore.getState().completePuzzle('easy', false);

                // Update state
                const newDates = [todayKey, ...completedDates].slice(0, 60);
                set({
                    completedToday: true,
                    completedDates: newDates,
                });

                return { coins: DAILY_COIN_REWARD, xp: DAILY_XP_REWARD };
            },
        }),
        {
            name: 'daily-puzzle-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
