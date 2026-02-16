import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    Puzzle,
    Entry,
    GameCell,
    CengelGameState,
} from './types';
import { initPuzzle, findEntriesForCell, findEntryForCellInDirection, getCellIndexInEntry, calculateStars } from './gridUtils';

/**
 * Core game hook for Çengel Bulmaca.
 * Manages cell selection, direction toggling, letter input, word checking,
 * hints, and completion state.
 */
export function useCengelGame(puzzle: Puzzle) {
    const { gameGrid: initialGrid, entries } = useMemo(() => initPuzzle(puzzle), [puzzle]);

    const [state, setState] = useState<CengelGameState>(() => ({
        gameGrid: initialGrid,
        entries,
        selectedCell: null,
        activeEntryId: null,
        activeDirection: 'across',
        timeElapsed: 0,
        isComplete: false,
        lockedEntryIds: new Set(),
        hintsUsed: 0,
    }));

    // Timer
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setState((s) =>
                s.isComplete ? s : { ...s, timeElapsed: s.timeElapsed + 1 },
            );
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ── Select cell ──
    const selectCell = useCallback(
        (row: number, col: number) => {
            setState((s) => {
                const cell = s.gameGrid[row]?.[col];
                if (!cell || cell.type !== 'LETTER') return s;

                // Same cell tapped → toggle direction
                if (s.selectedCell?.row === row && s.selectedCell?.col === col) {
                    const otherDir = s.activeDirection === 'across' ? 'down' : 'across';
                    const otherEntry = findEntryForCellInDirection(row, col, otherDir, s.entries);
                    if (otherEntry) {
                        return {
                            ...s,
                            activeDirection: otherDir,
                            activeEntryId: otherEntry.id,
                        };
                    }
                    return s;
                }

                // New cell: prefer current direction, fallback to other
                let entry = findEntryForCellInDirection(row, col, s.activeDirection, s.entries);
                let dir = s.activeDirection;
                if (!entry) {
                    dir = dir === 'across' ? 'down' : 'across';
                    entry = findEntryForCellInDirection(row, col, dir, s.entries);
                }

                return {
                    ...s,
                    selectedCell: { row, col },
                    activeEntryId: entry?.id ?? null,
                    activeDirection: dir,
                };
            });
        },
        [],
    );

    // ── Type letter ──
    const typeLetter = useCallback(
        (letter: string) => {
            setState((s) => {
                if (!s.selectedCell || !s.activeEntryId) return s;
                const entry = s.entries.find((e) => e.id === s.activeEntryId);
                if (!entry) return s;
                if (s.lockedEntryIds.has(s.activeEntryId)) return s;

                const { row, col } = s.selectedCell;
                const cell = s.gameGrid[row][col];
                if (cell.type !== 'LETTER' || cell.isLocked) return s;

                // Update grid
                const newGrid = s.gameGrid.map((r) => r.map((c) => ({ ...c })));
                newGrid[row][col].userLetter = letter.toUpperCase();

                // Advance to next unfilled cell in entry
                const idx = getCellIndexInEntry(row, col, entry);
                let nextCell = s.selectedCell;
                for (let i = idx + 1; i < entry.cells.length; i++) {
                    const nc = entry.cells[i];
                    const ncData = newGrid[nc.row][nc.col];
                    if (ncData.type === 'LETTER' && !ncData.isLocked) {
                        nextCell = { row: nc.row, col: nc.col };
                        break;
                    }
                }

                return { ...s, gameGrid: newGrid, selectedCell: nextCell };
            });
        },
        [],
    );

    // ── Backspace ──
    const backspace = useCallback(() => {
        setState((s) => {
            if (!s.selectedCell || !s.activeEntryId) return s;
            const entry = s.entries.find((e) => e.id === s.activeEntryId);
            if (!entry) return s;
            if (s.lockedEntryIds.has(s.activeEntryId)) return s;

            const { row, col } = s.selectedCell;
            const newGrid = s.gameGrid.map((r) => r.map((c) => ({ ...c })));
            const cell = newGrid[row][col];

            if (cell.type === 'LETTER' && cell.userLetter) {
                cell.userLetter = '';
                return { ...s, gameGrid: newGrid };
            }

            // Move backward in entry
            const idx = getCellIndexInEntry(row, col, entry);
            if (idx > 0) {
                const prev = entry.cells[idx - 1];
                const prevCell = newGrid[prev.row][prev.col];
                if (prevCell.type === 'LETTER' && !prevCell.isLocked) {
                    prevCell.userLetter = '';
                    return {
                        ...s,
                        gameGrid: newGrid,
                        selectedCell: { row: prev.row, col: prev.col },
                    };
                }
            }
            return { ...s, gameGrid: newGrid };
        });
    }, []);

    // ── Check word ──
    const checkWord = useCallback((): 'correct' | 'wrong' | null => {
        let result: 'correct' | 'wrong' | null = null;
        setState((s) => {
            if (!s.activeEntryId) return s;
            const entry = s.entries.find((e) => e.id === s.activeEntryId);
            if (!entry || s.lockedEntryIds.has(s.activeEntryId)) return s;

            const userAnswer = entry.cells
                .map((c) => {
                    const cell = s.gameGrid[c.row][c.col];
                    return cell.type === 'LETTER' ? (cell.userLetter ?? '') : '';
                })
                .join('');

            if (userAnswer.length < entry.length) {
                result = 'wrong';
                return s;
            }

            if (userAnswer === entry.solution) {
                result = 'correct';
                const newGrid = s.gameGrid.map((r) => r.map((c) => ({ ...c })));
                entry.cells.forEach((c) => {
                    const cell = newGrid[c.row][c.col];
                    if (cell.type === 'LETTER') cell.isLocked = true;
                });
                const newLocked = new Set(s.lockedEntryIds);
                newLocked.add(s.activeEntryId!);
                const isComplete = s.entries.every((e) => newLocked.has(e.id));
                return {
                    ...s,
                    gameGrid: newGrid,
                    lockedEntryIds: newLocked,
                    isComplete,
                };
            }

            result = 'wrong';
            return s;
        });
        return result;
    }, []);

    // ── Reveal hint (active entry) ──
    const revealHint = useCallback((): boolean => {
        let revealed = false;
        setState((s) => {
            if (!s.activeEntryId) return s;
            const entry = s.entries.find((e) => e.id === s.activeEntryId);
            if (!entry || s.lockedEntryIds.has(s.activeEntryId)) return s;

            const newGrid = s.gameGrid.map((r) => r.map((c) => ({ ...c })));
            for (const c of entry.cells) {
                const cell = newGrid[c.row][c.col];
                if (
                    cell.type === 'LETTER' &&
                    !cell.isLocked &&
                    cell.userLetter !== cell.solution
                ) {
                    cell.userLetter = cell.solution;
                    cell.isRevealed = true;
                    revealed = true;
                    break;
                }
            }

            return {
                ...s,
                gameGrid: newGrid,
                hintsUsed: revealed ? s.hintsUsed + 1 : s.hintsUsed,
            };
        });
        return revealed;
    }, []);

    // ── Reveal random hint (any empty cell on the grid) ──
    const revealRandomHint = useCallback((): { row: number; col: number } | null => {
        let result: { row: number; col: number } | null = null;
        setState((s) => {
            // Collect all empty LETTER cells
            const candidates: { row: number; col: number }[] = [];
            for (let r = 0; r < s.gameGrid.length; r++) {
                for (let c = 0; c < s.gameGrid[r].length; c++) {
                    const cell = s.gameGrid[r][c];
                    if (
                        cell.type === 'LETTER' &&
                        !cell.isLocked &&
                        !cell.isRevealed &&
                        (!cell.userLetter || cell.userLetter === '')
                    ) {
                        candidates.push({ row: r, col: c });
                    }
                }
            }

            if (candidates.length === 0) {
                result = null;
                return s;
            }

            // Random pick
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            result = pick;

            const newGrid = s.gameGrid.map((r) => r.map((c) => ({ ...c })));
            const cell = newGrid[pick.row][pick.col];
            if (cell.type === 'LETTER') {
                cell.userLetter = cell.solution;
                cell.isRevealed = true;
            }

            // Auto-lock any entries that are now fully correct
            const newLocked = new Set(s.lockedEntryIds);
            for (const entry of s.entries) {
                if (newLocked.has(entry.id)) continue;
                const word = entry.cells
                    .map((ec) => {
                        const gc = newGrid[ec.row][ec.col];
                        return gc.type === 'LETTER' ? (gc.userLetter ?? '') : '';
                    })
                    .join('');
                if (word === entry.solution) {
                    newLocked.add(entry.id);
                    entry.cells.forEach((ec) => {
                        const gc = newGrid[ec.row][ec.col];
                        if (gc.type === 'LETTER') gc.isLocked = true;
                    });
                }
            }

            const isComplete = s.entries.every((e) => newLocked.has(e.id));

            // Select the revealed cell and activate its entry (prefer across)
            let entryForCell = findEntryForCellInDirection(pick.row, pick.col, 'across', s.entries);
            let dir: 'across' | 'down' = 'across';
            if (!entryForCell) {
                entryForCell = findEntryForCellInDirection(pick.row, pick.col, 'down', s.entries);
                dir = 'down';
            }

            return {
                ...s,
                gameGrid: newGrid,
                selectedCell: pick,
                activeEntryId: entryForCell?.id ?? s.activeEntryId,
                activeDirection: entryForCell ? dir : s.activeDirection,
                lockedEntryIds: newLocked,
                isComplete,
                hintsUsed: s.hintsUsed + 1,
            };
        });
        return result;
    }, []);

    // ── Active entry cells ──
    const activeEntryCells = useMemo(() => {
        if (!state.activeEntryId) return [];
        const entry = state.entries.find((e) => e.id === state.activeEntryId);
        return entry?.cells ?? [];
    }, [state.activeEntryId, state.entries]);

    // ── Active entry info ──
    const activeEntry = useMemo(() => {
        if (!state.activeEntryId) return null;
        return state.entries.find((e) => e.id === state.activeEntryId) ?? null;
    }, [state.activeEntryId, state.entries]);

    // ── Stars ──
    const getStars = useCallback(() => {
        return calculateStars(state.hintsUsed);
    }, [state.hintsUsed]);

    return {
        state,
        selectCell,
        typeLetter,
        backspace,
        checkWord,
        revealHint,
        revealRandomHint,
        activeEntryCells,
        activeEntry,
        getStars,
        entries,
    };
}
