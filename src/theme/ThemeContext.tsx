import React, { createContext, useContext, useMemo } from 'react';
import { themes, ThemeColors } from './themes';
import { UIProfile, getUIProfile } from './uiProfiles';
import { useSettingsStore } from '../store/useSettingsStore';

const ThemeContext = createContext<ThemeColors>(themes.purple);
export { ThemeContext };
const UIProfileContext = createContext<UIProfile>(getUIProfile('modern'));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const themeId = useSettingsStore((s) => s.themeId);
    const uiMode = useSettingsStore((s) => s.uiMode);
    const theme = useMemo(() => themes[themeId] ?? themes.purple, [themeId]);
    const profile = useMemo(() => getUIProfile(uiMode ?? 'modern'), [uiMode]);

    return (
        <ThemeContext.Provider value={theme}>
            <UIProfileContext.Provider value={profile}>
                {children}
            </UIProfileContext.Provider>
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeColors {
    return useContext(ThemeContext);
}

export function useUIProfile(): UIProfile {
    return useContext(UIProfileContext);
}
