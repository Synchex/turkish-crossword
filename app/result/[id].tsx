import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { levels } from '../../src/levels/levels';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';
import { useTheme, useUIProfile } from '../../src/theme/ThemeContext';
import PrimaryButton from '../../src/components/ui/PrimaryButton';
import Card from '../../src/components/ui/Card';
import { getLevel, getLevelProgressPercent } from '../../src/utils/rewards';
import { useLeagueStore, LEAGUE_META } from '../../src/store/useLeagueStore';
import { useGamificationStore } from '../../src/store/useGamificationStore';

// ── Random celebratory headlines ──
const HEADLINES = [
  'Harika İş! 🎯',
  'Müthiş Çözüm! 🧠',
  'Deha Gibi! ✨',
  'Efsane! 🏆',
  'Süpersin! 🚀',
  'Bravo Sana! 👏',
  'Usta İşi! 💎',
  'Şahane! 🌟',
  'Nefis Çözüm! 🎉',
  'Tam İsabet! 🎯',
  'Parlıyorsun! ⚡',
  'Mükemmel! 💫',
];

// ── Star component ──
function AnimatedStar({
  filled,
  scale,
  delay,
  size,
  isDark,
  primaryColor,
}: {
  filled: boolean;
  scale: Animated.Value;
  delay: number;
  size: number;
  isDark: boolean;
  primaryColor: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (filled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale }, { rotate: spin }],
        opacity,
      }}
    >
      <View
        style={[
          starStyles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: filled
              ? '#FFD700' + '25'
              : isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.04)',
            borderColor: filled ? '#FFD700' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            ...(filled && isDark ? {
              shadowColor: '#FFD700',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
            } : {}),
          },
        ]}
      >
        <Ionicons
          name={filled ? 'star' : 'star-outline'}
          size={size * 0.5}
          color={filled ? '#FFD700' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
        />
      </View>
    </Animated.View>
  );
}

const starStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
});

// ── Main Screen ──
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
    streakIncreased: string;
  }>();
  const router = useRouter();
  const t = useTheme();
  const ui = useUIProfile();
  const isDark = t.id === 'black';
  const fs = ui.fontScale;

  const rawId = params.id ?? '1';
  const isCengel = rawId.startsWith('ch-');
  const levelId = isCengel ? 0 : parseInt(rawId, 10);
  const starCount = parseInt(params.stars ?? '0', 10);
  const timeVal = parseInt(params.time ?? '0', 10);
  const xpGained = parseInt(params.xp ?? '0', 10);
  const coinsEarned = parseInt(params.coins ?? '0', 10);
  const hintsUsed = parseInt(params.hints ?? '0', 10);
  const mistakes = parseInt(params.mistakes ?? '0', 10);
  const coinsSpent = parseInt(params.coinsSpent ?? '0', 10);
  const isLevelUp = params.levelUp === 'true';
  const isPerfect = params.perfect === '1';
  const newLevel = parseInt(params.newLevel ?? '1', 10);
  const leagueRank = parseInt(params.leagueRank ?? '0', 10);
  const streakIncreased = params.streakIncreased === '1';
  const hasNextLevel = !isCengel && levelId < levels.length;

  // Random headline (stable per mount)
  const headline = useMemo(
    () => HEADLINES[Math.floor(Math.random() * HEADLINES.length)],
    [],
  );

  // Streak & league
  const currentStreak = useGamificationStore((s) => s.currentStreak);
  const league = useLeagueStore((s) => s.league);
  const leagueMeta = LEAGUE_META[league];

  // XP count-up
  const [displayXP, setDisplayXP] = useState(0);

  // Animations
  const headerScale = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const starScales = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(20)).current;
  const xpPulse = useRef(new Animated.Value(1)).current;
  const streakSlide = useRef(new Animated.Value(-80)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;
  const leagueBadgeScale = useRef(new Animated.Value(0)).current;
  const perfectScale = useRef(new Animated.Value(0)).current;
  const levelUpScale = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(30)).current;
  const levelBarWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Master animation sequence
    Animated.sequence([
      // 1. Headline
      Animated.parallel([
        Animated.spring(headerScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
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
      // 3. Stats row
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(statsSlide, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 4. Perfect badge
      ...(isPerfect
        ? [
          Animated.spring(perfectScale, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
        ]
        : []),
      // 5. Level-up banner
      ...(isLevelUp
        ? [
          Animated.spring(levelUpScale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
        ]
        : []),
      // 6. Streak badge
      ...(currentStreak > 1
        ? [
          Animated.parallel([
            Animated.spring(streakSlide, {
              toValue: 0,
              friction: 6,
              tension: 60,
              useNativeDriver: true,
            }),
            Animated.timing(streakOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]
        : []),
      // 7. League badge
      ...(leagueRank > 0
        ? [
          Animated.spring(leagueBadgeScale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]
        : []),
      // 8. Buttons
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsSlide, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Level bar (non-native driver)
    Animated.timing(levelBarWidth, {
      toValue: isLevelUp ? 1 : getLevelProgressPercent((newLevel - 1) * 500 + (xpGained % 500)),
      duration: 1200,
      delay: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // XP count-up with easing
    let current = 0;
    const totalFrames = 35;
    const step = Math.max(1, Math.ceil(xpGained / totalFrames));
    const interval = setInterval(() => {
      current += step;
      if (current >= xpGained) {
        current = xpGained;
        clearInterval(interval);
        // Pulse on completion
        Animated.sequence([
          Animated.timing(xpPulse, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(xpPulse, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();
      }
      setDisplayXP(current);
    }, 35);

    return () => clearInterval(interval);
  }, [xpGained]);

  const minutes = Math.floor(timeVal / 60);
  const seconds = timeVal % 60;
  const starSize = ui.mode === 'accessible' ? 64 : 52;

  return (
    <LinearGradient
      colors={t.gradientPrimary as readonly [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* ── Headline ── */}
          <Animated.View
            style={{
              transform: [{ scale: headerScale }],
              opacity: headerOpacity,
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={[
                styles.headline,
                {
                  fontSize: Math.round(28 * fs),
                  color: '#FFF',
                  textShadowColor: 'rgba(0,0,0,0.25)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                },
              ]}
            >
              {headline}
            </Text>
            <Text
              style={[
                styles.subtitleText,
                {
                  fontSize: Math.round(14 * fs),
                  color: 'rgba(255,255,255,0.75)',
                },
              ]}
            >
              {isCengel ? 'Çengel Tamamlandı' : `Bölüm ${levelId} Tamamlandı`}
            </Text>
          </Animated.View>

          {/* ── Stars ── */}
          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              <AnimatedStar
                key={i}
                filled={i < starCount}
                scale={starScales[i]}
                delay={600 + i * 250}
                size={starSize}
                isDark={isDark}
                primaryColor={t.primary}
              />
            ))}
          </View>

          {/* ── Main Card ── */}
          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
              width: '100%',
            }}
          >
            <Card style={styles.card} variant="elevated" padding="lg">
              {/* Stats Grid */}
              <Animated.View
                style={[
                  styles.statsGrid,
                  {
                    opacity: statsOpacity,
                    transform: [{ translateY: statsSlide }],
                  },
                ]}
              >
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.primary, fontSize: Math.round(22 * fs) }]}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted, fontSize: Math.round(11 * fs) }]}>Süre</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: t.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.primary, fontSize: Math.round(22 * fs) }]}>
                    {mistakes}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted, fontSize: Math.round(11 * fs) }]}>Hata</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: t.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.primary, fontSize: Math.round(22 * fs) }]}>
                    {hintsUsed}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted, fontSize: Math.round(11 * fs) }]}>İpucu</Text>
                </View>
              </Animated.View>

              {/* Rewards Row */}
              <View style={styles.rewardsRow}>
                <Animated.View
                  style={[
                    styles.rewardBadge,
                    {
                      backgroundColor: t.primary + '18',
                      transform: [{ scale: xpPulse }],
                      ...(isDark ? {
                        shadowColor: t.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                      } : {}),
                    },
                  ]}
                >
                  <Text style={[styles.rewardText, { color: t.primary, fontSize: Math.round(13 * fs) }]}>
                    +{displayXP} XP
                  </Text>
                </Animated.View>
                <View style={[styles.rewardBadge, { backgroundColor: t.accent + '18' }]}>
                  <Text style={[styles.rewardText, { color: t.accent, fontSize: Math.round(13 * fs) }]}>
                    +{coinsEarned} 🪙
                  </Text>
                </View>
                {coinsSpent > 0 && (
                  <View style={[styles.rewardBadge, { backgroundColor: t.secondary + '12' }]}>
                    <Text style={[styles.rewardText, { color: t.secondary, fontSize: Math.round(11 * fs) }]}>
                      -{coinsSpent} 🪙
                    </Text>
                  </View>
                )}
              </View>

              {/* Perfect Badge */}
              {isPerfect && (
                <Animated.View
                  style={[
                    styles.perfectBadge,
                    {
                      transform: [{ scale: perfectScale }],
                      borderColor: '#FF6B35' + '30',
                      ...(isDark ? {
                        shadowColor: '#FF6B35',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      } : {}),
                    },
                  ]}
                >
                  <Text style={[styles.perfectText, { fontSize: Math.round(13 * fs) }]}>⚡ MÜKEMMEL ⚡</Text>
                </Animated.View>
              )}

              {/* Level Progress */}
              <View style={styles.levelContainer}>
                <View style={styles.levelRow}>
                  <Text style={[styles.levelLabel, { color: t.text, fontSize: Math.round(13 * fs) }]}>
                    Seviye {newLevel}
                  </Text>
                  {isLevelUp && (
                    <Text style={[styles.levelXPLabel, { color: t.success, fontSize: Math.round(11 * fs) }]}>
                      SEVİYE ATLADI! 🎉
                    </Text>
                  )}
                </View>
                <View style={[styles.levelBarTrack, { backgroundColor: t.fill }]}>
                  <Animated.View
                    style={[
                      styles.levelBarFill,
                      {
                        backgroundColor: t.primary,
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
                    {
                      backgroundColor: t.accent,
                      transform: [{ scale: levelUpScale }],
                    },
                  ]}
                >
                  <Text style={[styles.levelUpText, { fontSize: Math.round(16 * fs) }]}>
                    🎉 SEVİYE {newLevel}!
                  </Text>
                  <Text style={[styles.levelUpSub, { fontSize: Math.round(12 * fs) }]}>
                    +20 Coin bonus kazandın!
                  </Text>
                </Animated.View>
              )}

              {/* Streak Badge */}
              {currentStreak > 1 && (
                <Animated.View
                  style={[
                    styles.streakBadge,
                    {
                      opacity: streakOpacity,
                      transform: [{ translateX: streakSlide }],
                      backgroundColor: isDark ? 'rgba(255,149,0,0.15)' : '#FFF3E0',
                      borderColor: t.accent + '30',
                      ...(isDark ? {
                        shadowColor: t.accent,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      } : {}),
                    },
                  ]}
                >
                  <Text style={[styles.streakText, { color: t.accent, fontSize: Math.round(14 * fs) }]}>
                    🔥 {currentStreak} gün serisi!
                  </Text>
                  {streakIncreased && (
                    <View style={styles.streakArrow}>
                      <Ionicons name="arrow-up" size={Math.round(14 * fs)} color={t.success} />
                    </View>
                  )}
                </Animated.View>
              )}

              {/* League Badge */}
              {leagueRank > 0 && (
                <Animated.View
                  style={[
                    styles.leagueBadge,
                    {
                      transform: [{ scale: leagueBadgeScale }],
                      borderColor: leagueMeta.color + '30',
                      backgroundColor: isDark ? leagueMeta.color + '12' : leagueMeta.color + '08',
                      ...(isDark ? {
                        shadowColor: leagueMeta.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                      } : {}),
                    },
                  ]}
                >
                  <Text style={[styles.leagueIcon, { fontSize: Math.round(18 * fs) }]}>
                    {leagueMeta.icon === 'trophy' ? '🏆' : '🛡'}
                  </Text>
                  <View>
                    <Text style={[styles.leagueText, { color: leagueMeta.color, fontSize: Math.round(13 * fs) }]}>
                      #{leagueRank} {leagueMeta.label} Lig
                    </Text>
                  </View>
                  <Ionicons name="trending-up" size={Math.round(16 * fs)} color={t.success} />
                </Animated.View>
              )}
            </Card>
          </Animated.View>

          {/* ── CTAs ── */}
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

// ══════════════════════════════════════
//  STYLES
// ══════════════════════════════════════
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
  headline: {
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitleText: {
    fontWeight: '500',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: spacing.lg,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  statValue: {
    ...typography.h2,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.label,
    marginTop: spacing.xs,
  },
  // Rewards
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  rewardBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  rewardText: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // Perfect badge
  perfectBadge: {
    backgroundColor: '#FF6B35' + '15',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  perfectText: {
    color: '#FF6B35',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  // Level progress
  levelContainer: {
    width: '100%',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelLabel: {
    fontWeight: '700',
  },
  levelXPLabel: {
    fontWeight: '700',
  },
  levelBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Level up
  levelUpContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    width: '100%',
  },
  levelUpText: {
    color: '#FFF',
    fontWeight: '800',
  },
  levelUpSub: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  // Streak badge
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'center',
  },
  streakText: {
    fontWeight: '700',
  },
  streakArrow: {
    marginLeft: 2,
  },
  // League badge
  leagueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'center',
  },
  leagueIcon: {},
  leagueText: {
    fontWeight: '700',
  },
  // Buttons
  buttonsContainer: {
    marginTop: spacing.xl,
    width: '100%',
    gap: spacing.sm,
  },
  outlineOnDark: {
    borderColor: 'rgba(255,255,255,0.4)',
  },
  outlineTextOnDark: {
    color: '#FFF',
  },
  ghostTextOnDark: {
    color: 'rgba(255,255,255,0.7)',
  },
});
