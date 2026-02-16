import { Cell, Puzzle } from './types';

/**
 * Build a puzzle grid from a list of word placements.
 *
 * Each placement specifies:
 *   - clueRow, clueCol: position of the CLUE cell
 *   - direction: 'across' | 'down'
 *   - clue: the clue text
 *   - answer: the answer word (uppercase Turkish)
 *
 * The builder:
 *   1) Creates a rows×cols grid filled with BLOCK cells
 *   2) For each placement, sets the clue cell and letter cells
 *   3) Merges clue cells that already exist (adding the other direction)
 */

export interface WordPlacement {
    clueRow: number;
    clueCol: number;
    direction: 'across' | 'down';
    clue: string;
    answer: string;
}

export interface PuzzleSpec {
    id: string;
    title: string;
    rows: number;
    cols: number;
    theme: string;
    difficulty: 'easy' | 'medium' | 'hard';
    placements: WordPlacement[];
}

export function buildPuzzleFromSpec(spec: PuzzleSpec): Puzzle {
    const { rows, cols, placements } = spec;

    // Initialize with BLOCK cells
    const grid: Cell[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, (): Cell => ({ type: 'BLOCK' })),
    );

    for (const p of placements) {
        const { clueRow, clueCol, direction, clue, answer } = p;

        // Set or merge clue cell
        const existing = grid[clueRow][clueCol];
        if (existing.type === 'CLUE') {
            // Merge: add the other direction
            if (direction === 'across') {
                (existing as any).across = { clue };
            } else {
                (existing as any).down = { clue };
            }
        } else {
            grid[clueRow][clueCol] = direction === 'across'
                ? { type: 'CLUE', across: { clue } }
                : { type: 'CLUE', down: { clue } };
        }

        // Place letter cells
        for (let i = 0; i < answer.length; i++) {
            const r = direction === 'down' ? clueRow + 1 + i : clueRow;
            const c = direction === 'across' ? clueCol + 1 + i : clueCol;

            if (r >= rows || c >= cols) {
                console.warn(
                    `[puzzleBuilder] "${spec.id}" word "${answer}" overflows grid at (${r},${c})`,
                );
                continue;
            }

            const cell = grid[r][c];
            if (cell.type === 'LETTER') {
                // Already a letter — verify it matches
                if (cell.solution !== answer[i]) {
                    console.warn(
                        `[puzzleBuilder] "${spec.id}" conflict at (${r},${c}): ` +
                        `existing "${cell.solution}" vs new "${answer[i]}"`,
                    );
                }
            } else if (cell.type === 'BLOCK') {
                grid[r][c] = { type: 'LETTER', solution: answer[i] };
            }
            // If it's a CLUE cell, don't overwrite (shouldn't happen in valid puzzles)
        }
    }

    return {
        id: spec.id,
        title: spec.title,
        size: [rows, cols],
        theme: spec.theme,
        difficulty: spec.difficulty,
        grid,
    };
}
