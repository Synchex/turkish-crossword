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
import { getLevel, getLevelProgressPercent } from '../../src/utils/rewards';
import { useLeagueStore, LEAGUE_META } from '../../src/store/useLeagueStore';

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
    perfect: string;
    newLevel: string;
    leagueRank: string;
  }>();
  const router = useRouter();
  const rawId = params.id ?? '1';
  const isCengel = rawId.startsWith('ch-');
  const levelId = isCengel ? 0 : parseInt(rawId, 10);
  const starCount = parseInt(params.stars ?? '0', 10);
  const timeVal = parseInt(params.time ?? '0', 10);
  const scoreVal = parseInt(params.score ?? '0', 10);
  const xpGained = parseInt(params.xp ?? '0', 10);
  const coinsEarned = parseInt(params.coins ?? '0', 10);
  const hintsUsed = parseInt(params.hints ?? '0', 10);
  const mistakes = parseInt(params.mistakes ?? '0', 10);
  const coinsSpent = parseInt(params.coinsSpent ?? '0', 10);
  const isLevelUp = params.levelUp === 'true';
  const isPerfect = params.perfect === '1';
  const newLevel = parseInt(params.newLevel ?? '1', 10);
  const leagueRank = parseInt(params.leagueRank ?? '0', 10);
  const hasNextLevel = !isCengel && levelId < levels.length;

  // Animated display values
  const [displayXP, setDisplayXP] = useState(0);

  // Determine league label
  const league = useLeagueStore((s) => s.league);
  const leagueMeta = LEAGUE_META[league];

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
  const perfectScale = useRef(new Animated.Value(0)).current;
  const levelBarWidth = useRef(new Animated.Value(0)).current;
  const levelUpScale = useRef(new Animated.Value(0)).current;
  const leagueBadgeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      // 1. Emoji
      Animated.spring(emojiScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      // 2. Card
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
      // 3. Stars stagger
      Animated.stagger(200, starScales.map((s) =>
        Animated.spring(s, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        })
      )),
      // 4. Perfect badge (if applicable)
      ...(isPerfect ? [
        Animated.spring(perfectScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ] : []),
      // 5. Level-up (if applicable)
      ...(isLevelUp ? [
        Animated.spring(levelUpScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ] : []),
      // 6. League badge
      Animated.timing(leagueBadgeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 7. Buttons
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

    // Level bar animation (non-native driver for width)
    const targetProgress = getLevelProgressPercent(
      isLevelUp
        ? newLevel * 500 // just crossed threshold — show full bar for prev level
        : (newLevel - 1) * 500 + getLevelProgressPercent((newLevel - 1) * 500 + xpGained) * 500
    );
    Animated.timing(levelBarWidth, {
      toValue: isLevelUp ? 1 : getLevelProgressPercent((newLevel - 1) * 500 + xpGained % 500),
      duration: 1200,
      delay: 800,
      useNativeDriver: false,
    }).start();

    // XP count-up
    let current = 0;
    const step = Math.max(1, Math.ceil(xpGained / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= xpGained) {
        current = xpGained;
        clearInterval(interval);
      }
      setDisplayXP(current);
    }, 40);
    return () => clearInterval(interval);
  }, [xpGained]);

  const minutes = Math.floor(timeVal / 60);
  const seconds = timeVal % 60;

  const titleText = isCengel
    ? 'Çengel Tamamlandı!'
    : `Bölüm ${levelId} Tamamlandı`;

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
              <Text style={styles.subtitle}>{titleText}</Text>

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

              {/* Mastered badge (3 stars) */}
              {starCount === 3 && (
                <Animated.View
                  style={[
                    styles.masteredBadge,
                    { transform: [{ scale: starScales[2] }] },
                  ]}
                >
                  <Text style={styles.masteredText}>✨ USTA! ✨</Text>
                </Animated.View>
              )}

              {/* Perfect badge */}
              {isPerfect && (
                <Animated.View
                  style={[
                    styles.perfectBadge,
                    { transform: [{ scale: perfectScale }] },
                  ]}
                >
                  <Text style={styles.perfectText}>⚡ MÜKEMMEL! ⚡</Text>
                </Animated.View>
              )}

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
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
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{hintsUsed}</Text>
                  <Text style={styles.statLabel}>İpucu</Text>
                </View>
              </View>

              {/* Rewards Row */}
              <View style={styles.rewardsRow}>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>+{displayXP} XP</Text>
                </View>
                <View style={[styles.rewardBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.rewardText, { color: colors.accent }]}>+{coinsEarned} 🪙</Text>
                </View>
                {coinsSpent > 0 && (
                  <View style={[styles.rewardBadge, { backgroundColor: colors.secondary + '15' }]}>
                    <Text style={[styles.rewardText, { color: colors.secondary }]}>
                      {hintsUsed} İpucu ({coinsSpent} 🪙)
                    </Text>
                  </View>
                )}
              </View>

              {/* Level Progress Bar */}
              <View style={styles.levelContainer}>
                <View style={styles.levelRow}>
                  <Text style={styles.levelLabel}>Seviye {newLevel}</Text>
                  <Text style={styles.levelXPLabel}>
                    {isLevelUp ? `${newLevel * 500} / ${newLevel * 500} XP` : ''}
                  </Text>
                </View>
                <View style={styles.levelBarTrack}>
                  <Animated.View
                    style={[
                      styles.levelBarFill,
                      {
                        width: levelBarWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Level Up Banner */}
              {isLevelUp && (
                <Animated.View
                  style={[
                    styles.levelUpContainer,
                    { transform: [{ scale: levelUpScale }] },
                  ]}
                >
                  <Text style={styles.levelUpText}>
                    🎉 SEVİYE {newLevel}! 🎉
                  </Text>
                  <Text style={styles.levelUpSub}>+20 Coin bonus kazandın!</Text>
                </Animated.View>
              )}

              {/* League Rank Badge */}
              {leagueRank > 0 && (
                <Animated.View
                  style={[
                    styles.leagueBadge,
                    { opacity: leagueBadgeOpacity, borderColor: leagueMeta.color + '40' },
                  ]}
                >
                  <Text style={styles.leagueIcon}>{leagueMeta.icon === 'trophy' ? '🏆' : '🛡'}</Text>
                  <Text style={[styles.leagueText, { color: leagueMeta.color }]}>
                    #{leagueRank} {leagueMeta.label} Lig
                  </Text>
                </Animated.View>
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

            {!isCengel && (
              <PrimaryButton
                title="Tekrar Oyna"
                onPress={() => router.replace(`/game/${levelId}`)}
                variant="ghost"
                size="sm"
                textStyle={styles.ghostTextOnDark}
              />
            )}
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
  // Mastered badge
  masteredBadge: {
    marginTop: spacing.sm,
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#FFD700' + '40',
  },
  masteredText: {
    ...typography.label,
    color: '#D4A800',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  // Perfect badge
  perfectBadge: {
    marginTop: spacing.sm,
    backgroundColor: '#FF6B35' + '18',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#FF6B35' + '30',
  },
  perfectText: {
    ...typography.label,
    color: '#FF6B35',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
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
  // Level progress
  levelContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelLabel: {
    ...typography.label,
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  levelXPLabel: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 11,
  },
  levelBarTrack: {
    height: 8,
    backgroundColor: colors.fill,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  // Level up
  levelUpContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  levelUpText: {
    ...typography.h3,
    color: colors.textInverse,
  },
  levelUpSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // League badge
  leagueBadge: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  leagueIcon: {
    fontSize: 16,
  },
  leagueText: {
    ...typography.label,
    fontWeight: '700',
    fontSize: 13,
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
});
