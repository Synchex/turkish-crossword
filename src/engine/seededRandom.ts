/**
 * Deterministic PRNG using Mulberry32 algorithm.
 * Same seed → same sequence. Fast, good distribution, tiny footprint.
 */
export class SeededRandom {
    private state: number;

    constructor(seed: number) {
        this.state = seed | 0;
    }

    /** Returns a float in [0, 1) */
    next(): number {
        this.state = (this.state + 0x6d2b79f5) | 0;
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** Returns an integer in [0, max) */
    nextInt(max: number): number {
        return Math.floor(this.next() * max);
    }

    /** Fisher-Yates shuffle (in-place, returns same array) */
    shuffle<T>(arr: T[]): T[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Pick a random element from an array */
    pick<T>(arr: T[]): T {
        return arr[Math.floor(this.next() * arr.length)];
    }
}

/**
 * Generate a seed from a date (for daily puzzles).
 * Same date → same seed for all users.
 */
export function dailySeed(date: Date): number {
    const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
    // Mix with a constant to avoid trivial seeds
    return hashInt(daysSinceEpoch ^ 0xb01dface);
}

function hashInt(x: number): number {
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return x | 0;
}
