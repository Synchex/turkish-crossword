import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeId } from '../theme/themes';
import type { UIMode } from '../theme/uiProfiles';

export interface SettingsState {
    themeId: ThemeId;
    uiMode: UIMode;
    haptics: boolean;
    sound: boolean;
    autoCheck: boolean;
    showWrongInRed: boolean;
    largeText: boolean;
    language: 'tr' | 'en';

    // Actions
    setTheme: (id: ThemeId) => void;
    setUIMode: (mode: UIMode) => void;
    toggleHaptics: () => void;
    toggleSound: () => void;
    toggleAutoCheck: () => void;
    toggleShowWrongInRed: () => void;
    toggleLargeText: () => void;
    setLanguage: (lang: 'tr' | 'en') => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            themeId: 'purple',
            uiMode: 'modern' as UIMode,
            haptics: true,
            sound: true,
            autoCheck: false,
            showWrongInRed: false,
            largeText: false,
            language: 'tr',

            setTheme: (id) => set({ themeId: id }),
            setUIMode: (mode) => set({ uiMode: mode }),
            toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
            toggleSound: () => set((s) => ({ sound: !s.sound })),
            toggleAutoCheck: () => set((s) => ({ autoCheck: !s.autoCheck })),
            toggleShowWrongInRed: () => set((s) => ({ showWrongInRed: !s.showWrongInRed })),
            toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
