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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProgressStore } from '../../src/store/gameStore';
import { useEconomyStore, STREAK_FREEZE_COST } from '../../src/store/useEconomyStore';
import { useMissionsStore, Mission } from '../../src/store/useMissionsStore';
import { useGamificationStore, getXPForNextLevel } from '../../src/store/useGamificationStore';
import { useDailyPuzzleStore } from '../../src/store/useDailyPuzzleStore';
import { useLeagueStore, LEAGUE_META } from '../../src/store/useLeagueStore';
import { DAILY_COIN_REWARD, DAILY_XP_REWARD } from '../../src/data/dailyPuzzles';
import { levels } from '../../src/levels/levels';

import { colors } from '../../src/theme/colors';
import { useTheme, useUIProfile } from '../../src/theme/ThemeContext';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { shadows } from '../../src/theme/shadows';
import Card from '../../src/components/ui/Card';
import IconBadge from '../../src/components/ui/IconBadge';
import PremiumButton from '../../src/components/ui/PremiumButton';
import DailyMissionsButtonCard from '../../src/components/DailyMissionsButtonCard';
import MissionsModalSheet from '../../src/components/MissionsModalSheet';
import PlayChooserPanel from '../../src/components/PlayChooserPanel';
import DeveloperPanel from '../../src/components/DeveloperPanel';
import { IS_DEV } from '../../src/config/devConfig';

// ── Daily Puzzle Card ──
function DailyPuzzleCard({ router }: { router: ReturnType<typeof useRouter> }) {
  const t = useTheme();
  const completedToday = useDailyPuzzleStore((s) => s.completedToday);
  const todayPuzzle = useDailyPuzzleStore((s) => s.getTodayPuzzle)();

  return (
    <TouchableOpacity
      style={[dpStyles.card, { backgroundColor: t.card, borderColor: t.border }]}
      activeOpacity={0.85}
      onPress={() => {
        if (!completedToday) router.push('/daily');
      }}
    >
      <View style={dpStyles.left}>
        <IconBadge
          name="today-outline"
          size={22}
          color={colors.accent}
          backgroundColor={colors.accent + '14'}
          badgeSize={44}
        />
        <View style={{ flex: 1 }}>
          <Text style={dpStyles.title}>Bugünün Bulmacası</Text>
          <Text style={dpStyles.sub}>{todayPuzzle.title}</Text>
          <View style={dpStyles.rewardsRow}>
            <Ionicons name="wallet-outline" size={12} color={colors.textSecondary} />
            <Text style={dpStyles.rewards}> {DAILY_COIN_REWARD}</Text>
            <Text style={dpStyles.rewardsDot}>  ·  </Text>
            <Ionicons name="sparkles" size={12} color={colors.textSecondary} />
            <Text style={dpStyles.rewards}> {DAILY_XP_REWARD} XP</Text>
          </View>
        </View>
      </View>
      <View style={[dpStyles.ctaBadge, completedToday && dpStyles.ctaDone, !completedToday && { backgroundColor: t.primary }]}>
        <Text style={[dpStyles.ctaText, completedToday && dpStyles.ctaDoneText]}>
          {completedToday ? 'Tamamlandı' : 'Başla'}
        </Text>
        {!completedToday && (
          <Ionicons name="play" size={14} color={colors.textInverse} style={{ marginLeft: 4 }} />
        )}
        {completedToday && (
          <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginLeft: 4 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const dpStyles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    flexDirection: 'column',
    gap: spacing.sm,
    ...shadows.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rewards: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rewardsDot: {
    ...typography.caption,
    color: colors.textMuted,
  },
  ctaBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaDone: {
    backgroundColor: colors.fill,
  },
  ctaText: {
    ...typography.subheadline,
    fontWeight: '600',
    color: colors.textInverse,
  },
  ctaDoneText: {
    color: colors.success,
  },
});

// ── Mission Card (inline) ──
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
        <View style={mStyles.rewardsRow}>
          <Ionicons name="wallet-outline" size={11} color={colors.textSecondary} />
          <Text style={mStyles.reward}> {mission.rewardCoins}  ·  </Text>
          <Ionicons name="sparkles" size={11} color={colors.textSecondary} />
          <Text style={mStyles.reward}> {mission.rewardXP} XP</Text>
        </View>
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
          <Text style={mStyles.claimText}>Ödülü Al</Text>
        </TouchableOpacity>
      )}
      {mission.claimed && (
        <View style={mStyles.claimedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={mStyles.claimedText}> Alındı</Text>
        </View>
      )}
    </View>
  );
}

const mStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.sm,
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
    borderRadius: 6,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textInverse,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reward: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    fontSize: 15,
  },
  desc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.fill,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  claimBtn: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  claimText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  claimedBadge: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  const t = useTheme();
  const ui = useUIProfile();
  const progress = useProgressStore((s) => s.progress);
  const loaded = useProgressStore((s) => s.loaded);

  const coins = useEconomyStore((s) => s.coins);
  const buyStreakFreeze = useEconomyStore((s) => s.buyStreakFreeze);

  const missions = useMissionsStore((s) => s.missions);
  const claimMission = useMissionsStore((s) => s.claimMission);
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions);

  const { currentStreak, longestStreak, totalXP, weeklyXP, currentLevel: playerLevel, streakFreezes } = useGamificationStore();
  const league = useLeagueStore((s) => s.league);
  const ensureWeeklyLeague = useLeagueStore((s) => s.ensureWeeklyLeague);
  const leagueRank = useLeagueStore((s) => s.getRank(weeklyXP));
  const promotionXP = useLeagueStore((s) => s.getPromotionThreshold());
  const leagueMeta = LEAGUE_META[league];

  const [shopVisible, setShopVisible] = useState(false);
  const [missionsModalVisible, setMissionsModalVisible] = useState(false);
  const [devPanelVisible, setDevPanelVisible] = useState(false);
  const [playModeVisible, setPlayModeVisible] = useState(false);

  useEffect(() => {
    ensureDailyMissions();
    // Generate weekly league if needed
    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    weekStart.setDate(weekStart.getDate() - diff);
    const weekKey = weekStart.toISOString().split('T')[0];
    ensureWeeklyLeague(weekKey, weeklyXP);
  }, []);

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
      Alert.alert('Ödül Alındı', `${result.coins} coin kazandın!`);
    }
  };

  const handleBuyFreeze = () => {
    if (buyStreakFreeze()) {
      Alert.alert('Satın Alındı', '1 Seri Dondurucu eklendi.');
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

  const isDark = t.id === 'black';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={['top']}>
      {/* Gradient background for dark theme */}
      {isDark && (
        <LinearGradient
          colors={['#0B1020', '#05070F']}
          style={StyleSheet.absoluteFill}
        />
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <LinearGradient
          colors={isDark ? ['#5E8BFF', '#7B61FF'] as const : t.gradientPrimary as readonly [string, string]}
          start={isDark ? { x: 0, y: 0 } : { x: 0, y: 0 }}
          end={isDark ? { x: 1, y: 1 } : { x: 1, y: 1 }}
          style={styles.hero}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
            }}
          >
            <Text style={[styles.heroTitle, { fontSize: ui.fontSizes.hero }]}>Kare Bulmaca</Text>
            <Text style={[styles.heroSubtitle, { fontSize: ui.fontSizes.subheadline }]}>Türkçe Çengel Bulmaca</Text>
            {IS_DEV && (
              <View style={styles.devBadge}>
                <Text style={styles.devBadgeText}>DEV</Text>
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
          <Card style={styles.statCard} variant="elevated" padding="md">
            <IconBadge name="checkmark-circle" size={18} color={colors.success} badgeSize={34} />
            <Text style={[styles.statValue, { color: t.text, fontSize: ui.fontSizes.h3 }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: t.textSecondary, fontSize: ui.fontSizes.label }]}>Tamamlanan</Text>
          </Card>

          <Card style={styles.statCard} variant="elevated" padding="md">
            <IconBadge name="star" size={18} color={colors.accent} badgeSize={34} />
            <Text style={[styles.statValue, { color: t.text, fontSize: ui.fontSizes.h3 }]}>{totalStars}</Text>
            <Text style={[styles.statLabel, { color: t.textSecondary, fontSize: ui.fontSizes.label }]}>Yıldız</Text>
          </Card>

          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => IS_DEV && setDevPanelVisible(true)}
            delayLongPress={2000}
            style={{ flex: 1 }}
          >
            <Card style={styles.statCard} variant="elevated" padding="md">
              <IconBadge name="wallet" size={18} color={t.primary} badgeSize={34} />
              <Text style={[styles.statValue, { color: t.text, fontSize: ui.fontSizes.h3 }]}>{IS_DEV ? '∞' : coins}</Text>
              <Text style={[styles.statLabel, { color: t.textSecondary, fontSize: ui.fontSizes.label }]}>Coin</Text>
            </Card>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Play CTA ── */}
        <View style={styles.playCta}>
          {/* Radial glow behind OYNA for dark */}
          {isDark && ui.glow && (
            <View style={{
              position: 'absolute',
              top: -20,
              left: '15%',
              right: '15%',
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(94,139,255,0.08)',
            }} />
          )}
          <PremiumButton
            title="OYNA"
            icon="play"
            onPress={() => setPlayModeVisible(true)}
            style={{ width: '100%' }}
          />
        </View>

        {/* ── Play Mode Cards (always visible) ── */}
        <View style={styles.playCardsRow}>
          <TouchableOpacity
            style={[
              styles.playCard,
              {
                backgroundColor: isDark ? '#131A2E' : t.card,
                borderColor: t.border,
                minHeight: Math.round(130 * ui.spacingScale),
                borderRadius: ui.cardBorderRadius + 8,
                ...(ui.shadow === 'full' ? shadows.sm : ui.shadowStyle),
              },
              isDark && ui.glow && { shadowColor: t.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16 },
            ]}
            activeOpacity={0.82}
            onPress={() => router.push('/(tabs)/chapters')}
          >
            <IconBadge name="map-outline" size={26} color={t.primary} badgeSize={56} />
            <Text style={[styles.playCardTitle, { color: isDark ? '#F3F4F6' : t.text, fontSize: ui.fontSizes.headline }]}>Bolumler</Text>
            <Text style={[styles.playCardSub, { color: t.textSecondary, fontSize: ui.fontSizes.caption }]}>Seviye seviye ilerle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playCard,
              {
                backgroundColor: isDark ? '#131A2E' : t.card,
                borderColor: t.border,
                minHeight: Math.round(130 * ui.spacingScale),
                borderRadius: ui.cardBorderRadius + 8,
                ...(ui.shadow === 'full' ? shadows.sm : ui.shadowStyle),
              },
              isDark && ui.glow && { shadowColor: t.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16 },
            ]}
            activeOpacity={0.82}
            onPress={() => router.push('/big-puzzle')}
          >
            <IconBadge name="grid-outline" size={26} color={colors.accent} badgeSize={56} />
            <Text style={[styles.playCardTitle, { color: isDark ? '#F3F4F6' : t.text, fontSize: ui.fontSizes.headline }]}>Buyuk Bulmaca</Text>
            <Text style={[styles.playCardSub, { color: t.textSecondary, fontSize: ui.fontSizes.caption }]}>Rastgele, buyuk boy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.playHint}>
          Son kaldigin yer: Seviye {progress.find((p) => !p.completed)?.levelId ?? levels.length}
        </Text>

        {/* ── Daily Streak Card ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.streakCard} variant="accent" padding="lg">
            <View style={styles.streakRow}>
              <IconBadge
                name="flame"
                size={22}
                color="#FF6723"
                backgroundColor="#FF672318"
                badgeSize={44}
              />
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

        {/* ── League Card ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.leagueCard} variant="elevated" padding="lg">
            <View style={styles.leagueRow}>
              <View style={[styles.leagueIconBadge, { backgroundColor: leagueMeta.color + '18' }]}>
                <Ionicons
                  name={leagueMeta.icon as any}
                  size={22}
                  color={leagueMeta.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leagueTitle}>{leagueMeta.label} Lig</Text>
                <Text style={styles.leagueSub}>
                  Sıralama: #{leagueRank} · {weeklyXP} XP bu hafta
                </Text>
              </View>
            </View>
            {promotionXP > 0 && (
              <View style={styles.leaguePromoRow}>
                <View style={styles.leaguePromoBarTrack}>
                  <View
                    style={[
                      styles.leaguePromoBarFill,
                      {
                        width: `${Math.min(100, (weeklyXP / promotionXP) * 100)}%`,
                        backgroundColor: leagueMeta.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.leaguePromoText}>
                  Yükselme: {promotionXP} XP
                </Text>
              </View>
            )}
          </Card>
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
            <Ionicons name="bag-outline" size={16} color={t.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.shopButtonText, { color: t.primary }]}>Mağaza</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Daily Puzzle Card ── */}
        <DailyPuzzleCard router={router} />

        {/* ── Daily Missions Card Button ── */}
        <DailyMissionsButtonCard
          completedCount={missions.filter((m) => m.completed).length}
          totalCount={missions.length}
          onPress={() => setMissionsModalVisible(true)}
        />
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
            <Text style={styles.shopTitle}>Mağaza</Text>
            <View style={styles.shopCoinsRow}>
              <Ionicons name="wallet" size={16} color={colors.textSecondary} />
              <Text style={styles.shopCoins}> {coins} Coin</Text>
            </View>

            {/* Streak Freeze */}
            <TouchableOpacity style={styles.shopItem} onPress={handleBuyFreeze}>
              <View style={styles.shopItemLeft}>
                <IconBadge
                  name="snow"
                  size={20}
                  color="#5AC8FA"
                  backgroundColor="#5AC8FA14"
                  badgeSize={40}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopItemTitle}>Seri Dondurucu</Text>
                  <Text style={styles.shopItemDesc}>
                    1 gün oynamasan da serin korunsun (Mevcut: {streakFreezes})
                  </Text>
                </View>
              </View>
              <View style={[styles.shopPriceBadge, { backgroundColor: t.primary }]}>
                <Text style={styles.shopPriceText}>{STREAK_FREEZE_COST}</Text>
              </View>
            </TouchableOpacity>

            {/* Info card */}
            <View style={styles.shopInfoCard}>
              <View style={styles.shopInfoTitleRow}>
                <Ionicons name="information-circle-outline" size={16} color={t.primary} />
                <Text style={[styles.shopInfoTitle, { color: t.primary }]}> İpuçları</Text>
              </View>
              <Text style={styles.shopInfoDesc}>
                Oyun sırasında İpucu butonuna basarak harf veya kelime açabilirsin.
                {'\n'}Harf: 10 coin  ·  Kelime: 25 coin
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

      {/* ── Play Chooser Panel ── */}
      <PlayChooserPanel
        visible={playModeVisible}
        onClose={() => setPlayModeVisible(false)}
        options={[
          {
            title: 'Bolumler',
            subtitle: 'Seviye seviye ilerle',
            icon: 'map-outline',
            iconColor: t.primary,
            onPress: () => router.push('/(tabs)/chapters'),
          },
          {
            title: 'Buyuk Bulmaca',
            subtitle: 'Rastgele, buyuk boy',
            icon: 'grid-outline',
            iconColor: colors.accent,
            onPress: () => router.push('/big-puzzle'),
          },
        ]}
      />

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
    ...typography.headline,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // ── Hero ──
  hero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
  xpBarTrack: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 2,
  },
  xpLabelText: {
    ...typography.label,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  heroTitle: {
    ...typography.hero,
    color: colors.textInverse,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.subheadline,
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing.xs,
  },
  devBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
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
    gap: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  // ── Play CTA ──
  playCta: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: 0,
  },
  playCardsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: 14,
    gap: 12,
  },
  playCard: {
    flex: 1,
    minHeight: 130,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  playCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  playCardSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  playHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
  },
  // ── CTA ──
  ctaContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.fill,
  },
  shopButtonText: {
    ...typography.subheadline,
    fontWeight: '600',
    color: colors.primary,
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
  streakTitle: {
    ...typography.headline,
    color: colors.text,
  },
  streakSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // ── League ──
  leagueCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  leagueIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueTitle: {
    ...typography.headline,
    color: colors.text,
  },
  leagueSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  leaguePromoRow: {
    marginTop: spacing.sm,
  },
  leaguePromoBarTrack: {
    height: 6,
    backgroundColor: colors.fill,
    borderRadius: 3,
    overflow: 'hidden',
  },
  leaguePromoBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  leaguePromoText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 11,
  },
  // ── Shop Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  shopSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  shopHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.fill,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  shopTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  shopCoinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  shopCoins: {
    ...typography.body,
    color: colors.textSecondary,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
  },
  shopItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  shopItemTitle: {
    ...typography.headline,
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
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  shopPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  shopInfoCard: {
    backgroundColor: colors.fill,
    padding: spacing.md,
    borderRadius: 14,
    marginTop: spacing.sm,
  },
  shopInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopInfoTitle: {
    ...typography.subheadline,
    fontWeight: '600',
    color: colors.primary,
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
