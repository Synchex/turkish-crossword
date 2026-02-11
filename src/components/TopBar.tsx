import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  levelId: number;
  hearts: number;
  timeElapsed: number;
  score: number;
  coins: number;
  onBack: () => void;
  totalWords: number;
  completedWords: number;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function TopBar({
  levelId,
  hearts,
  timeElapsed,
  score,
  coins,
  onBack,
  totalWords,
  completedWords,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Geri</Text>
        </TouchableOpacity>
        <Text style={styles.levelText}>Bölüm {levelId}</Text>
        <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.stat}>
          {'❤️'.repeat(hearts)}{'🖤'.repeat(3 - hearts)}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${totalWords > 0 ? (completedWords / totalWords) * 100 : 0}%` },
            ]}
          />
          <Text style={styles.progressText}>
            {completedWords}/{totalWords}
          </Text>
        </View>
        <Text style={styles.stat}>🪙 {coins}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  timerText: {
    color: '#BBDEFB',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stat: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressBar: {
    flex: 1,
    height: 18,
    backgroundColor: '#0D47A1',
    borderRadius: 9,
    marginHorizontal: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 9,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
