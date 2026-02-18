import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { getPuzzleById } from '../../src/cengel/puzzles/index';
import { useCengelGame } from '../../src/cengel/useCengelGame';
import { findEntriesForCell } from '../../src/cengel/gridUtils';
import CengelGrid from '../../src/components/CengelGrid';
import ClueBar from '../../src/components/ClueBar';
import CengelClueList from '../../src/components/CengelClueList';
import { Entry } from '../../src/cengel/types';
import TurkishKeyboard from '../../src/components/TurkishKeyboard';
import TopBar from '../../src/components/TopBar';
import FeedbackPanel from '../../src/components/ui/FeedbackPanel';
import { useEconomyStore, HINT_LETTER_COST } from '../../src/store/useEconomyStore';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

// ── Old imports for legacy modes ──
import { levels } from '../../src/levels/levels';
import { useCrosswordGame } from '../../src/game/useCrosswordGame';
import { useProgressStore } from '../../src/store/gameStore';
import { useGamificationStore } from '../../src/store/useGamificationStore';
import { useStatsStore } from '../../src/store/useStatsStore';
import { useGeneratorStore } from '../../src/store/useGeneratorStore';
import { useBigPuzzleStore } from '../../src/store/useBigPuzzleStore';
import { onPuzzleCompleted, onCorrectWordEntered } from '../../src/game/missionEvents';
import { computeStars, calculateXP, computeCoins, mapDifficulty } from '../../src/utils/rewards';
import CrosswordGrid from '../../src/components/CrosswordGrid';
import ClueList from '../../src/components/ClueList';
import CluePopover from '../../src/components/CluePopover';
import { Word, LevelData } from '../../src/game/types';
import { buildStartCellMap } from '../../src/utils/crosswordHelpers';
import { useLeagueStore } from '../../src/store/useLeagueStore';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Detect çengel mode: puzzle IDs start with "ch"
  const isCengelMode = id?.startsWith('ch') ?? false;

  if (isCengelMode) {
    return <CengelGameScreen puzzleId={id!} />;
  }

  // Legacy mode — keep old game screen behavior
  return <LegacyGameScreen id={id ?? '1'} />;
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CengelGameScreen({ puzzleId }: { puzzleId: string }) {
  const router = useRouter();
  const puzzle = useMemo(() => getPuzzleById(puzzleId), [puzzleId]);

  if (!puzzle) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Bulmaca bulunamadı: {puzzleId}</Text>
      </SafeAreaView>
    );
  }

  const {
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
  } = useCengelGame(puzzle);

  const coins = useEconomyStore((s) => s.coins);
  const spendCoins = useEconomyStore((s) => s.spendCoins);

  const [isSolving, setIsSolving] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [navigated, setNavigated] = useState(false);
  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const coinsSpentRef = useRef(0);

  // Derived: should keyboard and solving UI be shown?
  const shouldShowKeyboard = isSolving && activeEntry != null;

  // Can we toggle direction at selected cell?
  const canToggle = useMemo(() => {
    if (!state.selectedCell) return false;
    const cellEntries = findEntriesForCell(
      state.selectedCell.row,
      state.selectedCell.col,
      entries,
    );
    return cellEntries.length > 1;
  }, [state.selectedCell, entries]);

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Enter solving mode ──
  const enterSolvingMode = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSolving(true);
  }, []);

  // ── Exit solving mode ──
  const exitSolvingMode = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSolving(false);
  }, []);

  // ── Cell tap: auto-enter solving mode ──
  const handleCellPress = useCallback(
    (row: number, col: number) => {
      selectCell(row, col);
      if (!isSolving) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSolving(true);
      }
    },
    [selectCell, isSolving],
  );

  // ── Completion ──
  useEffect(() => {
    if (state.isComplete && !navigated) {
      setNavigated(true);
      setIsSolving(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Calculate rewards
      const stars = computeStars(state.hintsUsed, 0, state.timeElapsed, 'medium');
      const xpResult = calculateXP({
        isBigPuzzle: true,
        timeSec: state.timeElapsed,
        mistakes: 0,
        letterHints: state.hintsUsed,
        clueHints: 0,
      });
      const coinsEarned = computeCoins(stars, true);

      // Update stores
      useEconomyStore.getState().addCoins(coinsEarned);
      const gamResult = useGamificationStore.getState().addXP(xpResult.totalXP);
      useGamificationStore.getState().recordPuzzleCompletion();
      if (gamResult.levelUp) {
        useEconomyStore.getState().awardLevelUp();
      }
      onPuzzleCompleted('medium', 0, state.hintsUsed, state.timeElapsed, xpResult.totalXP);
      useStatsStore.getState().onPuzzleComplete({
        timeSec: state.timeElapsed,
        mistakes: 0,
        correctWords: entries.length,
        wrongWords: 0,
        isDaily: false,
      });

      // League rank
      const weeklyXP = useGamificationStore.getState().weeklyXP;
      const leagueRank = useLeagueStore.getState().getRank(weeklyXP);

      setTimeout(() => {
        router.replace(
          `/result/ch-${puzzleId}?stars=${stars}&time=${state.timeElapsed}&score=0&xp=${xpResult.totalXP}&coins=${coinsEarned}&hints=${state.hintsUsed}&mistakes=0&coinsSpent=${coinsSpentRef.current}&perfect=${xpResult.isPerfect ? '1' : '0'}&levelUp=${gamResult.levelUp ? 'true' : 'false'}&newLevel=${gamResult.newLevel}&leagueRank=${leagueRank}`,
        );
      }, 1200);
    }
  }, [state.isComplete]);

  // ── Check ──
  const handleCheck = useCallback(() => {
    const result = checkWord();
    if (result === 'correct') {
      setCorrectFlash(true);
      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setCorrectFlash(false), 600);
      setTimeout(() => setFeedback(null), 2000);
    } else if (result === 'wrong') {
      setFeedback('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setFeedback(null), 2000);
    }
    // Exit solving mode after check
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSolving(false);
  }, [checkWord]);

  // ── Hints ──
  const handleHintPress = useCallback(() => setHintModalVisible(true), []);
  const handleRevealLetter = useCallback(() => {
    if (!spendCoins(HINT_LETTER_COST)) {
      setHintModalVisible(false);
      Alert.alert('Yetersiz Coin', `İpucu ${HINT_LETTER_COST} coin gerektirir.`);
      return;
    }
    revealHint();
    coinsSpentRef.current += HINT_LETTER_COST;
    setHintModalVisible(false);
  }, [spendCoins, revealHint]);

  // ── Toggle direction ──
  const handleToggle = useCallback(() => {
    if (state.selectedCell) {
      selectCell(state.selectedCell.row, state.selectedCell.col);
    }
  }, [state.selectedCell, selectCell]);

  // ── Select entry from clue list ──
  const handleSelectEntry = useCallback(
    (entry: Entry) => {
      if (entry.cells.length > 0) {
        selectCell(entry.cells[0].row, entry.cells[0].col);
        if (!isSolving) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsSolving(true);
        }
      }
    },
    [selectCell, isSolving],
  );

  // ── Random hint: reveal one random empty cell (full cost) ──
  const handleRandomHint = useCallback(() => {
    if (!spendCoins(HINT_LETTER_COST)) {
      Alert.alert('Yetersiz Coin', `Rastgele ipucu ${HINT_LETTER_COST} coin gerektirir.`);
      return;
    }
    const revealed = revealRandomHint();
    if (!revealed) {
      setToast('Açılacak harf kalmadı!');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSolving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast(`1 harf açıldı (-${HINT_LETTER_COST} coin)`);
    setTimeout(() => setToast(null), 2000);
  }, [revealRandomHint, spendCoins]);

  // ── Random letter: cheaper single-letter reveal ──
  const RANDOM_LETTER_COST = 3;
  const handleRandomLetter = useCallback(() => {
    if (!spendCoins(RANDOM_LETTER_COST)) {
      Alert.alert('Yetersiz Coin', `Random harf ${RANDOM_LETTER_COST} coin gerektirir.`);
      return;
    }
    const revealed = revealRandomHint();
    if (!revealed) {
      setToast('Açılacak harf kalmadı!');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSolving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setToast(`1 harf açıldı (-${RANDOM_LETTER_COST} coin)`);
    setTimeout(() => setToast(null), 2000);
  }, [revealRandomHint, spendCoins]);

  // Progress bar
  const totalEntries = entries.length;
  const lockedCount = state.lockedEntryIds.size;
  const progress = totalEntries > 0 ? lockedCount / totalEntries : 0;

  return (
    <Pressable style={{ flex: 1 }} onPress={isSolving ? exitSolvingMode : undefined}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{puzzle.title}</Text>
            <Text style={styles.headerSub}>
              {formatTime(state.timeElapsed)} · {lockedCount}/{totalEntries}
            </Text>
          </View>
          <TouchableOpacity onPress={handleHintPress} style={styles.hintBtn}>
            <Ionicons name="bulb-outline" size={20} color={colors.accent} />
            <Text style={styles.coinText}>{coins}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Progress bar ── */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        {/* ── Clue Bar (only when solving) ── */}
        {shouldShowKeyboard ? (
          <View style={styles.clueBarWrapper}>
            <ClueBar entry={activeEntry} canToggle={canToggle} onToggle={handleToggle} />
            <TouchableOpacity onPress={exitSolvingMode} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.hintRow}>
            <TouchableOpacity
              style={styles.randomHintBtn}
              activeOpacity={0.75}
              onPress={handleRandomHint}
            >
              <Ionicons name="dice-outline" size={18} color={colors.primary} />
              <Text style={styles.randomHintText}>Rastgele İpucu</Text>
              <View style={styles.costBadge}>
                <Text style={styles.costBadgeText}>-{HINT_LETTER_COST}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.randomLetterBtn}
              activeOpacity={0.75}
              onPress={handleRandomLetter}
            >
              <Ionicons name="text-outline" size={18} color={colors.primary} />
              <Text style={styles.randomHintText}>Random Harf</Text>
              <View style={styles.costBadge}>
                <Text style={styles.costBadgeText}>-3</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Grid ── */}
        <CengelGrid
          gameGrid={state.gameGrid}
          gridSize={puzzle.size}
          selectedCell={state.selectedCell}
          activeEntryCells={activeEntryCells}
          onCellPress={handleCellPress}
          correctFlash={correctFlash}
        />

        {/* ── Clue List (numaralı soru listesi) ── */}
        <CengelClueList
          entries={entries}
          activeEntryId={state.activeEntryId}
          activeDirection={state.activeDirection}
          lockedEntryIds={state.lockedEntryIds}
          onSelectEntry={handleSelectEntry}
        />

        {/* ── Feedback ── */}
        <FeedbackPanel type={feedback} />

        {/* ── Toast ── */}
        {toast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}

        {/* ── Bottom area: Keyboard OR CTA ── */}
        {shouldShowKeyboard ? (
          <TurkishKeyboard
            onKeyPress={typeLetter}
            onBackspace={backspace}
            onCheck={handleCheck}
            onHint={handleHintPress}
          />
        ) : (
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.8}
              onPress={enterSolvingMode}
            >
              <Ionicons name="pencil" size={18} color="#FFF" />
              <Text style={styles.ctaText}>Çözmeye Başla</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Hint Modal ── */}
        <Modal visible={hintModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.hintCard}>
              <Text style={styles.hintTitle}>💡 İpucu</Text>
              <TouchableOpacity style={styles.hintOption} onPress={handleRevealLetter}>
                <Text style={styles.hintOptionText}>Bir harf göster</Text>
                <Text style={styles.hintCost}>{HINT_LETTER_COST} coin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hintOption, styles.hintCancel]}
                onPress={() => setHintModalVisible(false)}
              >
                <Text style={styles.hintCancelText}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Pressable>
  );
}

// ═══════════════════════════════════════════
//  LEGACY GAME SCREEN (Old crossword mode)
// ═══════════════════════════════════════════

function LegacyGameScreen({ id }: { id: string }) {
  const router = useRouter();
  const isGeneratorMode = id.startsWith('gen_');
  const generatorPuzzleId = isGeneratorMode ? id.slice(4) : null;
  const isBigPuzzleMode = id.startsWith('big_');
  const bigPuzzleId = isBigPuzzleMode ? id.slice(4) : null;

  let level: LevelData;
  if (isGeneratorMode && generatorPuzzleId) {
    const entry = useGeneratorStore.getState().getById(generatorPuzzleId);
    level = entry?.payload ?? levels[0];
  } else if (isBigPuzzleMode && bigPuzzleId) {
    const entry = useBigPuzzleStore.getState().getPuzzleById(bigPuzzleId);
    level = entry?.payload ?? levels[0];
  } else {
    const levelId = parseInt(id, 10);
    level = levels.find((l) => l.id === levelId) ?? levels[0];
  }

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

  const [shakeWord, setShakeWord] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [navigated, setNavigated] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [cluePopoverWord, setCluePopoverWord] = useState<Word | null>(null);
  const hintsUsedRef = useRef(0);
  const mistakesRef = useRef(0);
  const correctWordsRef = useRef(0);
  const coinsSpentRef = useRef(0);

  const startCellMap = useMemo(() => buildStartCellMap(level.words), [level.words]);
  const diff = mapDifficulty(level.difficulty);

  useEffect(() => {
    if (state.isComplete && !navigated) {
      setNavigated(true);
      if (isGeneratorMode) {
        setTimeout(() => router.replace('/(tabs)/generator'), 1200);
        return;
      }
      const stars = computeStars(hintsUsedRef.current, mistakesRef.current, state.timeElapsed, diff);
      const xpResult = calculateXP({
        isBigPuzzle: false,
        timeSec: state.timeElapsed,
        mistakes: mistakesRef.current,
        letterHints: hintsUsedRef.current,
        clueHints: 0,
      });
      const coinsEarned = computeCoins(stars, false);
      completeLevel(level.id, stars, state.timeElapsed, mistakesRef.current, hintsUsedRef.current);
      useEconomyStore.getState().addCoins(coinsEarned);
      const gamResult = useGamificationStore.getState().addXP(xpResult.totalXP);
      useGamificationStore.getState().recordPuzzleCompletion();
      if (gamResult.levelUp) {
        useEconomyStore.getState().awardLevelUp();
      }
      onPuzzleCompleted(diff, mistakesRef.current, hintsUsedRef.current, state.timeElapsed, xpResult.totalXP);
      useStatsStore.getState().onPuzzleComplete({
        timeSec: state.timeElapsed,
        mistakes: mistakesRef.current,
        correctWords: correctWordsRef.current,
        wrongWords: mistakesRef.current,
        isDaily: false,
      });

      // League rank
      const weeklyXP = useGamificationStore.getState().weeklyXP;
      const leagueRank = useLeagueStore.getState().getRank(weeklyXP);

      setTimeout(() => {
        router.replace(
          `/result/${level.id}?stars=${stars}&time=${state.timeElapsed}&score=${state.score}&xp=${xpResult.totalXP}&coins=${coinsEarned}&hints=${hintsUsedRef.current}&mistakes=${mistakesRef.current}&coinsSpent=${coinsSpentRef.current}&perfect=${xpResult.isPerfect ? '1' : '0'}&levelUp=${gamResult.levelUp ? 'true' : 'false'}&newLevel=${gamResult.newLevel}&leagueRank=${leagueRank}`,
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [checkWord]);

  const handleHintPress = useCallback(() => setHintModalVisible(true), []);
  const handleRevealLetter = useCallback(() => {
    if (!spendCoins(HINT_LETTER_COST)) {
      setHintModalVisible(false);
      Alert.alert('Yetersiz Coin', `${HINT_LETTER_COST} coin gerektirir.`);
      return;
    }
    revealHint();
    hintsUsedRef.current += 1;
    coinsSpentRef.current += HINT_LETTER_COST;
    setHintModalVisible(false);
  }, [spendCoins, revealHint]);

  const selectedWordCells = getSelectedWordCells();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar
        levelId={level.id}
        timeElapsed={state.timeElapsed}
        score={state.score}
        coins={coins}
        onBack={() => router.back()}
        totalWords={level.words.length}
        completedWords={state.lockedWordIds?.size ?? 0}
      />
      <CrosswordGrid
        grid={state.grid}
        gridSize={level.gridSize}
        selectedCell={state.selectedCell}
        selectedWordCells={selectedWordCells}
        onCellPress={selectCell}
        shakeCell={shakeWord ? state.selectedCell : null}
        correctFlash={correctFlash}
        words={level.words}
        selectedWordId={state.selectedWordId}
        onClueChipPress={setCluePopoverWord}
      />
      <FeedbackPanel type={feedback} />
      <TurkishKeyboard
        onKeyPress={typeLetter}
        onBackspace={backspace}
        onCheck={handleCheck}
        onHint={handleHintPress}
      />
      {cluePopoverWord && (
        <CluePopover
          visible={!!cluePopoverWord}
          word={cluePopoverWord}
          onClose={() => setCluePopoverWord(null)}
          hasBothDirections={false}
          onToggleDirection={() => { }}
        />
      )}
      <Modal visible={hintModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>💡 İpucu</Text>
            <TouchableOpacity style={styles.hintOption} onPress={handleRevealLetter}>
              <Text style={styles.hintOptionText}>Bir harf göster</Text>
              <Text style={styles.hintCost}>{HINT_LETTER_COST} coin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hintOption, styles.hintCancel]}
              onPress={() => setHintModalVisible(false)}
            >
              <Text style={styles.hintCancelText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '700',
  },
  headerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  coinText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.fill,
    marginHorizontal: spacing.md,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: 280,
    gap: 12,
  },
  hintTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  hintOption: {
    backgroundColor: '#F3F0FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  hintCost: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  hintCancel: {
    backgroundColor: colors.fill,
  },
  hintCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  // ── Solving mode specific ──
  clueBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  idleHintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.fill,
    marginBottom: 4,
  },
  idleHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  hintRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: spacing.md,
    marginBottom: 4,
  },
  randomHintBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.primary + '0F',
    borderWidth: 1,
    borderColor: colors.primary + '22',
    minHeight: 48,
  },
  randomLetterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary + '44',
    minHeight: 48,
  },
  randomHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.1,
  },
  costBadge: {
    backgroundColor: colors.accent + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  costBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
  },
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  toastContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(26,26,46,0.88)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 6,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
