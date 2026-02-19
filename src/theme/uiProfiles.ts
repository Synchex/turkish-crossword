/**
 * UI Profile definitions for Modern and Accessible (Kolay Okuma) modes.
 *
 * These profiles control font scaling, button sizing, spacing,
 * shadow depth, glow effects, and gradient usage across the app.
 */

import { ViewStyle } from 'react-native';

// ═══════════════════════════════════════════════
// TYPE
// ═══════════════════════════════════════════════

export type UIMode = 'modern' | 'accessible';

export interface UIProfile {
    mode: UIMode;

    // ── Font scaling ──
    fontScale: number;
    fontSizes: {
        hero: number;
        h1: number;
        h2: number;
        h3: number;
        headline: number;
        body: number;
        callout: number;
        subheadline: number;
        caption: number;
        label: number;
        button: number;
    };

    // ── Spacing ──
    spacingScale: number;

    // ── Buttons ──
    buttonMinHeight: number;
    buttonBorderRadius: number;

    // ── Cards ──
    cardBorderRadius: number;
    cardSpacing: number; // gap between cards

    // ── Shadows ──
    shadow: 'full' | 'minimal';
    shadowStyle: ViewStyle;

    // ── Effects ──
    glow: boolean;
    gradients: boolean;

    // ── Touch areas ──
    minTouchTarget: number;

    // ── Gameplay tokens ──
    gameplay: {
        gridPadding: number;
        cellBorderWidth: number;
        selectedBorderWidth: number;
        highlightBorderWidth: number;
        clueTextMinScale: number;
        clueFontScale: number;
        letterFontScale: number;
        keyHeight: number;
        actionBtnHeight: number;
        keyFontSize: number;
        actionFontSize: number;
        clueListFontSize: number;
        clueListLineHeight: number;
        clueListNumSize: number;
        clueListTabFontSize: number;
        clueBarMinHeight: number;
        clueBarFontSize: number;
        ctaPaddingVertical: number;
        ctaFontSize: number;
        hintRowHeight: number;
        hintRowFontSize: number;
        headerTitleSize: number;
        headerSubSize: number;
        toastFontSize: number;
    };

    // ── Home screen tokens ──
    home: {
        statCardMinHeight: number;
        playCardMinHeight: number;
        heroTitleSize: number;
        heroSubSize: number;
        streakIconSize: number;
        sectionTitleSize: number;
        showMoreDefault: boolean;  // "Daha Fazla" starts expanded?
    };
}

// ═══════════════════════════════════════════════
// MODERN PROFILE (existing style)
// ═══════════════════════════════════════════════

export const modernProfile: UIProfile = {
    mode: 'modern',

    fontScale: 1.0,
    fontSizes: {
        hero: 34,
        h1: 28,
        h2: 22,
        h3: 20,
        headline: 17,
        body: 17,
        callout: 16,
        subheadline: 15,
        caption: 13,
        label: 11,
        button: 17,
    },

    spacingScale: 1.0,

    buttonMinHeight: 48,
    buttonBorderRadius: 14,

    cardBorderRadius: 16,
    cardSpacing: 12,

    shadow: 'full',
    shadowStyle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    glow: true,
    gradients: true,

    minTouchTarget: 44,

    gameplay: {
        gridPadding: 12,
        cellBorderWidth: 0.5, // StyleSheet.hairlineWidth equivalent
        selectedBorderWidth: 2,
        highlightBorderWidth: 1,
        clueTextMinScale: 0.4,
        clueFontScale: 0.18,
        letterFontScale: 0.45,
        keyHeight: 46,
        actionBtnHeight: 46,
        keyFontSize: 17,
        actionFontSize: 15,
        clueListFontSize: 13,
        clueListLineHeight: 18,
        clueListNumSize: 26,
        clueListTabFontSize: 14,
        clueBarMinHeight: 48,
        clueBarFontSize: 14,
        ctaPaddingVertical: 16,
        ctaFontSize: 16,
        hintRowHeight: 40,
        hintRowFontSize: 14,
        headerTitleSize: 17,
        headerSubSize: 13,
        toastFontSize: 14,
    },

    home: {
        statCardMinHeight: 80,
        playCardMinHeight: 130,
        heroTitleSize: 34,
        heroSubSize: 15,
        streakIconSize: 22,
        sectionTitleSize: 13,
        showMoreDefault: true,
    },
};

// ═══════════════════════════════════════════════
// ACCESSIBLE PROFILE (Kolay Okuma)
// ═══════════════════════════════════════════════

const ACCESSIBLE_SCALE = 1.22; // ~22% larger

export const accessibleProfile: UIProfile = {
    mode: 'accessible',

    fontScale: ACCESSIBLE_SCALE,
    fontSizes: {
        hero: Math.round(34 * ACCESSIBLE_SCALE),
        h1: Math.round(28 * ACCESSIBLE_SCALE),
        h2: Math.round(22 * ACCESSIBLE_SCALE),
        h3: Math.round(20 * ACCESSIBLE_SCALE),
        headline: Math.round(17 * ACCESSIBLE_SCALE),
        body: Math.round(17 * ACCESSIBLE_SCALE),
        callout: Math.round(16 * ACCESSIBLE_SCALE),
        subheadline: Math.round(15 * ACCESSIBLE_SCALE),
        caption: Math.round(13 * ACCESSIBLE_SCALE),
        label: Math.round(11 * ACCESSIBLE_SCALE),
        button: Math.round(17 * ACCESSIBLE_SCALE),
    },

    spacingScale: 1.15,

    buttonMinHeight: 70,
    buttonBorderRadius: 12,

    cardBorderRadius: 12,
    cardSpacing: 18,

    shadow: 'minimal',
    shadowStyle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },

    glow: false,
    gradients: false,

    minTouchTarget: 56,

    gameplay: {
        gridPadding: 8,             // less padding → more room for cells
        cellBorderWidth: 1.5,
        selectedBorderWidth: 3,
        highlightBorderWidth: 1.5,
        clueTextMinScale: 0.55,
        clueFontScale: 0.20,
        letterFontScale: 0.50,
        keyHeight: 54,
        actionBtnHeight: 56,
        keyFontSize: 20,
        actionFontSize: 18,
        clueListFontSize: 16,
        clueListLineHeight: 22,
        clueListNumSize: 32,
        clueListTabFontSize: 17,
        clueBarMinHeight: 60,
        clueBarFontSize: 17,
        ctaPaddingVertical: 22,
        ctaFontSize: 19,
        hintRowHeight: 50,
        hintRowFontSize: 17,
        headerTitleSize: 21,
        headerSubSize: 16,
        toastFontSize: 17,
    },

    home: {
        statCardMinHeight: 100,
        playCardMinHeight: 150,
        heroTitleSize: 42,
        heroSubSize: 18,
        streakIconSize: 28,
        sectionTitleSize: 16,
        showMoreDefault: false,
    },
};

// ═══════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════

export function getUIProfile(mode: UIMode): UIProfile {
    return mode === 'accessible' ? accessibleProfile : modernProfile;
}
