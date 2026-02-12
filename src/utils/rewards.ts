import { Difficulty } from '../data/questions';

// ── Time thresholds (seconds) ──
const TARGET_TIME: Record<string, number> = {
    easy: 240,   // 4 min
    medium: 360, // 6 min
    hard: 540,   // 9 min
};

// ── Star Rating ──
// 3★: 0 hints, mistakes ≤ 1, time ≤ threshold
// 2★: hints ≤ 2, mistakes ≤ 3
// 1★: puzzle completed
//
// Hint caps:
// - hintsUsed > 0 → max 2 stars (blocks 3★)
// - hintsUsed ≥ 4 → max 1 star
export function computeStars(
    hintsUsed: number,
    mistakes: number,
    timeSec: number = 0,
    difficulty: string = 'easy'
): number {
    // Hint caps first
    if (hintsUsed >= 4) return 1;

    const maxStarsByHints = hintsUsed > 0 ? 2 : 3;
    const targetTime = TARGET_TIME[difficulty] ?? TARGET_TIME.easy;

    // 3-star check (only reachable if hintsUsed === 0)
    if (
        maxStarsByHints >= 3 &&
        hintsUsed === 0 &&
        mistakes <= 1 &&
        timeSec <= targetTime
    ) {
        return 3;
    }

    // 2-star check
    if (maxStarsByHints >= 2 && hintsUsed <= 2 && mistakes <= 3) {
        return 2;
    }

    return 1;
}

// ── XP Rewards ──
const BASE_XP: Record<string, number> = {
    easy: 10,
    medium: 20,
    hard: 35,
};

export function computeXP(
    difficulty: string,
    stars: number,
    hintsUsed: number
): number {
    let xp = BASE_XP[difficulty] ?? 10;
    if (stars === 3) xp += 5;
    if (stars === 2) xp += 2;
    xp -= hintsUsed * 2;
    return Math.max(0, xp);
}

// ── Coin Rewards ──
const BASE_COINS: Record<string, number> = {
    easy: 2,
    medium: 4,
    hard: 7,
};

export function computeCoins(difficulty: string, stars: number): number {
    let coins = BASE_COINS[difficulty] ?? 2;
    if (stars === 3) coins += 5;
    if (stars === 2) coins += 2;
    return coins;
}

// ── Map Turkish difficulty to English ──
export function mapDifficulty(d: string): Difficulty {
    if (d === 'Kolay') return 'easy';
    if (d === 'Zor') return 'hard';
    return 'medium';
}
