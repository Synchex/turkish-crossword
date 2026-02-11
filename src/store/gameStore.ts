import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LevelProgress } from '../game/types';

const STORAGE_KEY = '@crossword_progress';

interface ProgressStore {
  progress: LevelProgress[];
  coins: number;
  loaded: boolean;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  completeLevel: (levelId: number, stars: number, hearts: number, time: number) => void;
  spendCoin: () => boolean;
  addCoins: (amount: number) => void;
}

const defaultProgress = (count: number): LevelProgress[] =>
  Array.from({ length: count }, (_, i) => ({
    levelId: i + 1,
    unlocked: i === 0,
    completed: false,
    stars: 0,
    bestHearts: 0,
    bestTime: 0,
  }));

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: defaultProgress(6),
  coins: 5,
  loaded: false,

  loadProgress: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json);
        set({
          progress: data.progress ?? defaultProgress(6),
          coins: data.coins ?? 5,
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveProgress: async () => {
    try {
      const { progress, coins } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, coins }));
    } catch {
      // silent
    }
  },

  completeLevel: (levelId, stars, hearts, time) => {
    set((state) => {
      const progress = state.progress.map((p) => {
        if (p.levelId === levelId) {
          return {
            ...p,
            completed: true,
            stars: Math.max(p.stars, stars),
            bestHearts: Math.max(p.bestHearts, hearts),
            bestTime: p.bestTime === 0 ? time : Math.min(p.bestTime, time),
          };
        }
        if (p.levelId === levelId + 1) {
          return { ...p, unlocked: true };
        }
        return p;
      });
      const coins = state.coins + stars * 2;
      setTimeout(() => get().saveProgress(), 0);
      return { progress, coins };
    });
  },

  spendCoin: () => {
    const { coins } = get();
    if (coins <= 0) return false;
    set({ coins: coins - 1 });
    setTimeout(() => get().saveProgress(), 0);
    return true;
  },

  addCoins: (amount) => {
    set((state) => ({ coins: state.coins + amount }));
    setTimeout(() => get().saveProgress(), 0);
  },
}));
