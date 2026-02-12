import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { levels } from '../../src/levels/levels';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';
import PrimaryButton from '../../src/components/ui/PrimaryButton';
import Card from '../../src/components/ui/Card';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    id: string;
    stars: string;
    time: string;
    score: string;
    xp: string;
    levelUp: string;
    coins: string;
    hints: string;
    mistakes: string;
    coinsSpent: string;
  }>();
  const router = useRouter();
  const levelId = parseInt(params.id ?? '1', 10);
  const starCount = parseInt(params.stars ?? '0', 10);
  const timeVal = parseInt(params.time ?? '0', 10);
  const scoreVal = parseInt(params.score ?? '0', 10);
  const xpGained = parseInt(params.xp ?? '0', 10);
  const coinsEarned = parseInt(params.coins ?? '0', 10);
  const hintsUsed = parseInt(params.hints ?? '0', 10);
  const mistakes = parseInt(params.mistakes ?? '0', 10);
  const coinsSpent = parseInt(params.coinsSpent ?? '0', 10);
  const isLevelUp = params.levelUp === 'true';
  const hasNextLevel = levelId < levels.length;

  const [displayScore, setDisplayScore] = useState(0);

  // Animations
  const emojiScale = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(30)).current;
  const starScales = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(emojiScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(200, starScales.map((s) =>
        Animated.spring(s, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        })
      )),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Score count-up
    let current = 0;
    const step = Math.max(1, Math.ceil(scoreVal / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= scoreVal) {
        current = scoreVal;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 40);
    return () => clearInterval(interval);
  }, [scoreVal]);

  const minutes = Math.floor(timeVal / 60);
  const seconds = timeVal % 60;

  return (
    <LinearGradient
      colors={colors.gradientPrimary as readonly [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Celebration emoji */}
          <Animated.Text
            style={[
              styles.celebEmoji,
              { transform: [{ scale: emojiScale }] },
            ]}
          >
            {starCount === 3 ? '🏆' : '🎉'}
          </Animated.Text>

          {/* Main card */}
          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
              width: '100%',
            }}
          >
            <Card style={styles.card} variant="elevated" padding="xl">
              <Text style={styles.title}>Tebrikler!</Text>
              <Text style={styles.subtitle}>
                Bölüm {levelId} Tamamlandı
              </Text>

              {/* Stars */}
              <View style={styles.starsRow}>
                {[0, 1, 2].map((i) => (
                  <Animated.Text
                    key={i}
                    style={[
                      styles.star,
                      { transform: [{ scale: starScales[i] }] },
                    ]}
                  >
                    {i + 1 <= starCount ? '⭐' : '☆'}
                  </Animated.Text>
                ))}
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{displayScore}</Text>
                  <Text style={styles.statLabel}>Puan</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.statLabel}>Süre</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{mistakes}</Text>
                  <Text style={styles.statLabel}>Hata</Text>
                </View>
              </View>

              {/* Rewards Row */}
              <View style={styles.rewardsRow}>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>+{xpGained} XP</Text>
                </View>
                <View style={[styles.rewardBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.rewardText, { color: colors.accent }]}>+{coinsEarned} 🪙</Text>
                </View>
                {hintsUsed > 0 && (
                  <View style={[styles.rewardBadge, { backgroundColor: colors.secondary + '15' }]}>
                    <Text style={[styles.rewardText, { color: colors.secondary }]}>
                      {hintsUsed} İpucu ({coinsSpent} 🪙)
                    </Text>
                  </View>
                )}
              </View>

              {/* Level Up Banner */}
              {isLevelUp && (
                <View style={styles.levelUpContainer}>
                  <Text style={styles.levelUpText}>🎉 SEVİYE ATLADIN! 🎉</Text>
                </View>
              )}
            </Card>
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonsOpacity,
                transform: [{ translateY: buttonsSlide }],
              },
            ]}
          >
            {hasNextLevel && (
              <PrimaryButton
                title="Sonraki Bölüm →"
                onPress={() => router.replace(`/game/${levelId + 1}`)}
                variant="secondary"
                size="lg"
              />
            )}

            <PrimaryButton
              title="Ana Menü"
              onPress={() => router.replace('/')}
              variant="outline"
              size="md"
              style={styles.outlineOnDark}
              textStyle={styles.outlineTextOnDark}
            />

            <PrimaryButton
              title="Tekrar Oyna"
              onPress={() => router.replace(`/game/${levelId}`)}
              variant="ghost"
              size="sm"
              textStyle={styles.ghostTextOnDark}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  celebEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  star: {
    fontSize: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    justifyContent: 'center',
  },
  rewardBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  rewardText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  buttonsContainer: {
    marginTop: spacing.xl,
    width: '100%',
    gap: spacing.sm,
  },
  outlineOnDark: {
    borderColor: 'rgba(255,255,255,0.4)',
  },
  outlineTextOnDark: {
    color: colors.textInverse,
  },
  ghostTextOnDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  levelUpContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  levelUpText: {
    ...typography.h3,
    color: colors.textInverse,
  },
});
