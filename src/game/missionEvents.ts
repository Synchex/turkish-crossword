import { useMissionsStore } from '../store/useMissionsStore';
import { useAchievementsStore, checkStreakAchievements } from '../store/useAchievementsStore';
import { useStatsStore } from '../store/useStatsStore';

/**
 * Call when a puzzle is fully completed.
 */
export function onPuzzleCompleted(
    difficulty: string,
    mistakes: number,
    hintsUsed: number,
    timeSeconds: number,
    xpEarned: number,
    isDaily: boolean = false,
) {
    const update = useMissionsStore.getState().updateProgress;

    // SOLVE_PUZZLES — always counts
    update('SOLVE_PUZZLES', 1);

    // SOLVE_WITHOUT_HINTS — only if no hints used
    if (hintsUsed === 0) {
        update('SOLVE_WITHOUT_HINTS', 1);
    }

    // NO_MISTAKES_RUN — only if 0 mistakes
    if (mistakes === 0) {
        update('NO_MISTAKES_RUN', 1);
    }

    // FINISH_UNDER_TIME — under 180 seconds
    if (timeSeconds <= 180) {
        update('FINISH_UNDER_TIME', 1);
    }

    // SOLVE_MEDIUM — only medium+ difficulty
    if (difficulty === 'medium' || difficulty === 'hard' || difficulty === 'Orta' || difficulty === 'Zor') {
        update('SOLVE_MEDIUM', 1);
    }

    // EARN_XP — track XP earned
    if (xpEarned > 0) {
        update('EARN_XP', xpEarned);
    }

    // ── Achievement tracking ──
    const ach = useAchievementsStore.getState();

    // Puzzle count achievements
    ach.updateProgress('first_step', 1);
    ach.updateProgress('warmup', 1);
    ach.updateProgress('marathon', 1);
    ach.updateProgress('century', 1);

    // World explorer (same counter as puzzle count, target is 10)
    ach.updateProgress('world_explorer', 1);

    // Daily fan
    if (isDaily) {
        ach.updateProgress('daily_fan', 1);
    }

    // Accuracy achievements
    if (mistakes === 0) {
        ach.updateProgress('perfect', 1);
        ach.updateProgress('perfectionist', 1);
    }

    // Compute accuracy for this puzzle
    const stats = useStatsStore.getState();
    const totalAttempts = stats.totalCorrectWords + stats.totalWrongWords;
    const accuracy = totalAttempts > 0 ? (stats.totalCorrectWords / totalAttempts) * 100 : 100;
    if (accuracy >= 90) {
        ach.updateProgress('sharp_mind', 1);
    }

    // Speed achievements
    if (timeSeconds <= 60) {
        ach.updateProgress('speed_demon', 1);
    }
    if (timeSeconds <= 30) {
        ach.updateProgress('lightning', 1);
    }

    // Hint-free achievement
    if (hintsUsed === 0) {
        ach.updateProgress('saver', 1);
    }

    // Last second (hidden) — needs timer remaining info
    // This would need remaining time, not elapsed. Skip for now unless caller provides it.
}

/**
 * Call each time a correct word is entered.
 */
export function onCorrectWordEntered() {
    useMissionsStore.getState().updateProgress('ENTER_CORRECT_WORDS', 1);
}

/**
 * Call each time a hint is used.
 */
export function onHintUsed() {
    useAchievementsStore.getState().updateProgress('hint_collector', 1);
}

/**
 * Call when coins are spent.
 */
export function onCoinsSpent(amount: number) {
    useAchievementsStore.getState().updateProgress('big_spender', amount);
}

