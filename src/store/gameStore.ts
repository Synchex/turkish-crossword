import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LevelProgress } from '../game/types';

const STORAGE_KEY = '@crossword_progress';

interface ProgressStore {
  progress: LevelProgress[];
  loaded: boolean;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  completeLevel: (
    levelId: number,
    stars: number,
    time: number,
    mistakes?: number,
    hintsUsed?: number
  ) => void;
}

const defaultProgress = (count: number): LevelProgress[] =>
  Array.from({ length: count }, (_, i) => ({
    levelId: i + 1,
    unlocked: i === 0,
    completed: false,
    stars: 0,
    bestTime: 0,
    bestMistakes: 999,
    bestHintsUsed: 999,
  }));

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: defaultProgress(6),
  loaded: false,

  loadProgress: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json);
        // Migrate old shapes that lack the new fields
        const migrated = (data.progress ?? defaultProgress(6)).map(
          (p: LevelProgress) => ({
            ...p,
            bestMistakes: p.bestMistakes ?? 999,
            bestHintsUsed: p.bestHintsUsed ?? 999,
          })
        );
        set({ progress: migrated, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveProgress: async () => {
    try {
      const { progress } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ progress }));
    } catch {
      // silent
    }
  },

  completeLevel: (levelId, stars, time, mistakes = 0, hintsUsed = 0) => {
    set((state) => {
      const progress = state.progress.map((p) => {
        if (p.levelId === levelId) {
          return {
            ...p,
            completed: true,
            stars: Math.max(p.stars, stars),
            bestTime: p.bestTime === 0 ? time : Math.min(p.bestTime, time),
            bestMistakes: Math.min(p.bestMistakes, mistakes),
            bestHintsUsed: Math.min(p.bestHintsUsed, hintsUsed),
          };
        }
        if (p.levelId === levelId + 1) {
          return { ...p, unlocked: true };
        }
        return p;
      });
      setTimeout(() => get().saveProgress(), 0);
      return { progress };
    });
  },
}));
