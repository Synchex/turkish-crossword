import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { levels } from '../../src/levels/levels';
import { useCrosswordGame } from '../../src/game/useCrosswordGame';
import { useProgressStore } from '../../src/store/gameStore';
import CrosswordGrid from '../../src/components/CrosswordGrid';
import ClueList from '../../src/components/ClueList';
import TurkishKeyboard from '../../src/components/TurkishKeyboard';
import TopBar from '../../src/components/TopBar';
import { Word } from '../../src/game/types';

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
    getStars,
    wordMap,
  } = useCrosswordGame(level);

  const coins = useProgressStore((s) => s.coins);
  const spendCoin = useProgressStore((s) => s.spendCoin);
  const completeLevel = useProgressStore((s) => s.completeLevel);

  const [shakeWord, setShakeWord] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [navigated, setNavigated] = useState(false);

  // Navigate to result on completion
  useEffect(() => {
    if (state.isComplete && !navigated) {
      setNavigated(true);
      const stars = getStars();
      completeLevel(levelId, stars, state.hearts, state.timeElapsed);
      setTimeout(() => {
        router.replace(`/result/${levelId}?stars=${stars}&time=${state.timeElapsed}&score=${state.score}&hearts=${state.hearts}`);
      }, 800);
    }
  }, [state.isComplete]);

  const handleCheck = useCallback(() => {
    const result = checkWord();
    if (result === 'correct') {
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 600);
    } else if (result === 'wrong') {
      setShakeWord(true);
      setTimeout(() => setShakeWord(false), 400);
      if (state.hearts <= 1) {
        setTimeout(() => {
          Alert.alert('Canların Bitti!', 'Tekrar denemek ister misin?', [
            { text: 'Ana Menü', onPress: () => router.replace('/') },
            { text: 'Tekrar', onPress: () => router.replace(`/game/${levelId}`) },
          ]);
        }, 500);
      }
    }
  }, [checkWord, state.hearts, levelId]);

  const handleHint = useCallback(() => {
    if (!spendCoin()) {
      Alert.alert('Yetersiz Jeton', 'İpucu için jeton gerekli!');
      return;
    }
    revealHint();
  }, [spendCoin, revealHint]);

  const handleSelectWord = useCallback(
    (word: Word) => {
      selectCell(word.startRow, word.startCol);
    },
    [selectCell]
  );

  const selectedWordCells = getSelectedWordCells();

  // Find the first cell that should shake (for wrong animation)
  const shakeCell = shakeWord && selectedWordCells.length > 0 ? selectedWordCells[0] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        levelId={levelId}
        hearts={state.hearts}
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
        onHint={handleHint}
        disabled={state.isComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gridSection: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  clueSection: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 4,
  },
});
