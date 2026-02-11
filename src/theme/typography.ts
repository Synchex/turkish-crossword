import { TextStyle } from 'react-native';

export const typography = {
    hero: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.5,
    } as TextStyle,

    h1: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.3,
    } as TextStyle,

    h2: {
        fontSize: 22,
        fontWeight: '700',
    } as TextStyle,

    h3: {
        fontSize: 18,
        fontWeight: '700',
    } as TextStyle,

    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    } as TextStyle,

    bodyBold: {
        fontSize: 16,
        fontWeight: '600',
    } as TextStyle,

    caption: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
    } as TextStyle,

    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    } as TextStyle,

    button: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    } as TextStyle,
} as const;

export type Typography = typeof typography;
