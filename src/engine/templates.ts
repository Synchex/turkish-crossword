/**
 * Grid template definitions and slot extraction.
 *
 * Templates define the black/white cell pattern.
 * Each has 180° rotational symmetry (standard crossword convention).
 *
 * Legend: . = white (letter cell), # = black cell
 */

import { GridTemplate, Slot, Intersection } from './types';

// ═══════════════════════════════════════════════════════════════
// Template Definitions
// ═══════════════════════════════════════════════════════════════

/**
 * Parse a visual template string into a boolean[][] grid.
 * '.' = white (true), '#' = black (false)
 */
function parseTemplate(visual: string): boolean[][] {
    return visual
        .trim()
        .split('\n')
        .map(row =>
            row
                .trim()
                .split(/\s+/)
                .map(c => c === '.')
        );
}

function computeTemplateStats(cells: boolean[][]): { slotCount: number; avgSlotLength: number } {
    const slots = extractSlotsFromCells(cells);
    const totalLen = slots.reduce((s, sl) => s + sl.length, 0);
    return {
        slotCount: slots.length,
        avgSlotLength: slots.length > 0 ? totalLen / slots.length : 0,
    };
}

// ── 7×7 Templates (Easy) ──

const TEMPLATES_7x7: string[] = [
    // Template 1: Classic symmetric
    `
  . . . # . . .
  . # . # . # .
  . . . . . . .
  # # . # . # #
  . . . . . . .
  . # . # . # .
  . . . # . . .
  `,
    // Template 2: Open center
    `
  . . . # . . .
  . # . . . # .
  . . . # . . .
  # . # # # . #
  . . . # . . .
  . # . . . # .
  . . . # . . .
  `,
    // Template 3: Diamond pattern
    `
  . . . # . . .
  . . # . # . .
  . . . . . . .
  # . . . . . #
  . . . . . . .
  . . # . # . .
  . . . # . . .
  `,
    // Template 4: Steps
    `
  . . # # . . .
  . . . # . # .
  # . . . . . .
  # # . . . # #
  . . . . . . #
  . # . # . . .
  . . . # # . .
  `,
    // Template 5: Corridor
    `
  . . . # . . .
  . # . . . # .
  . . . . . . .
  # . . # . . #
  . . . . . . .
  . # . . . # .
  . . . # . . .
  `,
];

// ── 9×9 Templates (Medium) ──
// Target: mostly 3-4 letter slots, few 5s, minimal 2s

const TEMPLATES_9x9: string[] = [
    // Template 1: ~20 slots, mostly 3-4
    `
  . . . . # . . . .
  . # . # . . # . #
  . . . . . . . . .
  . # . # . # . # .
  # . . . # . . . #
  . # . # . # . # .
  . . . . . . . . .
  # . # . . # . # .
  . . . . # . . . .
  `,
    // Template 2: Asymmetric blocks
    `
  . . . # . . . . .
  . # . . . # . # .
  . . . # . . . . .
  # . # . . . # . #
  . . . . # . . . .
  # . # . . . # . #
  . . . . . # . . .
  . # . # . . . # .
  . . . . . # . . .
  `,
    // Template 3: Staircase
    `
  . . . . # . . . .
  . . # . . . # . .
  . # . . . # . . .
  # . . . # . . . #
  . . . # . # . . .
  # . . . # . . . #
  . . . # . . . # .
  . . # . . . # . .
  . . . . # . . . .
  `,
];

// ── 11×11 Templates (Medium-Hard) ──
// Target: mostly 3-5 letter slots

const TEMPLATES_11x11: string[] = [
    // Template 1
    `
  . . . . # . . . . # .
  . # . # . . # . # . .
  . . . . . # . . . . .
  . # . # . . . # . # .
  # . . . # . # . . . #
  . . # . . . . . # . .
  # . . . # . # . . . #
  . # . # . . . # . # .
  . . . . . # . . . . .
  . . # . # . . # . # .
  . # . . . . # . . . .
  `,
    // Template 2
    `
  . . . . . # . . . . .
  . # . # . . . # . # .
  . . . . # . # . . . .
  . # . # . . . # . # .
  . . . . . # . . . . .
  # . # . # . # . # . #
  . . . . . # . . . . .
  . # . # . . . # . # .
  . . . . # . # . . . .
  . # . # . . . # . # .
  . . . . . # . . . . .
  `,
];

// ── 13×13 Templates (Hard) ──
// Target: mostly 3-5 letter slots, some 6s

const TEMPLATES_13x13: string[] = [
    `
  . . . . . # . . . # . . .
  . # . # . . . # . . . # .
  . . . . # . # . . . # . .
  . # . # . . . . # . . # .
  . . . . . # . # . . . . .
  # . # . # . # . . # . # .
  . . . . . . . # . . . . .
  . # . # . . # . # . # . #
  . . . . . # . # . . . . .
  . # . . # . . . . # . # .
  . . # . . . # . # . . . .
  . # . . . # . . . # . # .
  . . . # . . . # . . . . .
  `,
];


// ═══════════════════════════════════════════════════════════════
// Build Template Registry
// ═══════════════════════════════════════════════════════════════

function buildTemplates(
    visuals: string[],
    size: number,
    tier: 'easy' | 'medium' | 'hard'
): GridTemplate[] {
    return visuals.map((v, i) => {
        const cells = parseTemplate(v);
        // Validate dimensions
        if (cells.length !== size || cells.some(row => row.length !== size)) {
            console.warn(
                `Template ${size}x${size}_${i + 1} has wrong dimensions: ${cells.length}×${cells[0]?.length}`
            );
        }
        const stats = computeTemplateStats(cells);
        return {
            id: `${size}x${size}_${String(i + 1).padStart(2, '0')}`,
            size,
            cells,
            symmetry: 'rotational_180' as const,
            slotCount: stats.slotCount,
            avgSlotLength: Math.round(stats.avgSlotLength * 10) / 10,
            difficultyTier: tier,
        };
    });
}

/** All available templates, indexed by size. */
const ALL_TEMPLATES: GridTemplate[] = [
    ...buildTemplates(TEMPLATES_7x7, 7, 'easy'),
    ...buildTemplates(TEMPLATES_9x9, 9, 'medium'),
    ...buildTemplates(TEMPLATES_11x11, 11, 'hard'),
    ...buildTemplates(TEMPLATES_13x13, 13, 'hard'),
];

export function getTemplatesBySize(size: number): GridTemplate[] {
    return ALL_TEMPLATES.filter(t => t.size === size);
}

export function getTemplatesByTier(tier: 'easy' | 'medium' | 'hard'): GridTemplate[] {
    return ALL_TEMPLATES.filter(t => t.difficultyTier === tier);
}

export function getAllTemplates(): GridTemplate[] {
    return ALL_TEMPLATES;
}

// ═══════════════════════════════════════════════════════════════
// Slot Extraction
// ═══════════════════════════════════════════════════════════════

/**
 * Extract slots from a cell grid. Internal helper (no intersection computation).
 */
function extractSlotsFromCells(cells: boolean[][]): { direction: 'across' | 'down'; row: number; col: number; length: number }[] {
    const size = cells.length;
    const result: { direction: 'across' | 'down'; row: number; col: number; length: number }[] = [];

    // Across slots
    for (let r = 0; r < size; r++) {
        let runStart = -1;
        for (let c = 0; c <= size; c++) {
            const isWhite = c < size && cells[r][c];
            if (isWhite && runStart === -1) {
                runStart = c;
            } else if (!isWhite && runStart !== -1) {
                const len = c - runStart;
                if (len >= 2) {
                    result.push({ direction: 'across', row: r, col: runStart, length: len });
                }
                runStart = -1;
            }
        }
    }

    // Down slots
    for (let c = 0; c < size; c++) {
        let runStart = -1;
        for (let r = 0; r <= size; r++) {
            const isWhite = r < size && cells[r][c];
            if (isWhite && runStart === -1) {
                runStart = r;
            } else if (!isWhite && runStart !== -1) {
                const len = r - runStart;
                if (len >= 2) {
                    result.push({ direction: 'down', row: runStart, col: c, length: len });
                }
                runStart = -1;
            }
        }
    }

    return result;
}

/**
 * Extract full Slot objects with intersections from a template.
 * This is the main extraction used by the solver.
 */
export function extractSlots(template: GridTemplate): Slot[] {
    const rawSlots = extractSlotsFromCells(template.cells);

    // Build full Slot objects
    const slots: Slot[] = rawSlots.map((raw, idx) => {
        const cells: [number, number][] = [];
        for (let i = 0; i < raw.length; i++) {
            if (raw.direction === 'across') {
                cells.push([raw.row, raw.col + i]);
            } else {
                cells.push([raw.row + i, raw.col]);
            }
        }
        return {
            id: idx,
            direction: raw.direction,
            row: raw.row,
            col: raw.col,
            length: raw.length,
            cells,
            intersections: [],
            assignedWord: null,
            domain: [],
            domainSnapshot: null,
        };
    });

    // Build cell → slot mapping for intersection detection
    const cellToSlot = new Map<string, { slotId: number; position: number; direction: 'across' | 'down' }[]>();

    for (const slot of slots) {
        for (let pos = 0; pos < slot.cells.length; pos++) {
            const [r, c] = slot.cells[pos];
            const key = `${r},${c}`;
            if (!cellToSlot.has(key)) cellToSlot.set(key, []);
            cellToSlot.get(key)!.push({ slotId: slot.id, position: pos, direction: slot.direction });
        }
    }

    // Detect intersections: cells shared by two slots of different directions
    for (const entries of cellToSlot.values()) {
        if (entries.length < 2) continue;
        for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
                const a = entries[i];
                const b = entries[j];
                if (a.direction === b.direction) continue; // same direction can't intersect

                slots[a.slotId].intersections.push({
                    otherSlotId: b.slotId,
                    thisPosition: a.position,
                    otherPosition: b.position,
                });
                slots[b.slotId].intersections.push({
                    otherSlotId: a.slotId,
                    thisPosition: b.position,
                    otherPosition: a.position,
                });
            }
        }
    }

    return slots;
}
