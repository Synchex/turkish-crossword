import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { typography } from '../src/theme/typography';
import { shadows } from '../src/theme/shadows';
import IconBadge from '../src/components/ui/IconBadge';
import {
    useBigPuzzleStore,
    BigPuzzleSize,
    BigPuzzleDifficulty,
} from '../src/store/useBigPuzzleStore';
import { PREBUILT_META } from '../src/data/prebuiltBigPuzzles';

// ── Size Options ──
const SIZE_OPTIONS: { value: BigPuzzleSize; label: string; enabled: boolean }[] = [
    { value: 15, label: '15 x 15', enabled: true },
    { value: 17, label: '17 x 17', enabled: false },
    { value: 21, label: '21 x 21', enabled: false },
];

// ── Difficulty Options ──
const DIFF_OPTIONS: { value: BigPuzzleDifficulty; label: string }[] = [
    { value: 'easy', label: 'Kolay' },
    { value: 'medium', label: 'Orta' },
    { value: 'hard', label: 'Zor' },
];

// ── Theme Options ──
const THEME_OPTIONS = ['Genel'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BigPuzzleScreen() {
    const router = useRouter();
    const config = useBigPuzzleStore((s) => s.config);
    const setConfig = useBigPuzzleStore((s) => s.setConfig);
    const isLoading = useBigPuzzleStore((s) => s.isLoading);
    const generate = useBigPuzzleStore((s) => s.generate);
    const selectPrebuilt = useBigPuzzleStore((s) => s.selectPrebuilt);
    const prebuiltPuzzles = useBigPuzzleStore((s) => s.prebuiltPuzzles);

    // CTA animation
    const ctaScale = useSharedValue(1);
    const ctaAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ctaScale.value }],
    }));

    // ── Generate handler — always navigates (fallback is silent) ──
    const handleGenerate = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const puzzleId = generate();

        if (puzzleId) {
            router.push(`/game/big_${puzzleId}`);
        }
        // generate() now always returns a valid ID (prebuilt fallback),
        // so the above condition is always true.
    }, [generate, router]);

    // ── Prebuilt card tap ──
    const handlePrebuiltTap = useCallback(
        (id: number) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const key = selectPrebuilt(id);
            router.push(`/game/big_${key}`);
        },
        [selectPrebuilt, router],
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <LinearGradient
                    colors={colors.gradientPrimary as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.85)" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Büyük Bulmaca</Text>
                    <Text style={styles.headerSub}>
                        Rastgele büyük boy bulmaca
                    </Text>
                </LinearGradient>

                {/* ══════════════════════════════════════ */}
                {/* ── Hazır Bulmacalar Section ──        */}
                {/* ══════════════════════════════════════ */}
                <View style={styles.prebuiltSection}>
                    <View style={styles.prebuiltHeader}>
                        <IconBadge
                            name="library-outline"
                            size={22}
                            color={colors.primary}
                            backgroundColor={colors.primary + '14'}
                            badgeSize={44}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.prebuiltTitle}>Hazır Bulmacalar</Text>
                            <Text style={styles.prebuiltSub}>Hemen oyna</Text>
                        </View>
                    </View>

                    {prebuiltPuzzles.map((puzzle, idx) => {
                        const meta = PREBUILT_META.find((m) => m.id === puzzle.id);
                        return (
                            <Pressable
                                key={puzzle.id}
                                style={({ pressed }) => [
                                    styles.puzzleCard,
                                    pressed && styles.puzzleCardPressed,
                                ]}
                                onPress={() => handlePrebuiltTap(puzzle.id)}
                            >
                                {/* Left — Info */}
                                <View style={styles.puzzleCardLeft}>
                                    <Text style={styles.puzzleCardName}>
                                        Büyük Bulmaca #{idx + 1}
                                    </Text>
                                    <View style={styles.tagsRow}>
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>15×15</Text>
                                        </View>
                                        <View style={[styles.tag, styles.tagDifficulty]}>
                                            <Text style={styles.tagText}>
                                                {meta?.difficultyLabel ?? 'Orta'}
                                            </Text>
                                        </View>
                                        <View style={[styles.tag, styles.tagTheme]}>
                                            <Text style={styles.tagText}>
                                                {meta?.theme ?? 'Genel'}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Progress (0% for now) */}
                                    <View style={styles.progressRow}>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: '0%' }]} />
                                        </View>
                                        <Text style={styles.progressText}>0%</Text>
                                    </View>
                                </View>

                                {/* Right — Play button */}
                                <LinearGradient
                                    colors={colors.gradientPrimary as readonly [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.playBtn}
                                >
                                    <Ionicons name="play" size={16} color={colors.textInverse} />
                                    <Text style={styles.playBtnText}>Oyna</Text>
                                </LinearGradient>
                            </Pressable>
                        );
                    })}
                </View>

                {/* ── Status Banner ── */}
                <View style={styles.banner}>
                    <IconBadge
                        name="sparkles-outline"
                        size={24}
                        color={colors.accent}
                        backgroundColor={colors.accent + '14'}
                        badgeSize={48}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerTitle}>Rastgele Bulmaca</Text>
                        <Text style={styles.bannerSub}>
                            Ayarlari sec ve hemen oynamaya basla.
                        </Text>
                    </View>
                </View>

                {/* ── Configuration: Grid Size ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Boyut</Text>
                    <View style={styles.optionsRow}>
                        {SIZE_OPTIONS.map((opt) => {
                            const selected = config.size === opt.value;
                            return (
                                <Pressable
                                    key={opt.value}
                                    style={[
                                        styles.optionChip,
                                        selected && styles.optionChipSelected,
                                        !opt.enabled && styles.optionChipDisabled,
                                    ]}
                                    onPress={() => {
                                        if (opt.enabled) {
                                            Haptics.selectionAsync();
                                            setConfig({ size: opt.value });
                                        }
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionChipText,
                                            selected && styles.optionChipTextSelected,
                                            !opt.enabled && styles.optionChipTextDisabled,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                    {!opt.enabled && (
                                        <Ionicons
                                            name="lock-closed"
                                            size={10}
                                            color={colors.textMuted}
                                            style={{ marginLeft: 4 }}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* ── Configuration: Difficulty ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Zorluk</Text>
                    <View style={styles.optionsRow}>
                        {DIFF_OPTIONS.map((opt) => {
                            const selected = config.difficulty === opt.value;
                            return (
                                <Pressable
                                    key={opt.value}
                                    style={[
                                        styles.optionChip,
                                        selected && styles.optionChipSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setConfig({ difficulty: opt.value });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionChipText,
                                            selected && styles.optionChipTextSelected,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* ── Configuration: Theme ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tema</Text>
                    <View style={styles.optionsRow}>
                        {THEME_OPTIONS.map((t) => (
                            <Pressable
                                key={t}
                                style={[
                                    styles.optionChip,
                                    config.theme === t && styles.optionChipSelected,
                                ]}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setConfig({ theme: t });
                                }}
                            >
                                <Text
                                    style={[
                                        styles.optionChipText,
                                        config.theme === t && styles.optionChipTextSelected,
                                    ]}
                                >
                                    {t}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* ── Generate CTA ── */}
                <AnimatedPressable
                    onPress={handleGenerate}
                    onPressIn={() => {
                        ctaScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
                    }}
                    onPressOut={() => {
                        ctaScale.value = withSpring(1, { damping: 12, stiffness: 200 });
                    }}
                    style={[styles.ctaWrapper, ctaAnimStyle]}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={colors.gradientPrimary as readonly [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.ctaGradient}
                    >
                        {isLoading ? (
                            <Text style={styles.ctaText}>Oluşturuluyor...</Text>
                        ) : (
                            <>
                                <Ionicons
                                    name="shuffle"
                                    size={20}
                                    color={colors.textInverse}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.ctaText}>Rastgele Bulmaca Getir</Text>
                            </>
                        )}
                    </LinearGradient>
                </AnimatedPressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    // ── Header ──
    header: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        ...typography.hero,
        color: colors.textInverse,
    },
    headerSub: {
        ...typography.subheadline,
        color: 'rgba(255,255,255,0.72)',
        marginTop: 4,
    },
    // ══════════════════════════════
    // ── Prebuilt Puzzles Section ──
    // ══════════════════════════════
    prebuiltSection: {
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    prebuiltHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    prebuiltTitle: {
        ...typography.headline,
        color: colors.text,
    },
    prebuiltSub: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    // ── Puzzle card ──
    puzzleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...shadows.sm,
    },
    puzzleCardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    puzzleCardLeft: {
        flex: 1,
        marginRight: spacing.md,
    },
    puzzleCardName: {
        ...typography.headline,
        color: colors.text,
        marginBottom: 6,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: colors.primary + '14',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagDifficulty: {
        backgroundColor: colors.accent + '18',
    },
    tagTheme: {
        backgroundColor: colors.success + '18',
    },
    tagText: {
        ...typography.label,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBg: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.fill,
    },
    progressBarFill: {
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary,
    },
    progressText: {
        ...typography.label,
        color: colors.textMuted,
        fontWeight: '600',
    },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 4,
    },
    playBtnText: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.textInverse,
    },
    // ── Banner ──
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginHorizontal: spacing.md,
        marginTop: spacing.xl,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...shadows.sm,
    },
    bannerTitle: {
        ...typography.headline,
        color: colors.text,
    },
    bannerSub: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    // ── Sections ──
    section: {
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    sectionTitle: {
        ...typography.headline,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    optionChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.fill,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    optionChipSelected: {
        backgroundColor: colors.primary + '14',
        borderColor: colors.primary,
    },
    optionChipDisabled: {
        opacity: 0.45,
    },
    optionChipText: {
        ...typography.subheadline,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    optionChipTextSelected: {
        color: colors.primary,
    },
    optionChipTextDisabled: {
        color: colors.textMuted,
    },
    // ── CTA ──
    ctaWrapper: {
        marginHorizontal: spacing.md,
        marginTop: spacing.xl,
        borderRadius: 16,
        overflow: 'hidden',
        ...shadows.md,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 62,
        borderRadius: 16,
    },
    ctaText: {
        ...typography.button,
        color: colors.textInverse,
    },
});
