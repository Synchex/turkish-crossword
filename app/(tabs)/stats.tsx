import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStatsStore, computeDerived } from '../../src/store/useStatsStore';
import { useGamificationStore, getXPForNextLevel } from '../../src/store/useGamificationStore';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';

// ── Animated Bar ──
function AnimatedBar({ value, maxValue, color }: { value: number; maxValue: number; color: string }) {
    const widthAnim = useRef(new Animated.Value(0)).current;
    const percent = maxValue > 0 ? Math.min(1, value / maxValue) : 0;

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: percent,
            duration: 800,
            delay: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [percent]);

    return (
        <View style={barStyles.track}>
            <Animated.View
                style={[
                    barStyles.fill,
                    {
                        backgroundColor: color,
                        width: widthAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                    },
                ]}
            />
        </View>
    );
}

const barStyles = StyleSheet.create({
    track: {
        height: 8,
        backgroundColor: colors.borderLight,
        borderRadius: 4,
        overflow: 'hidden',
        flex: 1,
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
});

// ── Format Time ──
function formatTime(sec: number): string {
    if (sec === 0) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Main Stats Screen ──
export default function StatsScreen() {
    const stats = useStatsStore();
    const { currentStreak, longestStreak, totalXP, currentLevel } = useGamificationStore();
    const { accuracyPercent, averageSolveTimeSec } = computeDerived(stats);
    const nextLevelXP = getXPForNextLevel(currentLevel);

    // Find max count in last7Days for bar scaling
    const maxDayCount = Math.max(1, ...stats.last7Days.map((d) => d.count));

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{currentLevel}</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>İstatistikler</Text>
                            <Text style={styles.headerSub}>{totalXP} XP · Seviye {currentLevel}</Text>
                        </View>
                    </View>

                    {/* ── Streak Card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🔥 Seri</Text>
                        <View style={styles.row}>
                            <View style={styles.statItem}>
                                <Text style={styles.statBig}>{currentStreak}</Text>
                                <Text style={styles.statLabel}>Güncel Seri</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statBig}>{longestStreak}</Text>
                                <Text style={styles.statLabel}>En Uzun</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Performance Card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📊 Performans</Text>
                        <View style={styles.perfRow}>
                            <View style={styles.perfItem}>
                                <Text style={[styles.perfValue, accuracyPercent >= 80 && { color: colors.success }]}>
                                    %{accuracyPercent}
                                </Text>
                                <Text style={styles.perfLabel}>Doğruluk</Text>
                            </View>
                            <View style={styles.perfItem}>
                                <Text style={styles.perfValue}>{formatTime(averageSolveTimeSec)}</Text>
                                <Text style={styles.perfLabel}>Ort. Süre</Text>
                            </View>
                            <View style={styles.perfItem}>
                                <Text style={[styles.perfValue, { color: colors.accent }]}>
                                    {formatTime(stats.fastestSolveTimeSec)}
                                </Text>
                                <Text style={styles.perfLabel}>En Hızlı</Text>
                            </View>
                        </View>

                        <View style={styles.accuracyBar}>
                            <Text style={styles.accuracyLabel}>Doğruluk</Text>
                            <AnimatedBar value={accuracyPercent} maxValue={100} color={colors.success} />
                            <Text style={styles.accuracyPct}>{accuracyPercent}%</Text>
                        </View>
                    </View>

                    {/* ── Totals Card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🏆 Toplamlar</Text>
                        <View style={styles.totalsGrid}>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{stats.totalPuzzlesSolved}</Text>
                                <Text style={styles.totalLabel}>Bulmaca</Text>
                            </View>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{stats.totalDailySolved}</Text>
                                <Text style={styles.totalLabel}>Günlük</Text>
                            </View>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{stats.totalCorrectWords}</Text>
                                <Text style={styles.totalLabel}>Doğru Kelime</Text>
                            </View>
                            <View style={styles.totalItem}>
                                <Text style={styles.totalValue}>{stats.totalMistakes}</Text>
                                <Text style={styles.totalLabel}>Hata</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Last 7 Days Mini Bars ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📅 Son 7 Gün</Text>
                        {stats.last7Days.length === 0 ? (
                            <Text style={styles.emptyText}>Henüz veri yok. Bulmaca çözerek başla!</Text>
                        ) : (
                            <View style={styles.barsContainer}>
                                {stats.last7Days.map((day) => {
                                    const barHeight = Math.max(8, (day.count / maxDayCount) * 80);
                                    const dayLabel = day.dateKey.slice(5); // MM-DD
                                    return (
                                        <View key={day.dateKey} style={styles.barColumn}>
                                            <Text style={styles.barCount}>{day.count}</Text>
                                            <View style={[styles.bar, { height: barHeight, backgroundColor: colors.primary }]} />
                                            <Text style={styles.barDate}>{dayLabel}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    levelBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelText: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textInverse,
    },
    headerTitle: {
        ...typography.h1,
        color: colors.text,
    },
    headerSub: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    // ── Card ──
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cardTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
    },
    // ── Streak ──
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
    },
    statItem: {
        alignItems: 'center',
    },
    statBig: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.primary,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    // ── Performance ──
    perfRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    perfItem: {
        alignItems: 'center',
    },
    perfValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
    },
    perfLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    accuracyBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: spacing.sm,
    },
    accuracyLabel: {
        ...typography.caption,
        color: colors.textMuted,
        width: 60,
    },
    accuracyPct: {
        ...typography.caption,
        color: colors.textMuted,
        width: 35,
        textAlign: 'right',
    },
    // ── Totals ──
    totalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    totalItem: {
        width: '47%',
        backgroundColor: colors.cardAlt,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: 'center',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    totalLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    // ── Last 7 Days ──
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 110,
        paddingTop: spacing.sm,
    },
    barColumn: {
        alignItems: 'center',
        flex: 1,
    },
    barCount: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: 4,
        fontSize: 10,
    },
    bar: {
        width: 24,
        borderRadius: 4,
    },
    barDate: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 4,
        fontSize: 9,
    },
    emptyText: {
        ...typography.body,
        color: colors.textMuted,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
});
