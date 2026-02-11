export const colors = {
  // ── Primary palette ──
  primary: '#6C5CE7',       // Vibrant indigo
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',

  // ── Secondary ──
  secondary: '#FF6B6B',     // Coral red
  secondaryLight: '#FF8A80',
  secondaryDark: '#E55039',

  // ── Accent ──
  accent: '#FDCB6E',        // Warm gold
  accentDark: '#F0932B',

  // ── Success / Danger / Warning ──
  success: '#00B894',
  successLight: '#DFFFF7',
  successDark: '#00916E',

  danger: '#FF6B6B',
  dangerLight: '#FFEBEE',
  dangerDark: '#D63031',

  warning: '#FDCB6E',
  warningLight: '#FFF8E1',

  // ── Surfaces ──
  background: '#F8F7FF',      // Soft lavender‑white
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F3F0FF',

  // ── Text ──
  text: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  textInverse: '#FFFFFF',

  // ── Borders ──
  border: '#E8E4F0',
  borderLight: '#F0ECF8',

  // ── Misc ──
  overlay: 'rgba(45, 52, 54, 0.5)',
  shimmer: 'rgba(108, 92, 231, 0.08)',

  // ── Gradients (start → end) ──
  gradientPrimary: ['#6C5CE7', '#A29BFE'] as const,
  gradientWarm: ['#FD79A8', '#FDCB6E'] as const,
  gradientSuccess: ['#00B894', '#55EFC4'] as const,
  gradientDark: ['#2D3436', '#636E72'] as const,
  gradientHero: ['#6C5CE7', '#A29BFE', '#DFE6E9'] as const,
};

export type Colors = typeof colors;
