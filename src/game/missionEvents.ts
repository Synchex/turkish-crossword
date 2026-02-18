import { useMissionsStore } from '../store/useMissionsStore';

/**
 * Call when a puzzle is fully completed.
 */
export function onPuzzleCompleted(
    difficulty: string,
    mistakes: number,
    hintsUsed: number,
    timeSeconds: number,
    xpEarned: number
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
}

/**
 * Call each time a correct word is entered.
 */
export function onCorrectWordEntered() {
    useMissionsStore.getState().updateProgress('ENTER_CORRECT_WORDS', 1);
}
