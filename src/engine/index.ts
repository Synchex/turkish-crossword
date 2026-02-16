/**
 * Crossword Generation Engine — Public API
 *
 * Usage:
 *   import { initializeEngine, generatePuzzle, toLevelData } from '../engine';
 *
 *   // At app startup:
 *   initializeEngine(questionsData);
 *
 *   // Generate a puzzle:
 *   const puzzle = generatePuzzle({ level: 5, seed: 12345 });
 *   const levelData = toLevelData(puzzle);
 */

export { initializeEngine, generatePuzzle, toLevelData } from './generatePuzzle';
export type { GenerateOptions } from './generatePuzzle';
export type { GeneratedPuzzle, GeneratedWord, DifficultyConfig } from './types';
export { SeededRandom, dailySeed } from './seededRandom';
export { buildWordIndex } from './wordIndex';
export type { WordIndex } from './wordIndex';
export { getDifficultyConfig, scorePuzzle, computeMetrics } from './difficultyScorer';
export { getAllTemplates, getTemplatesBySize, extractSlots } from './templates';
