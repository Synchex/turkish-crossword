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
import { shadows } from '../../src/theme/shadows';
import { typography } from '../../src/theme/typography';
import PrimaryButton from '../../src/components/ui/PrimaryButton';
import Card from '../../src/components/ui/Card';

export default function ResultScreen() {
  const { id, stars, time, score, hearts } = useLocalSearchParams<{
    id: string;
    stars: string;
    time: string;
    score: string;
    hearts: string;
  }>();
  const router = useRouter();
  const levelId = parseInt(id ?? '1', 10);
  const starCount = parseInt(stars ?? '0', 10);
  const timeVal = parseInt(time ?? '0', 10);
  const scoreVal = parseInt(score ?? '0', 10);
  const heartsVal = parseInt(hearts ?? '0', 10);
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

    // Stagger entrance animations
    Animated.sequence([
      // 1. Emoji zoom
      Animated.spring(emojiScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      // 2. Card reveal
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
      // 3. Stars
      Animated.stagger(200, starScales.map((s) =>
        Animated.spring(s, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        })
      )),
      // 4. Buttons
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
      colors={colors.gradientPrimary as unknown as string[]}
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
            🎉
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

              {/* Stats */}
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
                  <Text style={styles.statValue}>
                    {'❤️'.repeat(heartsVal)}
                  </Text>
                  <Text style={styles.statLabel}>Kalan Can</Text>
                </View>
              </View>
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
