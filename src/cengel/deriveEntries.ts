import { Cell, Entry, Puzzle } from './types';

/**
 * Derive all entries (across + down) from a puzzle grid.
 *
 * For each CLUE cell:
 * - If it has `across`, scan RIGHT collecting LETTER cells → one across entry
 * - If it has `down`, scan DOWN collecting LETTER cells → one down entry
 */
export function deriveEntries(puzzle: Puzzle): Entry[] {
    const { grid, size } = puzzle;
    const [rows, cols] = size;
    const entries: Entry[] = [];
    let acrossCounter = 0;
    let downCounter = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            if (cell.type !== 'CLUE') continue;

            // ── Across entry ──
            if (cell.across) {
                acrossCounter++;
                const entryCells: Array<{ row: number; col: number }> = [];
                let solution = '';
                let nc = c + 1;
                while (nc < cols) {
                    const next = grid[r][nc];
                    if (next.type !== 'LETTER') break;
                    entryCells.push({ row: r, col: nc });
                    solution += next.solution;
                    nc++;
                }
                if (entryCells.length > 0) {
                    entries.push({
                        id: `A${acrossCounter}`,
                        direction: 'across',
                        clueCell: { row: r, col: c },
                        clueText: cell.across.clue,
                        start: entryCells[0],
                        cells: entryCells,
                        length: entryCells.length,
                        solution,
                    });
                }
            }

            // ── Down entry ──
            if (cell.down) {
                downCounter++;
                const entryCells: Array<{ row: number; col: number }> = [];
                let solution = '';
                let nr = r + 1;
                while (nr < rows) {
                    const next = grid[nr][c];
                    if (next.type !== 'LETTER') break;
                    entryCells.push({ row: nr, col: c });
                    solution += next.solution;
                    nr++;
                }
                if (entryCells.length > 0) {
                    entries.push({
                        id: `D${downCounter}`,
                        direction: 'down',
                        clueCell: { row: r, col: c },
                        clueText: cell.down.clue,
                        start: entryCells[0],
                        cells: entryCells,
                        length: entryCells.length,
                        solution,
                    });
                }
            }
        }
    }

    return entries;
}
