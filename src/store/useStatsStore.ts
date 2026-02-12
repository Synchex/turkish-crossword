import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateISO } from '../utils/dateHelpers';

// ── Types ──
interface DayStat {
    dateKey: string;
    count: number;
}

interface StatsState {
    totalPuzzlesSolved: number;
    totalDailySolved: number;
    totalCorrectWords: number;
    totalWrongWords: number;
    totalMistakes: number;
    totalSolveTimeSec: number;
    fastestSolveTimeSec: number;
    last7Days: DayStat[];

    // Actions
    onPuzzleComplete: (data: {
        timeSec: number;
        mistakes: number;
        correctWords: number;
        wrongWords: number;
        isDaily: boolean;
    }) => void;
}

// ── Derived ──
export function computeDerived(state: StatsState) {
    const totalAttempts = state.totalCorrectWords + state.totalWrongWords;
    const accuracyPercent =
        totalAttempts > 0
            ? Math.round((state.totalCorrectWords / totalAttempts) * 100)
            : 0;
    const averageSolveTimeSec =
        state.totalPuzzlesSolved > 0
            ? Math.round(state.totalSolveTimeSec / state.totalPuzzlesSolved)
            : 0;
    return { accuracyPercent, averageSolveTimeSec };
}

export const useStatsStore = create<StatsState>()(
    persist(
        (set, get) => ({
            totalPuzzlesSolved: 0,
            totalDailySolved: 0,
            totalCorrectWords: 0,
            totalWrongWords: 0,
            totalMistakes: 0,
            totalSolveTimeSec: 0,
            fastestSolveTimeSec: 0,
            last7Days: [],

            onPuzzleComplete: (data) => {
                const state = get();
                const today = getCurrentDateISO();

                // Update last7Days
                let days = [...state.last7Days];
                const todayEntry = days.find((d) => d.dateKey === today);
                if (todayEntry) {
                    todayEntry.count += 1;
                } else {
                    days.push({ dateKey: today, count: 1 });
                }
                // Keep only last 7 days
                days.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
                days = days.slice(0, 7);

                const newFastest =
                    state.fastestSolveTimeSec === 0
                        ? data.timeSec
                        : Math.min(state.fastestSolveTimeSec, data.timeSec);

                set({
                    totalPuzzlesSolved: state.totalPuzzlesSolved + 1,
                    totalDailySolved: data.isDaily
                        ? state.totalDailySolved + 1
                        : state.totalDailySolved,
                    totalCorrectWords: state.totalCorrectWords + data.correctWords,
                    totalWrongWords: state.totalWrongWords + data.wrongWords,
                    totalMistakes: state.totalMistakes + data.mistakes,
                    totalSolveTimeSec: state.totalSolveTimeSec + data.timeSec,
                    fastestSolveTimeSec: newFastest,
                    last7Days: days,
                });
            },
        }),
        {
            name: 'stats-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
