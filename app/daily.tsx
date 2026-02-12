import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDailyPuzzleStore } from '../src/store/useDailyPuzzleStore';
import { useEconomyStore, HINT_LETTER_COST, HINT_WORD_COST } from '../src/store/useEconomyStore';
import { useStatsStore } from '../src/store/useStatsStore';
import { onPuzzleCompleted, onCorrectWordEntered } from '../src/game/missionEvents';
import { useCrosswordGame } from '../src/game/useCrosswordGame';
import { DAILY_COIN_REWARD, DAILY_XP_REWARD } from '../src/data/dailyPuzzles';
import CrosswordGrid from '../src/components/CrosswordGrid';
import ClueList from '../src/components/ClueList';
import TurkishKeyboard from '../src/components/TurkishKeyboard';
import TopBar from '../src/components/TopBar';
import FeedbackPanel from '../src/components/ui/FeedbackPanel';
import { Word } from '../src/game/types';
import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { radius } from '../src/theme/radius';
import { typography } from '../src/theme/typography';

export default function DailyScreen() {
    const router = useRouter();
    const puzzle = useDailyPuzzleStore((s) => s.getTodayPuzzle)();
    const completedToday = useDailyPuzzleStore((s) => s.completedToday);
    const markCompleted = useDailyPuzzleStore((s) => s.markCompletedToday);
    const coins = useEconomyStore((s) => s.coins);
    const spendCoins = useEconomyStore((s) => s.spendCoins);
    const onStatsPuzzleComplete = useStatsStore((s) => s.onPuzzleComplete);

    const {
        state,
        selectCell,
        typeLetter,
        backspace,
        checkWord,
        revealHint,
        getSelectedWordCells,
        wordMap,
    } = useCrosswordGame(puzzle);

    const [shakeWord, setShakeWord] = useState(false);
    const [correctFlash, setCorrectFlash] = useState(false);
    const [navigated, setNavigated] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [rewardModalVisible, setRewardModalVisible] = useState(false);
    const [rewardData, setRewardData] = useState({ coins: 0, xp: 0 });
    const hintsUsedRef = useRef(0);
    const mistakesRef = useRef(0);
    const correctWordsRef = useRef(0);

    // Navigate on completion
    useEffect(() => {
        if (state.isComplete && !navigated) {
            setNavigated(true);

            // Award daily reward (only if not already completed)
            const reward = markCompleted();
            setRewardData(reward);

            // Track stats
            onStatsPuzzleComplete({
                timeSec: state.timeElapsed,
                mistakes: mistakesRef.current,
                correctWords: correctWordsRef.current,
                wrongWords: mistakesRef.current,
                isDaily: true,
            });

            // Mission events
            onPuzzleCompleted('easy', 3, hintsUsedRef.current, state.timeElapsed);

            // Success haptic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Show reward modal
            setTimeout(() => {
                setRewardModalVisible(true);
            }, 800);
        }
    }, [state.isComplete]);

    const handleCheck = useCallback(() => {
        const result = checkWord();
        if (result === 'correct') {
            setCorrectFlash(true);
            setFeedback('correct');
            correctWordsRef.current += 1;
            setTimeout(() => setCorrectFlash(false), 600);
            setTimeout(() => setFeedback(null), 2000);
            onCorrectWordEntered();
        } else if (result === 'wrong') {
            setShakeWord(true);
            setFeedback('wrong');
            mistakesRef.current += 1;
            setTimeout(() => setShakeWord(false), 400);
            setTimeout(() => setFeedback(null), 2000);
            // Haptic only — no blocking
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    }, [checkWord]);

    const handleHintPress = useCallback(() => {
        setHintModalVisible(true);
    }, []);

    const handleRevealLetter = useCallback(() => {
        if (!spendCoins(HINT_LETTER_COST)) {
            Alert.alert('Yetersiz Coin', `Harf görmek için ${HINT_LETTER_COST} coin gerekli.`);
            return;
        }
        revealHint();
        hintsUsedRef.current += 1;
        setHintModalVisible(false);
    }, [spendCoins, revealHint]);

    const handleRevealWord = useCallback(() => {
        if (!spendCoins(HINT_WORD_COST)) {
            Alert.alert('Yetersiz Coin', `Kelime görmek için ${HINT_WORD_COST} coin gerekli.`);
            return;
        }
        if (state.selectedWordId) {
            const word = wordMap.get(state.selectedWordId);
            if (word) {
                for (let i = 0; i < word.answer.length; i++) {
                    revealHint();
                }
            }
        }
        hintsUsedRef.current += 1;
        setHintModalVisible(false);
    }, [spendCoins, revealHint, state.selectedWordId, wordMap]);

    const handleSelectWord = useCallback(
        (word: Word) => {
            selectCell(word.startRow, word.startCol);
        },
        [selectCell]
    );

    const selectedWordCells = getSelectedWordCells();
    const shakeCell = shakeWord && selectedWordCells.length > 0 ? selectedWordCells[0] : null;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <TopBar
                levelId={0}
                timeElapsed={state.timeElapsed}
                score={state.score}
                coins={coins}
                onBack={() => router.replace('/')}
                totalWords={puzzle.words.length}
                completedWords={state.lockedWordIds.size}
            />

            <View style={styles.gridSection}>
                <CrosswordGrid
                    grid={state.grid}
                    gridSize={puzzle.gridSize}
                    selectedCell={state.selectedCell}
                    selectedWordCells={selectedWordCells}
                    onCellPress={selectCell}
                    shakeCell={shakeCell}
                    correctFlash={correctFlash}
                />
            </View>

            <View style={styles.clueSection}>
                <ClueList
                    words={puzzle.words}
                    selectedWordId={state.selectedWordId}
                    selectedDirection={state.selectedDirection}
                    lockedWordIds={state.lockedWordIds}
                    onSelectWord={handleSelectWord}
                />
            </View>

            <TurkishKeyboard
                onKeyPress={typeLetter}
                onBackspace={backspace}
                onCheck={handleCheck}
                onHint={handleHintPress}
                disabled={state.isComplete}
            />

            <FeedbackPanel type={feedback} />

            {/* ── Hint Modal ── */}
            <Modal
                visible={hintModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setHintModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setHintModalVisible(false)}
                >
                    <View style={styles.hintSheet}>
                        <View style={styles.hintHandle} />
                        <Text style={styles.hintSheetTitle}>İpucu Kullan</Text>
                        <Text style={styles.hintCoinDisplay}>🪙 {coins}</Text>

                        <TouchableOpacity style={styles.hintOption} onPress={handleRevealLetter}>
                            <View style={styles.hintOptionLeft}>
                                <Text style={styles.hintOptionEmoji}>🔤</Text>
                                <View>
                                    <Text style={styles.hintOptionTitle}>Harf Göster</Text>
                                    <Text style={styles.hintOptionDesc}>Seçili kelimedeki bir harfi aç</Text>
                                </View>
                            </View>
                            <View style={styles.hintCostBadge}>
                                <Text style={styles.hintCostText}>{HINT_LETTER_COST} 🪙</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.hintOption} onPress={handleRevealWord}>
                            <View style={styles.hintOptionLeft}>
                                <Text style={styles.hintOptionEmoji}>💡</Text>
                                <View>
                                    <Text style={styles.hintOptionTitle}>Kelime Göster</Text>
                                    <Text style={styles.hintOptionDesc}>Tüm kelimeyi aç</Text>
                                </View>
                            </View>
                            <View style={[styles.hintCostBadge, { backgroundColor: colors.accentDark }]}>
                                <Text style={styles.hintCostText}>{HINT_WORD_COST} 🪙</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setHintModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Reward Modal ── */}
            <Modal
                visible={rewardModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRewardModalVisible(false)}
            >
                <View style={styles.centeredOverlay}>
                    <View style={styles.centeredPanel}>
                        <Text style={styles.panelEmoji}>🎉</Text>
                        <Text style={styles.panelTitle}>Tebrikler!</Text>
                        <Text style={styles.panelDesc}>
                            Bugünün bulmacasını tamamladın!
                        </Text>
                        <View style={styles.rewardRow}>
                            <View style={styles.rewardItem}>
                                <Text style={styles.rewardValue}>+{rewardData.coins}</Text>
                                <Text style={styles.rewardLabel}>🪙 Coin</Text>
                            </View>
                            <View style={styles.rewardItem}>
                                <Text style={styles.rewardValue}>+{rewardData.xp}</Text>
                                <Text style={styles.rewardLabel}>✨ XP</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.okBtn}
                            onPress={() => {
                                setRewardModalVisible(false);
                                router.replace('/');
                            }}
                        >
                            <Text style={styles.okBtnText}>Tamam</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gridSection: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    clueSection: {
        flex: 1,
        marginHorizontal: spacing.md,
        marginBottom: spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.overlay,
    },
    hintSheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    hintHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    hintSheetTitle: {
        ...typography.h2,
        color: colors.text,
        textAlign: 'center',
    },
    hintCoinDisplay: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    hintOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardAlt,
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
    },
    hintOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    hintOptionEmoji: {
        fontSize: 24,
    },
    hintOptionTitle: {
        ...typography.h3,
        color: colors.text,
        fontSize: 15,
    },
    hintOptionDesc: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    hintCostBadge: {
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
    },
    hintCostText: {
        ...typography.label,
        fontWeight: '700',
        color: colors.text,
        fontSize: 13,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.xs,
    },
    cancelText: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    centeredOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.overlay,
    },
    centeredPanel: {
        backgroundColor: colors.surface,
        borderRadius: radius.xxl,
        padding: spacing.xl,
        marginHorizontal: spacing.lg,
        alignItems: 'center',
        width: '85%',
    },
    panelEmoji: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    panelTitle: {
        ...typography.h2,
        color: colors.text,
        textAlign: 'center',
    },
    panelDesc: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    rewardRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginBottom: spacing.lg,
    },
    rewardItem: {
        alignItems: 'center',
    },
    rewardValue: {
        ...typography.h2,
        color: colors.success,
        fontWeight: '800',
    },
    rewardLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    okBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: radius.full,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    okBtnText: {
        ...typography.label,
        color: colors.textInverse,
        fontWeight: '700',
        fontSize: 15,
    },
});
