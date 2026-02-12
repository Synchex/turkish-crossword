import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProgressStore } from '../../src/store/gameStore';
import { useEconomyStore, STREAK_FREEZE_COST } from '../../src/store/useEconomyStore';
import { useMissionsStore, Mission } from '../../src/store/useMissionsStore';
import { useGamificationStore, getXPForNextLevel } from '../../src/store/useGamificationStore';
import { useDailyPuzzleStore } from '../../src/store/useDailyPuzzleStore';
import { DAILY_COIN_REWARD, DAILY_XP_REWARD } from '../../src/data/dailyPuzzles';
import { levels } from '../../src/levels/levels';
import LevelPath from '../../src/components/LevelPath';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';
import Card from '../../src/components/ui/Card';
import DailyMissionsButtonCard from '../../src/components/DailyMissionsButtonCard';
import MissionsModalSheet from '../../src/components/MissionsModalSheet';
import DeveloperPanel from '../../src/components/DeveloperPanel';
import { IS_DEV } from '../../src/config/devConfig';

// ── Daily Puzzle Card Component ──
function DailyPuzzleCard({ router }: { router: ReturnType<typeof useRouter> }) {
  const completedToday = useDailyPuzzleStore((s) => s.completedToday);
  const todayPuzzle = useDailyPuzzleStore((s) => s.getTodayPuzzle)();

  return (
    <TouchableOpacity
      style={dpStyles.card}
      activeOpacity={0.85}
      onPress={() => {
        if (!completedToday) router.push('/daily');
      }}
    >
      <View style={dpStyles.left}>
        <Text style={dpStyles.emoji}>🌟</Text>
        <View style={{ flex: 1 }}>
          <Text style={dpStyles.title}>Bugünün Bulmacası</Text>
          <Text style={dpStyles.sub}>{todayPuzzle.title}</Text>
          <Text style={dpStyles.rewards}>🪙 {DAILY_COIN_REWARD}  ·  ✨ {DAILY_XP_REWARD} XP</Text>
        </View>
      </View>
      <View style={[dpStyles.ctaBadge, completedToday && dpStyles.ctaDone]}>
        <Text style={[dpStyles.ctaText, completedToday && dpStyles.ctaDoneText]}>
          {completedToday ? 'Tamamlandı ✅' : 'Başla ▶'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const dpStyles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewards: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  ctaBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  ctaDone: {
    backgroundColor: colors.cardAlt,
  },
  ctaText: {
    ...typography.label,
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  ctaDoneText: {
    color: colors.success,
  },
});

// ── Mission Card Component ──
function MissionCard({ mission, onClaim }: { mission: Mission; onClaim: (id: string) => void }) {
  const progressPercent = Math.min(1, mission.progress / mission.target);
  const diffColors: Record<string, string> = {
    easy: colors.success,
    medium: colors.accent,
    hard: colors.secondary,
  };
  const barColor = diffColors[mission.difficulty] ?? colors.primary;

  return (
    <View style={mStyles.card}>
      <View style={mStyles.cardHeader}>
        <View style={[mStyles.diffBadge, { backgroundColor: barColor }]}>
          <Text style={mStyles.diffText}>
            {mission.difficulty === 'easy' ? 'Kolay' : mission.difficulty === 'medium' ? 'Orta' : 'Zor'}
          </Text>
        </View>
        <Text style={mStyles.reward}>🪙 {mission.rewardCoins} · ✨ {mission.rewardXP} XP</Text>
      </View>

      <Text style={mStyles.title}>{mission.title}</Text>
      <Text style={mStyles.desc}>{mission.description}</Text>

      <View style={mStyles.progressTrack}>
        <View style={[mStyles.progressFill, { width: `${progressPercent * 100}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={mStyles.progressText}>{mission.progress}/{mission.target}</Text>

      {mission.completed && !mission.claimed && (
        <TouchableOpacity
          style={[mStyles.claimBtn, { backgroundColor: barColor }]}
          onPress={() => onClaim(mission.id)}
        >
          <Text style={mStyles.claimText}>Ödülü Al! 🎉</Text>
        </TouchableOpacity>
      )}
      {mission.claimed && (
        <View style={mStyles.claimedBadge}>
          <Text style={mStyles.claimedText}>✅ Alındı</Text>
        </View>
      )}
    </View>
  );
}

const mStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
    textTransform: 'uppercase',
  },
  reward: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontSize: 15,
  },
  desc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
    fontSize: 11,
  },
  claimBtn: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  claimText: {
    ...typography.label,
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  claimedBadge: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  claimedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
});

// ── Main Home Screen ──
export default function HomeScreen() {
  const router = useRouter();
  const progress = useProgressStore((s) => s.progress);
  const loaded = useProgressStore((s) => s.loaded);

  const coins = useEconomyStore((s) => s.coins);
  const buyStreakFreeze = useEconomyStore((s) => s.buyStreakFreeze);

  const missions = useMissionsStore((s) => s.missions);
  const claimMission = useMissionsStore((s) => s.claimMission);
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions);

  const { currentStreak, longestStreak, totalXP, currentLevel: playerLevel, streakFreezes } = useGamificationStore();

  const [shopVisible, setShopVisible] = useState(false);
  const [missionsModalVisible, setMissionsModalVisible] = useState(false);
  const [devPanelVisible, setDevPanelVisible] = useState(false);

  // Ensure missions on focus
  useEffect(() => {
    ensureDailyMissions();
  }, []);

  // Level Progress
  const nextLevelXP = getXPForNextLevel(playerLevel);
  const prevLevelXP = playerLevel === 1 ? 0 : getXPForNextLevel(playerLevel - 1);
  const levelProgress = Math.min(1, Math.max(0, (totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)));

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

  const completedCount = progress.filter((p) => p.completed).length;
  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);

  const handleClaimMission = (id: string) => {
    const result = claimMission(id);
    if (result) {
      Alert.alert('Ödül Alındı!', `🪙 ${result.coins} coin kazandın!`);
    }
  };

  const handleBuyFreeze = () => {
    if (buyStreakFreeze()) {
      Alert.alert('Satın Alındı!', '❄️ 1 Seri Dondurucu eklendi.');
    } else {
      Alert.alert('Yetersiz Coin', `Seri dondurucu ${STREAK_FREEZE_COST} coin gerektirir.`);
    }
  };

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
          colors={colors.gradientPrimary as readonly [string, string]}
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
            {IS_DEV && (
              <View style={styles.devBadge}>
                <Text style={styles.devBadgeText}>DEV MODE</Text>
              </View>
            )}

            {/* XP Progress */}
            <View style={styles.xpContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{playerLevel}</Text>
              </View>
              <View style={styles.xpBarTrack}>
                <View style={[styles.xpBarFill, { width: `${levelProgress * 100}%` }]} />
              </View>
              <Text style={styles.xpLabelText}>{totalXP} XP</Text>
            </View>
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
          {/* Completed Levels */}
          <Card style={styles.statCard} variant="elevated" padding="md">
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </Card>

          <Card style={styles.statCard} variant="elevated" padding="md">
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{totalStars}</Text>
            <Text style={styles.statLabel}>Yıldız</Text>
          </Card>
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => IS_DEV && setDevPanelVisible(true)}
            delayLongPress={2000}
          >
            <Card style={styles.statCard} variant="elevated" padding="md">
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.statValue}>{IS_DEV ? '∞' : coins}</Text>
              <Text style={styles.statLabel}>Coin</Text>
            </Card>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Shop Button ── */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => setShopVisible(true)}
          >
            <Text style={styles.shopButtonText}>🛍️ Mağaza</Text>
          </TouchableOpacity>
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
                <Text style={styles.streakTitle}>{currentStreak} Günlük Seri</Text>
                <Text style={styles.streakSub}>
                  {longestStreak > 0
                    ? `En uzun seri: ${longestStreak} gün`
                    : 'Her gün oyna, seriyi koru!'}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ── Daily Puzzle Card ── */}
        <DailyPuzzleCard router={router} />

        {/* ── Daily Missions Card Button ── */}
        <DailyMissionsButtonCard
          completedCount={missions.filter((m) => m.completed).length}
          totalCount={missions.length}
          onPress={() => setMissionsModalVisible(true)}
        />

        {/* ── Level Path (Duolingo Style) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🗺️ Bölümler</Text>
          <Text style={styles.sectionBadge}>
            {completedCount}/{levels.length}
          </Text>
        </View>

        <LevelPath />
      </ScrollView>

      {/* ── Shop Modal ── */}
      <Modal
        visible={shopVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShopVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShopVisible(false)}
        >
          <View style={styles.shopSheet}>
            <View style={styles.shopHandle} />
            <Text style={styles.shopTitle}>🛍️ Mağaza</Text>
            <Text style={styles.shopCoins}>🪙 {coins} Coin</Text>

            {/* Streak Freeze */}
            <TouchableOpacity style={styles.shopItem} onPress={handleBuyFreeze}>
              <View style={styles.shopItemLeft}>
                <Text style={styles.shopItemEmoji}>❄️</Text>
                <View>
                  <Text style={styles.shopItemTitle}>Seri Dondurucu</Text>
                  <Text style={styles.shopItemDesc}>
                    1 gün oynamasan da serin korunsun (Mevcut: {streakFreezes})
                  </Text>
                </View>
              </View>
              <View style={styles.shopPriceBadge}>
                <Text style={styles.shopPriceText}>{STREAK_FREEZE_COST} 🪙</Text>
              </View>
            </TouchableOpacity>

            {/* Info card */}
            <View style={styles.shopInfoCard}>
              <Text style={styles.shopInfoTitle}>💡 İpuçları</Text>
              <Text style={styles.shopInfoDesc}>
                Oyun sırasında İpucu butonuna basarak harf veya kelime açabilirsin.
                {'\n'}Harf: 10 🪙  ·  Kelime: 25 🪙
              </Text>
            </View>

            <TouchableOpacity
              style={styles.shopClose}
              onPress={() => setShopVisible(false)}
            >
              <Text style={styles.shopCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Daily Missions Modal ── */}
      <MissionsModalSheet
        visible={missionsModalVisible}
        missions={missions}
        onClaim={handleClaimMission}
        onClose={() => setMissionsModalVisible(false)}
      />

      {/* ── Developer Panel (hidden, DEV only) ── */}
      <DeveloperPanel
        visible={devPanelVisible}
        onClose={() => setDevPanelVisible(false)}
      />
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
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  levelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textInverse,
  },
  xpBarTrack: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  xpLabelText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textInverse,
    fontWeight: '700',
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
  devBadge: {
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    gap: spacing.sm,
  },
  statCardRaw: {
    flex: 1,
  },
  statCardInner: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
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
  timerLabel: {
    ...typography.caption,
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // ── CTA ──
  ctaContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  shopButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shopButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
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
  // ── Shop Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  shopSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  shopHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  shopTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  shopCoins: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  shopItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  shopItemEmoji: {
    fontSize: 28,
  },
  shopItemTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 15,
  },
  shopItemDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 200,
  },
  shopPriceBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  shopPriceText: {
    ...typography.label,
    fontWeight: '700',
    color: colors.text,
    fontSize: 13,
  },
  shopInfoCard: {
    backgroundColor: colors.shimmer,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  shopInfoTitle: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 14,
  },
  shopInfoDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  shopClose: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  shopCloseText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
