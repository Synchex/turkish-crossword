import { getContinueLevelId } from './continueLevel';
import { LevelProgress } from '../game/types';

function makeLevelProgress(
    overrides: Partial<LevelProgress> & { levelId: number },
): LevelProgress {
    return {
        unlocked: true,
        completed: false,
        status: 'not_started',
        updatedAt: 0,
        stars: 0,
        bestTime: 0,
        bestMistakes: 999,
        bestHintsUsed: 999,
        ...overrides,
    };
}

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

/**
 * Sanity tests for getContinueLevelId.
 * Run in dev by importing and calling runContinueLevelTests().
 */
export function runContinueLevelTests(): void {
    console.log('\n══ getContinueLevelId Tests ══\n');

    // Test A: Level 2 in_progress (newer updatedAt) → should return 2
    {
        const progress: LevelProgress[] = [
            makeLevelProgress({ levelId: 1, completed: true, status: 'completed', updatedAt: 1000 }),
            makeLevelProgress({ levelId: 2, status: 'in_progress', updatedAt: 5000 }),
            makeLevelProgress({ levelId: 3, status: 'in_progress', updatedAt: 3000 }),
            makeLevelProgress({ levelId: 4 }),
        ];
        const result = getContinueLevelId(progress);
        assert(result === 2, `A) in_progress latest → Level 2 (got ${result})`);
    }

    // Test B: Levels 1-2 completed, Level 3 unlocked not_started → should return 3
    {
        const progress: LevelProgress[] = [
            makeLevelProgress({ levelId: 1, completed: true, status: 'completed', updatedAt: 1000 }),
            makeLevelProgress({ levelId: 2, completed: true, status: 'completed', updatedAt: 2000 }),
            makeLevelProgress({ levelId: 3, unlocked: true, status: 'not_started' }),
            makeLevelProgress({ levelId: 4, unlocked: false, status: 'not_started' }),
        ];
        const result = getContinueLevelId(progress);
        assert(result === 3, `B) first unlocked not completed → Level 3 (got ${result})`);
    }

    // Test C: No progress at all → should return 1
    {
        const progress: LevelProgress[] = [
            makeLevelProgress({ levelId: 1 }),
            makeLevelProgress({ levelId: 2, unlocked: false }),
            makeLevelProgress({ levelId: 3, unlocked: false }),
        ];
        const result = getContinueLevelId(progress);
        assert(result === 1, `C) empty progress → Level 1 (got ${result})`);
    }

    // Test D: DEV mode — all unlocked, levels 1-2 completed → should return 3
    {
        const progress: LevelProgress[] = [
            makeLevelProgress({ levelId: 1, unlocked: true, completed: true, status: 'completed' }),
            makeLevelProgress({ levelId: 2, unlocked: true, completed: true, status: 'completed' }),
            makeLevelProgress({ levelId: 3, unlocked: true }),
            makeLevelProgress({ levelId: 4, unlocked: true }),
            makeLevelProgress({ levelId: 5, unlocked: true }),
        ];
        const result = getContinueLevelId(progress);
        assert(result === 3, `D) DEV all-unlocked, 1-2 done → Level 3 (got ${result})`);
    }

    console.log('\n══ Tests Complete ══\n');
}
