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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { levels } from '../../src/levels/levels';
import { useCrosswordGame } from '../../src/game/useCrosswordGame';
import { useProgressStore } from '../../src/store/gameStore';
import { useGamificationStore } from '../../src/store/useGamificationStore';
import { useEconomyStore, HINT_LETTER_COST, HINT_WORD_COST } from '../../src/store/useEconomyStore';
import { useStatsStore } from '../../src/store/useStatsStore';
import { onPuzzleCompleted, onCorrectWordEntered } from '../../src/game/missionEvents';
import { computeStars, computeXP, computeCoins, mapDifficulty } from '../../src/utils/rewards';
import CrosswordGrid from '../../src/components/CrosswordGrid';
import ClueList from '../../src/components/ClueList';
import TurkishKeyboard from '../../src/components/TurkishKeyboard';
import TopBar from '../../src/components/TopBar';
import FeedbackPanel from '../../src/components/ui/FeedbackPanel';
import { Word } from '../../src/game/types';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const levelId = parseInt(id ?? '1', 10);
  const level = levels.find((l) => l.id === levelId) ?? levels[0];

  const {
    state,
    selectCell,
    typeLetter,
    backspace,
    checkWord,
    revealHint,
    getSelectedWordCells,
    wordMap,
  } = useCrosswordGame(level);

  const completeLevel = useProgressStore((s) => s.completeLevel);
  const coins = useEconomyStore((s) => s.coins);
  const spendCoins = useEconomyStore((s) => s.spendCoins);
  const onStatsPuzzleComplete = useStatsStore((s) => s.onPuzzleComplete);

  const [shakeWord, setShakeWord] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [navigated, setNavigated] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintModalVisible, setHintModalVisible] = useState(false);
  const hintsUsedRef = useRef(0);
  const mistakesRef = useRef(0);
  const correctWordsRef = useRef(0);
  const coinsSpentRef = useRef(0);

  const diff = mapDifficulty(level.difficulty);

  // Navigate to result on completion
  useEffect(() => {
    if (state.isComplete && !navigated) {
      setNavigated(true);

      // Compute rewards via centralized rewards util
      const stars = computeStars(hintsUsedRef.current, mistakesRef.current, state.timeElapsed, diff);
      const xpGained = computeXP(diff, stars, hintsUsedRef.current);
      const coinsEarned = computeCoins(diff, stars);

      // Persist best stars + time
      completeLevel(levelId, stars, state.timeElapsed, mistakesRef.current, hintsUsedRef.current);

      // Award coins
      useEconomyStore.getState().addCoins(coinsEarned);

      // Award XP
      const { levelUp } = useGamificationStore.getState().completePuzzle(
        diff,
        stars === 3
      );

      // Emit mission events
      onPuzzleCompleted(diff, 3, hintsUsedRef.current, state.timeElapsed);

      // Track stats
      onStatsPuzzleComplete({
        timeSec: state.timeElapsed,
        mistakes: mistakesRef.current,
        correctWords: correctWordsRef.current,
        wrongWords: mistakesRef.current,
        isDaily: false,
      });

      setTimeout(() => {
        router.replace(
          `/result/${levelId}?stars=${stars}&time=${state.timeElapsed}&score=${state.score}&xp=${xpGained}&levelUp=${levelUp}&coins=${coinsEarned}&hints=${hintsUsedRef.current}&mistakes=${mistakesRef.current}&coinsSpent=${coinsSpentRef.current}`
        );
      }, 1200);
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
      // Haptic only — no hearts or blocking
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [checkWord]);

  // ── Hint System ──
  const handleHintPress = useCallback(() => {
    setHintModalVisible(true);
  }, []);

  const handleRevealLetter = useCallback(() => {
    if (!spendCoins(HINT_LETTER_COST)) {
      setHintModalVisible(false);
      Alert.alert(
        'Yetersiz Coin',
        `Harf ipucu ${HINT_LETTER_COST} coin gerektirir.\nGünlük görevleri tamamlayarak coin kazan!`
      );
      return;
    }
    revealHint();
    hintsUsedRef.current += 1;
    coinsSpentRef.current += HINT_LETTER_COST;
    setHintModalVisible(false);
  }, [spendCoins, revealHint]);

  const handleRevealWord = useCallback(() => {
    if (!spendCoins(HINT_WORD_COST)) {
      setHintModalVisible(false);
      Alert.alert(
        'Yetersiz Coin',
        `Kelime ipucu ${HINT_WORD_COST} coin gerektirir.\nGünlük görevleri tamamlayarak coin kazan!`
      );
      return;
    }

    // Reveal all cells in the selected word
    if (state.selectedWordId) {
      const word = wordMap.get(state.selectedWordId);
      if (word) {
        for (let i = 0; i < word.answer.length; i++) {
          revealHint();
        }
      }
    }
    hintsUsedRef.current += 1;
    coinsSpentRef.current += HINT_WORD_COST;
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
        levelId={levelId}
        timeElapsed={state.timeElapsed}
        score={state.score}
        coins={coins}
        onBack={() => router.replace('/')}
        totalWords={level.words.length}
        completedWords={state.lockedWordIds.size}
      />

      <View style={styles.gridSection}>
        <CrosswordGrid
          grid={state.grid}
          gridSize={level.gridSize}
          selectedCell={state.selectedCell}
          selectedWordCells={selectedWordCells}
          onCellPress={selectCell}
          shakeCell={shakeCell}
          correctFlash={correctFlash}
        />
      </View>

      <View style={styles.clueSection}>
        <ClueList
          words={level.words}
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

      {/* Feedback overlay */}
      <FeedbackPanel type={feedback} />

      {/* ── Hint Bottom Sheet Modal ── */}
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

            <TouchableOpacity
              style={styles.hintOption}
              onPress={handleRevealLetter}
            >
              <View style={styles.hintOptionLeft}>
                <Text style={styles.hintOptionEmoji}>🔤</Text>
                <View>
                  <Text style={styles.hintOptionTitle}>Harf Göster</Text>
                  <Text style={styles.hintOptionDesc}>
                    Seçili kelimedeki bir harfi aç
                  </Text>
                </View>
              </View>
              <View style={styles.hintCostBadge}>
                <Text style={styles.hintCostText}>{HINT_LETTER_COST} 🪙</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hintOption}
              onPress={handleRevealWord}
            >
              <View style={styles.hintOptionLeft}>
                <Text style={styles.hintOptionEmoji}>💡</Text>
                <View>
                  <Text style={styles.hintOptionTitle}>Kelimeyi Göster</Text>
                  <Text style={styles.hintOptionDesc}>
                    Tüm kelimeyi aç
                  </Text>
                </View>
              </View>
              <View style={[styles.hintCostBadge, { backgroundColor: colors.accentDark }]}>
                <Text style={styles.hintCostText}>{HINT_WORD_COST} 🪙</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.hintWarning}>
              <Text style={styles.hintWarningText}>
                ⚠️ İpucu kullanmak yıldız sayısını düşürür
              </Text>
            </View>

            <TouchableOpacity
              style={styles.hintCancel}
              onPress={() => setHintModalVisible(false)}
            >
              <Text style={styles.hintCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F3FA',
  },
  gridSection: {
    alignItems: 'center',
  },
  clueSection: {
    flex: 1,
    marginHorizontal: spacing.sm,
    marginBottom: 4,
  },
  // ── Hint Modal ──
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
  hintWarning: {
    backgroundColor: colors.accent + '15',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  hintWarningText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  hintCancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  hintCancelText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
