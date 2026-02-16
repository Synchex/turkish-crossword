/**
 * CSP Solver for crossword filling.
 *
 * Uses Backtracking + AC-3 constraint propagation + MRV heuristic.
 * Designed for grids up to 15×15 with generation under ~1–2 seconds.
 *
 * Hardened against stack overflow with:
 *  - Global attempt counter (not just depth)
 *  - Candidate cap per slot to limit branching factor
 *  - Time-based bailout
 */

import { Slot, WordEntry, SolverConfig } from './types';
import { WordIndex, patternMatch } from './wordIndex';

// ═══════════════════════════════════════════════════════════════
// Solver Result
// ═══════════════════════════════════════════════════════════════

export interface SolverResult {
    success: boolean;
    slots: Slot[];
    backtracks: number;
    timeMs: number;
}

// ═══════════════════════════════════════════════════════════════
// AC-3 (Arc Consistency)
// ═══════════════════════════════════════════════════════════════

/**
 * Run AC-3 constraint propagation over all slots.
 * Returns false if any domain is wiped out (unsolvable).
 */
function ac3(slots: Slot[]): boolean {
    const queue: [number, number][] = [];
    for (const slot of slots) {
        for (const ix of slot.intersections) {
            queue.push([slot.id, ix.otherSlotId]);
        }
    }

    let iterations = 0;
    const MAX_ITERATIONS = 10000;

    while (queue.length > 0 && iterations < MAX_ITERATIONS) {
        iterations++;
        const [siId, sjId] = queue.shift()!;
        const si = slots[siId];
        const sj = slots[sjId];

        if (si.assignedWord || sj.assignedWord) continue;

        if (revise(si, sj)) {
            if (si.domain.length === 0) return false;

            for (const ix of si.intersections) {
                if (ix.otherSlotId !== sjId) {
                    queue.push([ix.otherSlotId, si.id]);
                }
            }
        }
    }

    return true;
}

/**
 * Revise Si's domain with respect to Sj.
 */
function revise(si: Slot, sj: Slot): boolean {
    const ix = si.intersections.find(x => x.otherSlotId === sj.id);
    if (!ix) return false;

    const othPos = ix.otherPosition;
    const thiPos = ix.thisPosition;

    const supportedLetters = new Set<string>();
    for (const word of sj.domain) {
        supportedLetters.add(word.answer[othPos]);
    }
    if (sj.assignedWord) {
        supportedLetters.add(sj.assignedWord.answer[othPos]);
    }

    const before = si.domain.length;
    si.domain = si.domain.filter(w => supportedLetters.has(w.answer[thiPos]));

    return si.domain.length < before;
}

// ═══════════════════════════════════════════════════════════════
// Forward Checking
// ═══════════════════════════════════════════════════════════════

function forwardCheck(slot: Slot, word: WordEntry, slots: Slot[]): boolean {
    for (const ix of slot.intersections) {
        const otherSlot = slots[ix.otherSlotId];
        if (otherSlot.assignedWord !== null) {
            if (otherSlot.assignedWord.answer[ix.otherPosition] !== word.answer[ix.thisPosition]) {
                return false;
            }
            continue;
        }

        const requiredLetter = word.answer[ix.thisPosition];
        const pos = ix.otherPosition;

        otherSlot.domain = otherSlot.domain.filter(
            candidate => candidate.answer[pos] === requiredLetter
        );

        if (otherSlot.domain.length === 0) {
            return false;
        }
    }

    return true;
}

// ═══════════════════════════════════════════════════════════════
// MRV (Minimum Remaining Values) Heuristic
// ═══════════════════════════════════════════════════════════════

function selectMRV(slots: Slot[]): Slot | null {
    let best: Slot | null = null;
    let bestSize = Infinity;
    let bestDegree = -1;

    for (const slot of slots) {
        if (slot.assignedWord !== null) continue;

        const size = slot.domain.length;
        const degree = slot.intersections.length;

        if (size < bestSize || (size === bestSize && degree > bestDegree)) {
            best = slot;
            bestSize = size;
            bestDegree = degree;
        }
    }

    return best;
}

// ═══════════════════════════════════════════════════════════════
// Domain Snapshot (for undo during backtracking)
// ═══════════════════════════════════════════════════════════════

interface DomainSnapshot {
    slotId: number;
    domain: WordEntry[];
}

function saveDomains(slot: Slot, slots: Slot[]): DomainSnapshot[] {
    const snapshots: DomainSnapshot[] = [];
    for (const ix of slot.intersections) {
        const otherSlot = slots[ix.otherSlotId];
        if (otherSlot.assignedWord !== null) continue;
        snapshots.push({ slotId: otherSlot.id, domain: [...otherSlot.domain] });
    }
    return snapshots;
}

function restoreDomains(snapshots: DomainSnapshot[], slots: Slot[]): void {
    for (const snap of snapshots) {
        slots[snap.slotId].domain = snap.domain;
    }
}

// ═══════════════════════════════════════════════════════════════
// Main Solver
// ═══════════════════════════════════════════════════════════════

/** Maximum candidates to try per slot — caps branching factor */
const MAX_CANDIDATES_PER_SLOT = 40;

/**
 * Solve the crossword CSP.
 */
export function solve(
    slots: Slot[],
    config: SolverConfig
): SolverResult {
    const startTime = Date.now();
    let totalAttempts = 0;
    const maxAttempts = config.maxBacktrackDepth;
    const usedWordIds = new Set<string>();

    // Run initial AC-3
    if (!ac3(slots)) {
        return { success: false, slots, backtracks: 0, timeMs: Date.now() - startTime };
    }

    function backtrack(depth: number): boolean {
        // Safety checks
        if (totalAttempts > maxAttempts) return false;
        if (Date.now() - startTime > config.maxTimeMs) return false;

        // Select next variable (MRV)
        const slot = selectMRV(slots);
        if (slot === null) return true; // all assigned → success

        if (slot.domain.length === 0) return false;

        // Shuffle and cap domain
        const allCandidates = config.rng.shuffle([...slot.domain]);
        const candidates = allCandidates.slice(0, MAX_CANDIDATES_PER_SLOT);

        for (const word of candidates) {
            if (usedWordIds.has(word.id)) continue;

            totalAttempts++;
            if (totalAttempts > maxAttempts) return false;

            // Save state
            const savedDomains = saveDomains(slot, slots);

            // Assign
            slot.assignedWord = word;
            usedWordIds.add(word.id);

            // Forward check
            if (forwardCheck(slot, word, slots)) {
                if (backtrack(depth + 1)) return true;
            }

            // Undo
            slot.assignedWord = null;
            usedWordIds.delete(word.id);
            restoreDomains(savedDomains, slots);
        }

        return false;
    }

    const success = backtrack(0);

    return {
        success,
        slots,
        backtracks: totalAttempts,
        timeMs: Date.now() - startTime,
    };
}

// ═══════════════════════════════════════════════════════════════
// Domain Initialization
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize domains for all slots from the word index.
 * Filters by length, difficulty band, and excluded IDs.
 */
export function initializeDomains(
    slots: Slot[],
    wordIndex: WordIndex,
    difficultyBand: [number, number] | null,
    excludeIds: Set<string>
): void {
    for (const slot of slots) {
        const candidates = wordIndex.byLength.get(slot.length);
        if (!candidates) {
            slot.domain = [];
            continue;
        }

        let filtered = [...candidates];

        if (difficultyBand) {
            filtered = filtered.filter(
                w => w.difficultyScore >= difficultyBand[0] && w.difficultyScore <= difficultyBand[1]
            );
        }

        if (excludeIds.size > 0) {
            filtered = filtered.filter(w => !excludeIds.has(w.id));
        }

        slot.domain = filtered;
    }
}
