import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateISO } from '../utils/dateHelpers';
import { useGamificationStore } from './useGamificationStore';
import { IS_DEV, DEV_COIN_BALANCE } from '../config/devConfig';

// ── Constants ──
export const HINT_LETTER_COST = 10;
export const HINT_WORD_COST = 25;
export const STREAK_FREEZE_COST = 50;
export const PUZZLE_COMPLETE_REWARD = 5;
export const FIRST_PUZZLE_BONUS = 10;

interface EconomyState {
    coins: number;
    firstPuzzleBonusDate: string | null;

    // Actions
    addCoins: (amount: number) => void;
    spendCoins: (amount: number) => boolean;
    awardPuzzleCompletion: () => number;
    buyStreakFreeze: () => boolean;

    // Dev helpers
    devAddCoins: (amount: number) => void;
    devResetCoins: () => void;

    // Derived (DEV-aware)
    getCoins: () => number;
    canAfford: (amount: number) => boolean;
}

export const useEconomyStore = create<EconomyState>()(
    persist(
        (set, get) => ({
            coins: 50,
            firstPuzzleBonusDate: null,

            // ── Core actions ──
            addCoins: (amount) => {
                set((s) => ({ coins: s.coins + amount }));
            },

            spendCoins: (amount) => {
                // DEV override: always succeed, never deduct
                if (IS_DEV) return true;

                const { coins } = get();
                if (coins < amount) return false;
                set({ coins: coins - amount });
                return true;
            },

            awardPuzzleCompletion: () => {
                const today = getCurrentDateISO();
                const { firstPuzzleBonusDate } = get();
                let reward = PUZZLE_COMPLETE_REWARD;

                if (firstPuzzleBonusDate !== today) {
                    reward += FIRST_PUZZLE_BONUS;
                    set({ firstPuzzleBonusDate: today });
                }

                set((s) => ({ coins: s.coins + reward }));
                return reward;
            },

            buyStreakFreeze: () => {
                // DEV override
                if (IS_DEV) {
                    useGamificationStore.getState().addFreezes(1);
                    return true;
                }

                const { coins } = get();
                if (coins < STREAK_FREEZE_COST) return false;
                set({ coins: coins - STREAK_FREEZE_COST });
                useGamificationStore.getState().addFreezes(1);
                return true;
            },

            // ── DEV helpers ──
            devAddCoins: (amount) => {
                set((s) => ({ coins: s.coins + amount }));
            },

            devResetCoins: () => {
                set({ coins: 50 });
            },

            // ── Derived (DEV-aware) ──
            getCoins: () => {
                if (IS_DEV) return DEV_COIN_BALANCE;
                return get().coins;
            },

            canAfford: (amount) => {
                if (IS_DEV) return true;
                return get().coins >= amount;
            },
        }),
        {
            name: 'economy-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
