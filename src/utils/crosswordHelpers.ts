/**
 * Crossword helper utilities for start-cell lookups and entry resolution.
 */

import { Word, Direction } from '../game/types';

// ── Types ──

export interface ClueEntry {
    word: Word;
    cells: Array<{ row: number; col: number }>;
}

export interface StartCellInfo {
    across?: ClueEntry;
    down?: ClueEntry;
}

// ── Build cells array for a word ──

function wordCells(word: Word): Array<{ row: number; col: number }> {
    const cells: Array<{ row: number; col: number }> = [];
    for (let i = 0; i < word.answer.length; i++) {
        cells.push({
            row: word.direction === 'down' ? word.startRow + i : word.startRow,
            col: word.direction === 'across' ? word.startCol + i : word.startCol,
        });
    }
    return cells;
}

// ── Build a Map keyed by "row,col" for every start cell ──

export function buildStartCellMap(
    words: Word[],
): Map<string, StartCellInfo> {
    const map = new Map<string, StartCellInfo>();

    for (const word of words) {
        const key = `${word.startRow},${word.startCol}`;
        const entry: ClueEntry = { word, cells: wordCells(word) };

        const existing = map.get(key) ?? {};
        if (word.direction === 'across') {
            existing.across = entry;
        } else {
            existing.down = entry;
        }
        map.set(key, existing);
    }

    return map;
}

// ── Lookup helpers ──

export function entriesAtCell(
    map: Map<string, StartCellInfo>,
    row: number,
    col: number,
): StartCellInfo | undefined {
    return map.get(`${row},${col}`);
}

export function entryAtCell(
    map: Map<string, StartCellInfo>,
    row: number,
    col: number,
    direction?: Direction,
): ClueEntry | undefined {
    const info = map.get(`${row},${col}`);
    if (!info) return undefined;
    if (direction) return direction === 'across' ? info.across : info.down;
    return info.across ?? info.down;
}
