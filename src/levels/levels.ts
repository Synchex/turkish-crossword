import { LevelData } from '../game/types';
import { generateLevelData } from '../utils/gridGenerator';
import { getQuestionsForLevel, getQuestionsByDifficulty } from '../utils/questionLoader';

// Define the structure for our levels
const LEVEL_SPECS = [
  { id: 1, size: 7, difficulty: 'Kolay', title: 'Başlangıç' },
  { id: 2, size: 7, difficulty: 'Kolay', title: 'Isınma' },
  { id: 3, size: 7, difficulty: 'Kolay', title: 'Harfler' },
  { id: 4, size: 8, difficulty: 'Orta', title: 'Kelime Avı' },
  { id: 5, size: 8, difficulty: 'Orta', title: 'Keşif' },
  { id: 6, size: 8, difficulty: 'Orta', title: 'Zihin Jimnastiği' },
  { id: 7, size: 9, difficulty: 'Orta', title: 'Meydan Okuma' },
  { id: 8, size: 9, difficulty: 'Orta', title: 'Bilgi Küpü' },
  { id: 9, size: 9, difficulty: 'Orta', title: 'Ustalık Yolu' },
  { id: 10, size: 10, difficulty: 'Zor', title: 'Kelime Üstadı' },
  { id: 11, size: 10, difficulty: 'Zor', title: 'Zorlu Yarış' },
  { id: 12, size: 10, difficulty: 'Zor', title: 'Efsane' },
  { id: 13, size: 10, difficulty: 'Zor', title: 'Akıl Oyunları' },
  { id: 14, size: 11, difficulty: 'Zor', title: 'Büyük Final' },
  { id: 15, size: 11, difficulty: 'Zor', title: 'Zirve' },
  // Can extend easily
] as const;

// Generate levels dynamically
export const levels: LevelData[] = LEVEL_SPECS.map(spec => {
  // Determine question difficulty based on level difficulty
  let qDiff: 'easy' | 'medium' | 'hard' = 'easy';
  if (spec.difficulty === 'Orta') qDiff = 'medium';
  if (spec.difficulty === 'Zor') qDiff = 'hard';

  // Fetch ample questions to allow the generator options
  // We fetch 12 questions, trying to fit maybe 6-8 words
  const questions = getQuestionsByDifficulty(qDiff, 15);

  // If we have specific level-tagged questions we could use getQuestionsForLevel(spec.id)
  // but for now generic pool is safer.

  return generateLevelData(
    spec.id,
    spec.title,
    spec.difficulty,
    questions,
    spec.size
  );
});
