import React, { createContext, useContext, useMemo } from 'react';
import { themes, ThemeColors } from './themes';
import { useSettingsStore } from '../store/useSettingsStore';

const ThemeContext = createContext<ThemeColors>(themes.purple);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const themeId = useSettingsStore((s) => s.themeId);
    const theme = useMemo(() => themes[themeId] ?? themes.purple, [themeId]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeColors {
    return useContext(ThemeContext);
}
