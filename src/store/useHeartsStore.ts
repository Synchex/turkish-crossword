import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEconomyStore } from './useEconomyStore';

// ── Constants ──
export const MAX_HEARTS = 3;
export const REGEN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
export const HEART_REFILL_COST = 50;

interface HeartsState {
    hearts: number;
    nextRefillAt: number | null; // Unix timestamp (ms) when next heart regenerates

    // Actions
    syncHearts: () => void;          // Compute regen from elapsed time
    loseHeart: () => boolean;        // Returns false if already at 0
    refillWithCoins: () => boolean;  // Returns false if not enough coins
    getTimeToNextRefill: () => number; // ms until next heart, 0 if full
}

export const useHeartsStore = create<HeartsState>()(
    persist(
        (set, get) => ({
            hearts: MAX_HEARTS,
            nextRefillAt: null,

            syncHearts: () => {
                const { hearts, nextRefillAt } = get();
                if (hearts >= MAX_HEARTS || !nextRefillAt) return;

                const now = Date.now();
                if (now < nextRefillAt) return; // Not time yet

                // Calculate how many hearts regenerated
                const elapsed = now - nextRefillAt;
                const heartsGained = 1 + Math.floor(elapsed / REGEN_INTERVAL_MS);
                const newHearts = Math.min(MAX_HEARTS, hearts + heartsGained);

                if (newHearts >= MAX_HEARTS) {
                    // Fully refilled
                    set({ hearts: MAX_HEARTS, nextRefillAt: null });
                } else {
                    // Partially refilled — schedule next
                    const remaining = elapsed % REGEN_INTERVAL_MS;
                    set({
                        hearts: newHearts,
                        nextRefillAt: now + (REGEN_INTERVAL_MS - remaining),
                    });
                }
            },

            loseHeart: () => {
                const { hearts } = get();
                if (hearts <= 0) return false;

                const newHearts = hearts - 1;
                const now = Date.now();
                const { nextRefillAt } = get();

                set({
                    hearts: newHearts,
                    // Start regen timer if not already running
                    nextRefillAt: nextRefillAt ?? now + REGEN_INTERVAL_MS,
                });

                return true;
            },

            refillWithCoins: () => {
                const success = useEconomyStore.getState().spendCoins(HEART_REFILL_COST);
                if (!success) return false;

                set({ hearts: MAX_HEARTS, nextRefillAt: null });
                return true;
            },

            getTimeToNextRefill: () => {
                const { hearts, nextRefillAt } = get();
                if (hearts >= MAX_HEARTS || !nextRefillAt) return 0;
                return Math.max(0, nextRefillAt - Date.now());
            },
        }),
        {
            name: 'hearts-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
