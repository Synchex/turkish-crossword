import { Entry, GameCell, Puzzle } from './types';
import { deriveEntries } from './deriveEntries';

/**
 * Build the runtime game grid from a puzzle definition.
 */
export function buildGameGrid(puzzle: Puzzle): GameCell[][] {
    const [rows, cols] = puzzle.size;
    const grid: GameCell[][] = [];

    for (let r = 0; r < rows; r++) {
        const row: GameCell[] = [];
        for (let c = 0; c < cols; c++) {
            const cell = puzzle.grid[r][c];
            switch (cell.type) {
                case 'BLOCK':
                    row.push({ row: r, col: c, type: 'BLOCK' });
                    break;
                case 'LETTER':
                    row.push({
                        row: r, col: c, type: 'LETTER',
                        solution: cell.solution,
                        userLetter: '',
                        isLocked: false,
                        isRevealed: false,
                    });
                    break;
                case 'CLUE':
                    row.push({
                        row: r, col: c, type: 'CLUE',
                        clueAcross: cell.across?.clue,
                        clueDown: cell.down?.clue,
                    });
                    break;
            }
        }
        grid.push(row);
    }
    return grid;
}

/**
 * Find all entries that pass through a given cell.
 */
export function findEntriesForCell(
    row: number,
    col: number,
    entries: Entry[],
): Entry[] {
    return entries.filter((e) =>
        e.cells.some((c) => c.row === row && c.col === col),
    );
}

/**
 * Find the entry in a specific direction for a cell.
 */
export function findEntryForCellInDirection(
    row: number,
    col: number,
    direction: 'across' | 'down',
    entries: Entry[],
): Entry | undefined {
    return entries.find(
        (e) =>
            e.direction === direction &&
            e.cells.some((c) => c.row === row && c.col === col),
    );
}

/**
 * Get the cell index within an entry.
 */
export function getCellIndexInEntry(
    row: number,
    col: number,
    entry: Entry,
): number {
    return entry.cells.findIndex((c) => c.row === row && c.col === col);
}

/**
 * Calculate stars based on hint usage.
 * 0 hints = 3 stars, 1-2 hints = 2 stars, 3-5 hints = 1 star, 6+ = 0 stars (still complete)
 */
export function calculateStars(hintsUsed: number): number {
    if (hintsUsed === 0) return 3;
    if (hintsUsed <= 2) return 2;
    if (hintsUsed <= 5) return 1;
    return 1; // minimum 1 star for completion
}

/**
 * Initialize a puzzle — derive entries and build game grid.
 */
export function initPuzzle(puzzle: Puzzle) {
    return {
        gameGrid: buildGameGrid(puzzle),
        entries: deriveEntries(puzzle),
    };
}
