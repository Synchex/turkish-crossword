import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

interface Props {
  levelId: number;
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
  timeElapsed,
  score,
  coins,
  onBack,
  totalWords,
  completedWords,
}: Props) {
  const backScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(backScale, { toValue: 0.88, useNativeDriver: true }).start();
  }, []);
  const handlePressOut = useCallback(() => {
    Animated.spring(backScale, { toValue: 1, useNativeDriver: true }).start();
  }, []);

  const progress = totalWords > 0 ? completedWords / totalWords : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Back */}
        <Pressable
          onPress={onBack}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View
            style={[styles.backBtn, { transform: [{ scale: backScale }] }]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Animated.View>
        </Pressable>

        {/* Center: Level badge */}
        <View style={styles.centerGroup}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Bölüm {levelId}</Text>
          </View>
        </View>

        {/* Right: Coin + Timer */}
        <View style={styles.rightGroup}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {coins}</Text>
          </View>
          <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
        </View>
      </View>

      {/* Progress bar — thicker, below row */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>
        {completedWords} / {totalWords} kelime
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E5F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  centerGroup: {
    flex: 1,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: radius.full,
    // Subtle badge shadow
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  rightGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  coinBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  coinText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentDark,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A9A5B8',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#EEEAF6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B0ABBD',
    textAlign: 'center',
    marginTop: 3,
  },
});
