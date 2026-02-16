import { TextStyle } from 'react-native';

export const typography = {
    /** iOS Large Title — 34pt bold */
    hero: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.37,
    } as TextStyle,

    /** iOS Title 1 — 28pt bold */
    h1: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 0.36,
    } as TextStyle,

    /** iOS Title 2 — 22pt bold */
    h2: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.35,
    } as TextStyle,

    /** iOS Title 3 — 20pt semibold */
    h3: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.38,
    } as TextStyle,

    /** iOS Headline — 17pt semibold */
    headline: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.41,
    } as TextStyle,

    /** iOS Body — 17pt regular */
    body: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 22,
        letterSpacing: -0.41,
    } as TextStyle,

    /** iOS Body bold */
    bodyBold: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.41,
    } as TextStyle,

    /** iOS Callout — 16pt */
    callout: {
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: -0.32,
    } as TextStyle,

    /** iOS Subheadline — 15pt */
    subheadline: {
        fontSize: 15,
        fontWeight: '400',
        letterSpacing: -0.24,
    } as TextStyle,

    /** iOS Footnote — 13pt */
    caption: {
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: -0.08,
    } as TextStyle,

    /** iOS Caption 2 — 11pt */
    label: {
        fontSize: 11,
        fontWeight: '400',
        letterSpacing: 0.07,
    } as TextStyle,

    /** Button text — 17pt semibold */
    button: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.41,
    } as TextStyle,
} as const;

export type Typography = typeof typography;
