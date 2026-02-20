// ── 4 Color Themes ──

export type ThemeId = 'purple' | 'blue' | 'red' | 'black';

export interface ThemeColors {
    id: ThemeId;
    label: string;
    // Primary
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primarySoft: string;
    primary2: string;        // Gradient secondary
    // Surfaces
    background: string;
    surface: string;
    surface2: string;
    card: string;
    cardAlt: string;
    fill: string;
    glass: string;
    overlay: string;
    // Text
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    // Borders
    border: string;
    borderLight: string;
    // Semantic
    accent: string;
    accentDark: string;
    secondary: string;
    success: string;
    successLight: string;
    successDark: string;
    danger: string;
    warning: string;
    // Tab
    tabActive: string;
    tabInactive: string;
    // Gradient
    gradientPrimary: readonly [string, string];
    gradientHero: readonly [string, string, string];
    // Shadow
    shadow: string;
    shimmer: string;
}

const sharedSemantics = {
    accent: '#FF9500',
    accentDark: '#C67700',
    secondary: '#FF3B30',
    success: '#34C759',
    successLight: '#E8FAE8',
    successDark: '#248A3D',
    danger: '#FF3B30',
    warning: '#FF9500',
};

export const themes: Record<ThemeId, ThemeColors> = {
    purple: {
        id: 'purple',
        label: 'Mor',
        primary: '#5856D6',
        primaryLight: '#7A79E0',
        primaryDark: '#3634A3',
        primarySoft: 'rgba(88,86,214,0.08)',
        primary2: '#AF52DE',
        background: '#F2F2F7',
        surface: '#FFFFFF',
        surface2: '#F2F2F7',
        card: '#FFFFFF',
        cardAlt: '#F2F2F7',
        fill: 'rgba(120,120,128,0.12)',
        glass: 'rgba(255,255,255,0.72)',
        overlay: 'rgba(0,0,0,0.4)',
        text: '#1C1C1E',
        textSecondary: '#8E8E93',
        textMuted: '#C7C7CC',
        textInverse: '#FFFFFF',
        border: 'rgba(0,0,0,0.08)',
        borderLight: 'rgba(0,0,0,0.04)',
        tabActive: '#5856D6',
        tabInactive: '#C7C7CC',
        gradientPrimary: ['#5856D6', '#AF52DE'] as const,
        gradientHero: ['#5856D6', '#7A79E0', '#F2F2F7'] as const,
        shadow: 'rgba(88,86,214,0.18)',
        shimmer: 'rgba(88,86,214,0.06)',
        ...sharedSemantics,
    },
    blue: {
        id: 'blue',
        label: 'Mavi',
        primary: '#3B82F6',
        primaryLight: '#60A5FA',
        primaryDark: '#1D4ED8',
        primarySoft: 'rgba(59,130,246,0.08)',
        primary2: '#2563EB',
        background: '#F2F2F7',
        surface: '#FFFFFF',
        surface2: '#F2F2F7',
        card: '#FFFFFF',
        cardAlt: '#F2F2F7',
        fill: 'rgba(120,120,128,0.12)',
        glass: 'rgba(255,255,255,0.72)',
        overlay: 'rgba(0,0,0,0.4)',
        text: '#1C1C1E',
        textSecondary: '#8E8E93',
        textMuted: '#C7C7CC',
        textInverse: '#FFFFFF',
        border: 'rgba(0,0,0,0.08)',
        borderLight: 'rgba(0,0,0,0.04)',
        tabActive: '#3B82F6',
        tabInactive: '#C7C7CC',
        gradientPrimary: ['#3B82F6', '#2563EB'] as const,
        gradientHero: ['#3B82F6', '#60A5FA', '#F2F2F7'] as const,
        shadow: 'rgba(59,130,246,0.18)',
        shimmer: 'rgba(59,130,246,0.06)',
        ...sharedSemantics,
    },
    red: {
        id: 'red',
        label: 'Kırmızı',
        primary: '#EF4444',
        primaryLight: '#F87171',
        primaryDark: '#B91C1C',
        primarySoft: 'rgba(239,68,68,0.08)',
        primary2: '#DC2626',
        background: '#F2F2F7',
        surface: '#FFFFFF',
        surface2: '#F2F2F7',
        card: '#FFFFFF',
        cardAlt: '#F2F2F7',
        fill: 'rgba(120,120,128,0.12)',
        glass: 'rgba(255,255,255,0.72)',
        overlay: 'rgba(0,0,0,0.4)',
        text: '#1C1C1E',
        textSecondary: '#8E8E93',
        textMuted: '#C7C7CC',
        textInverse: '#FFFFFF',
        border: 'rgba(0,0,0,0.08)',
        borderLight: 'rgba(0,0,0,0.04)',
        tabActive: '#EF4444',
        tabInactive: '#C7C7CC',
        gradientPrimary: ['#EF4444', '#DC2626'] as const,
        gradientHero: ['#EF4444', '#F87171', '#F2F2F7'] as const,
        shadow: 'rgba(239,68,68,0.18)',
        shimmer: 'rgba(239,68,68,0.06)',
        ...sharedSemantics,
        secondary: '#EF4444',
    },
    black: {
        id: 'black',
        label: 'Siyah',
        // Blue-purple accent system
        primary: '#5E8BFF',
        primaryLight: '#7B61FF',
        primaryDark: '#4A6FD9',
        primarySoft: 'rgba(94,139,255,0.12)',
        primary2: '#7B61FF',
        // Deep navy-black surfaces
        background: '#0B1020',
        surface: '#0F1424',
        surface2: '#131A2E',
        card: '#111827',
        cardAlt: '#131A2E',
        fill: 'rgba(255,255,255,0.05)',
        glass: 'rgba(10,15,30,0.85)',
        overlay: 'rgba(0,0,0,0.7)',
        // Text — never pure white
        text: '#E5E7EB',
        textSecondary: '#9CA3AF',
        textMuted: '#4B5563',
        textInverse: '#E5E7EB',
        // Borders — glass edge
        border: 'rgba(255,255,255,0.05)',
        borderLight: 'rgba(255,255,255,0.03)',
        // Tab bar
        tabActive: '#5E8BFF',
        tabInactive: '#6B7280',
        // Gradients
        gradientPrimary: ['#5E8BFF', '#7B61FF'] as const,
        gradientHero: ['#0B1020', '#131A2E', '#05070F'] as const,
        // Shadow — soft blue-purple glow
        shadow: 'rgba(94,139,255,0.15)',
        shimmer: 'rgba(94,139,255,0.04)',
        ...sharedSemantics,
    },
};

export const themeIds: ThemeId[] = ['purple', 'blue', 'red', 'black'];

/**
 * Returns a copy of the given theme with forced light-mode surfaces.
 * Primary/accent colors are preserved so selection highlighting stays consistent.
 * Use this to force the gameplay area to always render as light.
 */
export function getGameplayLightTheme(base: ThemeColors): ThemeColors {
    return {
        ...base,
        id: base.id,
        // Force light surfaces
        background: '#F2F2F7',
        surface: '#FFFFFF',
        surface2: '#F2F2F7',
        card: '#FFFFFF',
        cardAlt: '#F2F2F7',
        fill: 'rgba(120,120,128,0.12)',
        glass: 'rgba(255,255,255,0.72)',
        overlay: 'rgba(0,0,0,0.4)',
        // Force light text
        text: '#1C1C1E',
        textSecondary: '#8E8E93',
        textMuted: '#C7C7CC',
        textInverse: '#FFFFFF',
        // Force light borders
        border: 'rgba(0,0,0,0.08)',
        borderLight: 'rgba(0,0,0,0.04)',
        // Force light success colors
        successLight: '#E8FAE8',
        successDark: '#248A3D',
    };
}

