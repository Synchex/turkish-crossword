export const colors = {
  // ── Primary palette ──
  primary: '#5856D6',        // iOS indigo
  primaryLight: '#7A79E0',
  primaryDark: '#3634A3',

  // ── Secondary ──
  secondary: '#FF3B30',      // iOS red
  secondaryLight: '#FF6961',
  secondaryDark: '#C0392B',

  // ── Accent ──
  accent: '#FF9500',         // iOS orange
  accentDark: '#C67700',

  // ── Success / Danger / Warning ──
  success: '#34C759',        // iOS green
  successLight: '#E8FAE8',
  successDark: '#248A3D',

  danger: '#FF3B30',
  dangerLight: '#FFEDEB',
  dangerDark: '#C0392B',

  warning: '#FF9500',
  warningLight: '#FFF4E5',

  // ── Surfaces ──
  background: '#F2F2F7',       // iOS system gray 6
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F2F2F7',
  glass: 'rgba(255,255,255,0.72)',

  // ── Text ──
  text: '#1C1C1E',            // iOS label
  textSecondary: '#8E8E93',   // iOS secondary label
  textMuted: '#C7C7CC',       // iOS tertiary
  textInverse: '#FFFFFF',

  // ── Borders ──
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.04)',

  // ── Misc ──
  overlay: 'rgba(0, 0, 0, 0.4)',
  shimmer: 'rgba(88, 86, 214, 0.06)',
  fill: 'rgba(120,120,128,0.12)',     // iOS system fill

  // ── Gradients (start → end) ──
  gradientPrimary: ['#5856D6', '#AF52DE'] as const,   // indigo → purple
  gradientWarm: ['#FF2D55', '#FF9500'] as const,
  gradientSuccess: ['#30D158', '#34C759'] as const,
  gradientDark: ['#1C1C1E', '#3A3A3C'] as const,
  gradientHero: ['#5856D6', '#7A79E0', '#F2F2F7'] as const,
};

export type Colors = typeof colors;
