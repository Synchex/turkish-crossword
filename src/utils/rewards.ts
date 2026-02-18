import { Difficulty } from '../data/questions';

// ── Time thresholds (seconds) ──
const TARGET_TIME: Record<string, number> = {
    easy: 240,   // 4 min
    medium: 360, // 6 min
    hard: 540,   // 9 min
};

// ═══════════════════════════════════════════════
// STAR RATING (unchanged logic)
// ═══════════════════════════════════════════════
// 3★: 0 hints, mistakes ≤ 1, time ≤ threshold
// 2★: hints ≤ 1
// 1★: puzzle completed
export function computeStars(
    hintsUsed: number,
    mistakes: number,
    timeSec: number = 0,
    difficulty: string = 'easy'
): number {
    if (hintsUsed >= 4) return 1;

    const maxStarsByHints = hintsUsed > 0 ? 2 : 3;
    const targetTime = TARGET_TIME[difficulty] ?? TARGET_TIME.easy;

    if (
        maxStarsByHints >= 3 &&
        hintsUsed === 0 &&
        mistakes <= 1 &&
        timeSec <= targetTime
    ) {
        return 3;
    }

    if (maxStarsByHints >= 2 && hintsUsed <= 1 && mistakes <= 3) {
        return 2;
    }

    return 1;
}

// ═══════════════════════════════════════════════
// XP CALCULATION (new Duolingo-level formula)
// ═══════════════════════════════════════════════

export interface XPInput {
    isBigPuzzle: boolean;
    timeSec: number;
    mistakes: number;
    letterHints: number;  // random letter reveals
    clueHints: number;    // random clue reveals
}

export interface XPResult {
    totalXP: number;
    baseXP: number;
    timeBonus: number;
    mistakePenalty: number;
    hintPenalty: number;
    perfectBonus: number;
    isPerfect: boolean;
}

const TIME_BONUS_MAX = 20;
const PERFECT_BONUS = 25;
const MISTAKE_PENALTY_PER = 3;
const LETTER_HINT_PENALTY = 10;
const CLUE_HINT_PENALTY = 15;
const MIN_XP = 5;

export function calculateXP(input: XPInput): XPResult {
    const base = input.isBigPuzzle ? 150 : 50;

    // Time bonus: 0–20 XP, scales inversely with time
    // Full bonus if under 2 min, 0 bonus if over 10 min
    const minTime = 120;
    const maxTime = 600;
    const clamped = Math.max(minTime, Math.min(maxTime, input.timeSec));
    const timeFraction = 1 - (clamped - minTime) / (maxTime - minTime);
    const timeBonus = Math.round(timeFraction * TIME_BONUS_MAX);

    // Penalties
    const mistakePenalty = input.mistakes * MISTAKE_PENALTY_PER;
    const hintPenalty = input.letterHints * LETTER_HINT_PENALTY
        + input.clueHints * CLUE_HINT_PENALTY;

    // Perfect bonus: 0 hints total AND ≤1 mistake
    const totalHints = input.letterHints + input.clueHints;
    const isPerfect = totalHints === 0 && input.mistakes <= 1;
    const perfectBonus = isPerfect ? PERFECT_BONUS : 0;

    const raw = base + timeBonus - mistakePenalty - hintPenalty + perfectBonus;
    const totalXP = Math.max(MIN_XP, raw);

    return {
        totalXP,
        baseXP: base,
        timeBonus,
        mistakePenalty,
        hintPenalty,
        perfectBonus,
        isPerfect,
    };
}

// ═══════════════════════════════════════════════
// COIN REWARDS (rebalanced: 5–15 range)
// ═══════════════════════════════════════════════

export function computeCoins(stars: number, isBigPuzzle: boolean): number {
    const base = isBigPuzzle ? 8 : 5;
    if (stars === 3) return base + 7;   // 12 or 15
    if (stars === 2) return base + 3;   // 8 or 11
    return base;                        // 5 or 8
}

// ── Map Turkish difficulty to English ──
export function mapDifficulty(d: string): Difficulty {
    if (d === 'Kolay') return 'easy';
    if (d === 'Zor') return 'hard';
    return 'medium';
}

// ═══════════════════════════════════════════════
// LEVEL SYSTEM (new: floor(totalXP / 500) + 1)
// ═══════════════════════════════════════════════

export function getLevel(totalXP: number): number {
    return Math.floor(totalXP / 500) + 1;
}

export function getXPForNextLevel(level: number): number {
    return level * 500;
}

export function getLevelProgress(totalXP: number): number {
    return totalXP % 500;
}

export function getLevelProgressPercent(totalXP: number): number {
    return (totalXP % 500) / 500;
}
