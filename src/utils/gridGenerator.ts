import { Question } from './questionLoader';
import { LevelData, Word } from '../game/types';

interface GridCell {
    char: string | null;
}

/**
 * Attempts to generate a valid crossword grid layout for the given words.
 * Uses a backtracking algorithm to place words.
 */
export function generateLevelData(
    levelId: number,
    title: string,
    difficulty: 'Kolay' | 'Orta' | 'Zor',
    questions: Question[],
    maxGridSize: number = 10
): LevelData {
    // Sort words by length descending (place longest first)
    const sortedQuestions = [...questions].sort((a, b) => b.answerLength - a.answerLength);

    // Try to place words on a virtual grid
    // We'll try multiple times with different shuffling of equal-length words if needed
    // For now, simple greedy approach with backtracking

    let bestLayout: Word[] = [];
    let bestPlacedCount = 0;

    // Attempt placement logic
    // Since we want to center content, let's use a large canvas and trim later
    const CACHE_SIZE = 30; // Virtual canvas size
    const CENTER = Math.floor(CACHE_SIZE / 2);

    // Representation of the grid for collision checking
    // grid[y][x] = char
    const grid: (string | null)[][] = Array(CACHE_SIZE).fill(null).map(() => Array(CACHE_SIZE).fill(null));

    const placedWords: Word[] = [];

    // Place first word horizontally in center
    const firstQ = sortedQuestions[0];
    const firstLen = firstQ.answerLength;
    const startCol = CENTER - Math.floor(firstLen / 2);

    placeWordOnGrid(grid, firstQ.answer, 0, CENTER, startCol, 'across');
    placedWords.push({
        id: '1a',
        direction: 'across',
        startRow: CENTER,
        startCol: startCol,
        answer: firstQ.answer,
        clue: firstQ.clue,
        num: 1
    });

    // Try to place remaining words
    const remaining = sortedQuestions.slice(1);
    let wordsPlaced = 1;

    for (const q of remaining) {
        const placement = findbestPlacement(grid, q.answer, CACHE_SIZE);
        if (placement) {
            placeWordOnGrid(grid, q.answer, 0, placement.row, placement.col, placement.dir);

            // Calculate a unique number (simple logic: increment from last)
            // In a real crossword, numbers are assigned spatially (top-left to bottom-right).
            // We'll reassign numbers at the end.
            placedWords.push({
                id: `${Date.now()}-${Math.random()}`, // temp
                direction: placement.dir,
                startRow: placement.row,
                startCol: placement.col,
                answer: q.answer,
                clue: q.clue,
                num: 0 // temp
            });
            wordsPlaced++;
        }
    }

    // Normalize coordinates to 0,0
    if (placedWords.length > 0) {
        let minRow = Infinity;
        let minCol = Infinity;
        let maxRow = -Infinity;
        let maxCol = -Infinity;

        placedWords.forEach(w => {
            minRow = Math.min(minRow, w.startRow);
            minCol = Math.min(minCol, w.startCol);
            const isAcross = w.direction === 'across';
            maxRow = Math.max(maxRow, w.startRow + (isAcross ? 0 : w.answer.length - 1));
            maxCol = Math.max(maxCol, w.startCol + (isAcross ? w.answer.length - 1 : 0));
        });

        // Shift all
        placedWords.forEach(w => {
            w.startRow -= minRow;
            w.startCol -= minCol;
        });

        // Re-assign numbers (1 to N based on position)
        // Sort by row then col
        placedWords.sort((a, b) => {
            if (a.startRow !== b.startRow) return a.startRow - b.startRow;
            return a.startCol - b.startCol;
        });

        let currentNum = 1;
        placedWords.forEach((w, idx) => {
            w.num = currentNum++;
            w.id = `${w.num}${w.direction.charAt(0)}`;
        });

        // Calculate needed grid size (add 1 padding if possible, max maxGridSize)
        let neededHeight = maxRow - minRow + 1;
        let neededWidth = maxCol - minCol + 1;
        let finalGridSize = Math.max(neededHeight, neededWidth);

        // Ensure fit in requested specific size if possible, or expand
        finalGridSize = Math.max(finalGridSize, maxGridSize);
        // Usually standard sizes: 7, 9, 11

        return {
            id: levelId,
            gridSize: finalGridSize,
            difficulty,
            title,
            words: placedWords
        };
    }

    // Fallback empty (should not happen if data is robust)
    return {
        id: levelId,
        gridSize: maxGridSize,
        difficulty,
        title,
        words: []
    };
}

// ─── Helpers ───

function placeWordOnGrid(
    grid: (string | null)[][],
    word: string,
    val: number, // unused
    row: number,
    col: number,
    dir: 'across' | 'down'
) {
    if (dir === 'across') {
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
        }
    }
}

function findbestPlacement(grid: (string | null)[][], word: string, size: number) {
    // Find all potential intersections
    // We want to intersect with an existing character in the grid
    const possible: { row: number, col: number, dir: 'across' | 'down', score: number }[] = [];

    // Iterate over letters of the new word
    for (let i = 0; i < word.length; i++) {
        const char = word[i];

        // Scan grid for this char
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] === char) {
                    // Potential intersection at grid[r][c] with word[i]
                    // If existing is horizontal? we must be vertical
                    // Check if existing word at this cell is across or down.
                    // Actually simpler: try both directions, check validity.

                    // Try placing DOWN
                    // New word starts at row: r - i, col: c
                    if (canPlace(grid, word, r - i, c, 'down')) {
                        possible.push({ row: r - i, col: c, dir: 'down', score: 1 });
                    }

                    // Try placing ACROSS
                    // New word starts at row: r, col: c - i
                    if (canPlace(grid, word, r, c - i, 'across')) {
                        possible.push({ row: r, col: c - i, dir: 'across', score: 1 });
                    }
                }
            }
        }
    }

    // Shuffle and pick one? or pick first?
    if (possible.length > 0) {
        // Pick random one to vary layouts
        return possible[Math.floor(Math.random() * possible.length)];
    }
    return null;
}

function canPlace(grid: (string | null)[][], word: string, r: number, c: number, dir: 'across' | 'down'): boolean {
    const size = grid.length;
    if (r < 0 || c < 0) return false;
    if (dir === 'across') {
        if (c + word.length > size) return false;
        // Check neighbors
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const existing = grid[r][c + i];

            // cell occupied mismatch
            if (existing !== null && existing !== char) return false;

            // If cell is empty, we must ensure no neighbors perpendicular block it
            // (Standard crossword rule: no adjacent letters unless they form valid words)
            // Simplified: prevent parallel adjacent touching
            if (existing === null) {
                if (r > 0 && grid[r - 1][c + i] !== null) return false; // top neighbor
                if (r < size - 1 && grid[r + 1][c + i] !== null) return false; // bottom neighbor
            }
        }
        // Check ends (cells before and after word must be empty)
        if (c > 0 && grid[r][c - 1] !== null) return false;
        if (c + word.length < size && grid[r][c + word.length] !== null) return false;

    } else { // DOWN
        if (r + word.length > size) return false;
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const existing = grid[r + i][c];

            if (existing !== null && existing !== char) return false;

            if (existing === null) {
                if (c > 0 && grid[r + i][c - 1] !== null) return false; // left neighbor
                if (c < size - 1 && grid[r + i][c + 1] !== null) return false; // right neighbor
            }
        }
        if (r > 0 && grid[r - 1][c] !== null) return false;
        if (r + word.length < size && grid[r + word.length][c] !== null) return false;
    }
    return true;
}
