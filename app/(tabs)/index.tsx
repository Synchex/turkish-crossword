import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProgressStore } from '../../src/store/gameStore';
import { levels } from '../../src/levels/levels';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';
import PrimaryButton from '../../src/components/ui/PrimaryButton';
import LevelNode from '../../src/components/ui/LevelNode';
import Card from '../../src/components/ui/Card';


export default function HomeScreen() {
  const router = useRouter();
  const progress = useProgressStore((s) => s.progress);
  const coins = useProgressStore((s) => s.coins);
  const loaded = useProgressStore((s) => s.loaded);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const currentLevel =
    progress.find((p) => !p.completed)?.levelId ?? levels.length;
  const completedCount = progress.filter((p) => p.completed).length;
  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <LinearGradient
          colors={colors.gradientPrimary as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
            }}
          >
            <Text style={styles.heroTitle}>Kare Bulmaca</Text>
            <Text style={styles.heroSubtitle}>Türkçe Çengel Bulmaca</Text>
          </Animated.View>
        </LinearGradient>

        {/* ── Stats Row ── */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={styles.statCard} variant="elevated" padding="md">
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>
              {completedCount}/{levels.length}
            </Text>
            <Text style={styles.statLabel}>Bölüm</Text>
          </Card>
          <Card style={styles.statCard} variant="elevated" padding="md">
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{totalStars}</Text>
            <Text style={styles.statLabel}>Yıldız</Text>
          </Card>
          <Card style={styles.statCard} variant="elevated" padding="md">
            <Text style={styles.statIcon}>🪙</Text>
            <Text style={styles.statValue}>{coins}</Text>
            <Text style={styles.statLabel}>Jeton</Text>
          </Card>
        </Animated.View>

        {/* ── Play CTA ── */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <PrimaryButton
            title={`Bölüm ${currentLevel}  ▶  Oyna`}
            onPress={() => router.push(`/game/${currentLevel}`)}
            variant="primary"
            size="lg"
          />
        </Animated.View>

        {/* ── Daily Streak Card ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.streakCard} variant="accent" padding="lg">
            <View style={styles.streakRow}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>Günlük Seri</Text>
                <Text style={styles.streakSub}>Her gün oyna, seriyi koru!</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ── Section Title ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bölümler</Text>
          <Text style={styles.sectionBadge}>
            {completedCount}/{levels.length}
          </Text>
        </View>

        {/* ── Level Grid ── */}
        <View style={styles.levelGrid}>
          {levels.map((level) => {
            const p = progress.find((pr) => pr.levelId === level.id);
            const unlocked = p?.unlocked ?? false;
            const completed = p?.completed ?? false;
            const stars = p?.stars ?? 0;

            return (
              <LevelNode
                key={level.id}
                levelId={level.id}
                title={level.title}
                difficulty={level.difficulty}
                gridSize={level.gridSize}
                unlocked={unlocked}
                completed={completed}
                stars={stars}
                onPress={() => router.push(`/game/${level.id}`)}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  // ── Hero ──
  hero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroTitle: {
    ...typography.hero,
    color: colors.textInverse,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  // ── CTA ──
  ctaContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  // ── Streak ──
  streakCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  streakSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // ── Section ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  sectionBadge: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  // ── Level Grid ──
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
});
