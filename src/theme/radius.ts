export const radius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    xxl: 32,
    full: 9999,
} as const;

export type Radius = typeof radius;
