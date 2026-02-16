import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';

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
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
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
            <Ionicons name="wallet" size={12} color={colors.accent} />
            <Text style={styles.coinText}> {coins}</Text>
          </View>
          <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
        </View>
      </View>

      {/* Progress bar */}
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerGroup: {
    flex: 1,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 12,
    ...shadows.sm,
  },
  levelText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rightGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  coinText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  timerText: {
    ...typography.label,
    fontWeight: '500',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.fill,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressLabel: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 3,
  },
});
