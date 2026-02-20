/**
 * useCellFeedback – Per-cell correct/wrong animations using RN's built-in Animated API.
 *
 * Provides Animated.Value instances per cell and imperative trigger functions
 * for correct (pop + green flash) and wrong (shake + red flash) animations.
 */
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

// ── Types ──

export interface CellAnimValues {
    scale: Animated.Value;
    shakeX: Animated.Value;
    flashOpacity: Animated.Value;
    /** 0 = green (correct), 1 = red (wrong) */
    flashType: 'correct' | 'wrong';
}

export interface CellFeedback {
    /** Get (or create) the animated values for a cell */
    getValues: (cellKey: string) => CellAnimValues;
    /** Trigger correct animation on a single cell */
    animateCellCorrect: (cellKey: string) => void;
    /** Trigger wrong animation on a single cell */
    animateCellWrong: (cellKey: string) => void;
    /** Animate multiple cells as correct with stagger */
    animateBatchCorrect: (cellKeys: string[]) => void;
    /** Animate multiple cells as wrong with stagger */
    animateBatchWrong: (cellKeys: string[]) => void;
}

// ── Helpers ──

const STAGGER_MS = 15;

// ── Hook ──

export function useCellFeedback(): CellFeedback {
    const mapRef = useRef<Map<string, CellAnimValues>>(new Map());

    const getValues = useCallback((cellKey: string): CellAnimValues => {
        const existing = mapRef.current.get(cellKey);
        if (existing) return existing;

        const entry: CellAnimValues = {
            scale: new Animated.Value(1),
            shakeX: new Animated.Value(0),
            flashOpacity: new Animated.Value(0),
            flashType: 'correct',
        };
        mapRef.current.set(cellKey, entry);
        return entry;
    }, []);

    const animateCellCorrect = useCallback((key: string) => {
        const v = mapRef.current.get(key);
        if (!v) return;

        v.flashType = 'correct';

        // Pop: 1 → 1.12 → 1
        Animated.sequence([
            Animated.timing(v.scale, {
                toValue: 1.12,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(v.scale, {
                toValue: 1,
                friction: 8,
                tension: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Green flash
        Animated.sequence([
            Animated.timing(v.flashOpacity, {
                toValue: 1,
                duration: 80,
                useNativeDriver: false,
            }),
            Animated.timing(v.flashOpacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    const animateCellWrong = useCallback((key: string) => {
        const v = mapRef.current.get(key);
        if (!v) return;

        v.flashType = 'wrong';

        // Shake: translateX [-6, 6, -4, 4, -2, 2, 0]
        Animated.sequence([
            Animated.timing(v.shakeX, { toValue: -6, duration: 40, useNativeDriver: true }),
            Animated.timing(v.shakeX, { toValue: 6, duration: 40, useNativeDriver: true }),
            Animated.timing(v.shakeX, { toValue: -4, duration: 40, useNativeDriver: true }),
            Animated.timing(v.shakeX, { toValue: 4, duration: 40, useNativeDriver: true }),
            Animated.timing(v.shakeX, { toValue: -2, duration: 40, useNativeDriver: true }),
            Animated.timing(v.shakeX, { toValue: 2, duration: 40, useNativeDriver: true }),
            Animated.timing(v.shakeX, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start();

        // Red flash
        Animated.sequence([
            Animated.timing(v.flashOpacity, {
                toValue: 1,
                duration: 60,
                useNativeDriver: false,
            }),
            Animated.timing(v.flashOpacity, {
                toValue: 0,
                duration: 240,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    const animateBatchCorrect = useCallback(
        (cellKeys: string[]) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            cellKeys.forEach((key, i) => {
                setTimeout(() => animateCellCorrect(key), i * STAGGER_MS);
            });
        },
        [animateCellCorrect],
    );

    const animateBatchWrong = useCallback(
        (cellKeys: string[]) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            cellKeys.forEach((key, i) => {
                setTimeout(() => animateCellWrong(key), i * STAGGER_MS);
            });
        },
        [animateCellWrong],
    );

    return {
        getValues,
        animateCellCorrect,
        animateCellWrong,
        animateBatchCorrect,
        animateBatchWrong,
    };
}

/**
 * Utility: create a cell key from row/col.
 */
export function cellKey(row: number, col: number): string {
    return `${row},${col}`;
}
