import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════
// PRACTICE MODE STORE
// ═══════════════════════════════════════════════

interface PracticeState {
    totalPracticeSolved: number;
    bestSessionScore: number;
    lastSessionDate: string | null;

    // Actions
    recordSession: (correct: number) => void;
}

export const usePracticeStore = create<PracticeState>()(
    persist(
        (set, get) => ({
            totalPracticeSolved: 0,
            bestSessionScore: 0,
            lastSessionDate: null,

            recordSession: (correct: number) => {
                const state = get();
                const today = new Date().toISOString().split('T')[0];
                set({
                    totalPracticeSolved: state.totalPracticeSolved + correct,
                    bestSessionScore: Math.max(state.bestSessionScore, correct),
                    lastSessionDate: today,
                });
            },
        }),
        {
            name: 'practice-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
