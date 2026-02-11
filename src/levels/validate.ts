// Validation helper - run to verify all level intersections
import { LevelData, Word } from '../game/types';

function getCells(word: Word): Array<{ row: number; col: number; letter: string }> {
  const cells: Array<{ row: number; col: number; letter: string }> = [];
  for (let i = 0; i < word.answer.length; i++) {
    const row = word.direction === 'down' ? word.startRow + i : word.startRow;
    const col = word.direction === 'across' ? word.startCol + i : word.startCol;
    cells.push({ row, col, letter: word.answer[i] });
  }
  return cells;
}

export function validateLevel(level: LevelData): string[] {
  const errors: string[] = [];
  const grid: Map<string, { letter: string; wordId: string }> = new Map();

  for (const word of level.words) {
    const cells = getCells(word);
    for (const cell of cells) {
      const key = `${cell.row},${cell.col}`;
      if (cell.row >= level.gridSize || cell.col >= level.gridSize) {
        errors.push(`Level ${level.id}: Word "${word.id}" goes outside grid at (${cell.row},${cell.col})`);
      }
      const existing = grid.get(key);
      if (existing && existing.letter !== cell.letter) {
        errors.push(
          `Level ${level.id}: Conflict at (${cell.row},${cell.col}): ` +
          `"${existing.wordId}" has "${existing.letter}", "${word.id}" has "${cell.letter}"`
        );
      }
      grid.set(key, { letter: cell.letter, wordId: word.id });
    }
  }
  return errors;
}
