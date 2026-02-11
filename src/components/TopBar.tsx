import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import ProgressBar from './ui/ProgressBar';
import XPBadge from './ui/XPBadge';

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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <View
      style={[
        styles.heart,
        { backgroundColor: filled ? colors.secondary + '20' : colors.border },
      ]}
    >
      <Text style={styles.heartEmoji}>{filled ? '❤️' : '🤍'}</Text>
    </View>
  );
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
  const backScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(backScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(backScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Row 1: Back + Level + Timer */}
      <View style={styles.row}>
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

        <View style={styles.levelPill}>
          <Text style={styles.levelText}>Bölüm {levelId}</Text>
        </View>

        <View style={styles.timerPill}>
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
        </View>
      </View>

      {/* Row 2: Hearts + Progress + Coins */}
      <View style={styles.row}>
        <View style={styles.heartsRow}>
          {[1, 2, 3].map((i) => (
            <HeartIcon key={i} filled={i <= hearts} />
          ))}
        </View>

        <View style={styles.progressWrapper}>
          <ProgressBar
            progress={totalWords > 0 ? completedWords / totalWords : 0}
            height={10}
            color={colors.primary}
            trackColor={colors.primaryLight + '30'}
          />
          <Text style={styles.progressLabel}>
            {completedWords}/{totalWords}
          </Text>
        </View>

        <XPBadge value={coins} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  levelPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  levelText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 4,
  },
  timerIcon: {
    fontSize: 12,
  },
  timerText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  heart: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 14,
  },
  progressWrapper: {
    flex: 1,
    marginHorizontal: spacing.md,
    gap: 2,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
