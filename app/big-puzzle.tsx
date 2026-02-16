import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// ── AI Loading Messages ──
const AI_MESSAGES = [
    'Bulmaca hazırlanıyor...',
    'Zorluk ayarlanıyor...',
    'İpuçları seçiliyor...',
    'Kelimeler yerleştiriliyor...',
    'Son kontroller yapılıyor...',
];

// ── AI Loading Overlay Component ──
function AILoadingOverlay() {
    const [messageIdx, setMessageIdx] = useState(0);
    const sparkleRotation = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        // Rotate messages every 400ms
        const interval = setInterval(() => {
            setMessageIdx((i) => (i + 1) % AI_MESSAGES.length);
        }, 400);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(sparkleRotation, {
                    toValue: 15,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(sparkleRotation, {
                    toValue: -15,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const rotateInterpolation = sparkleRotation.interpolate({
        inputRange: [-15, 15],
        outputRange: ['-15deg', '15deg'],
    });

    return (
        <Animated.View
            style={[overlayStyles.container, { opacity: overlayOpacity }]}
        >
            <View style={overlayStyles.card}>
                <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                    <Ionicons name="sparkles" size={40} color={colors.primary} />
                </Animated.View>
                <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ marginTop: spacing.md }}
                />
                <Text style={overlayStyles.message}>{AI_MESSAGES[messageIdx]}</Text>
                <Text style={overlayStyles.sub}>Yapay zekâ çalışıyor</Text>
            </View>
        </Animated.View>
    );
}

const overlayStyles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xxl,
        alignItems: 'center',
        ...shadows.lg,
        minWidth: 240,
    },
    message: {
        ...typography.headline,
        color: colors.text,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    sub: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});

// ── Main Screen ──

export default function BigPuzzleScreen() {
    const router = useRouter();
    const config = useBigPuzzleStore((s) => s.config);
    const setConfig = useBigPuzzleStore((s) => s.setConfig);
    const isGenerating = useBigPuzzleStore((s) => s.isGenerating);
    const generate = useBigPuzzleStore((s) => s.generate);

    const [showOverlay, setShowOverlay] = useState(false);
    const isBusyRef = useRef(false);

    // CTA animation
    const ctaScale = useRef(new Animated.Value(1)).current;

    // ── Generate handler with fake AI delay ──
    const handleGenerate = useCallback(async () => {
        if (isBusyRef.current) return;
        isBusyRef.current = true;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Show the AI overlay
        setShowOverlay(true);

        // Randomized minimum display time (800–1400ms)
        const minDelay = 800 + Math.random() * 600;
        const delayPromise = new Promise<void>((r) => setTimeout(r, minDelay));

        // Run generate + minimum delay in parallel
        const [result] = await Promise.all([generate(), delayPromise]);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Small extra beat before navigating
        await new Promise<void>((r) => setTimeout(r, 150));

        setShowOverlay(false);
        isBusyRef.current = false;

        router.push(`/game/big_${result.puzzleId}`);
    }, [generate, router]);

    const isBusy = showOverlay || isGenerating;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── AI Generating Overlay ── */}
            {showOverlay && <AILoadingOverlay />}

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
                        AI destekli bulmaca üretici
                    </Text>
                </LinearGradient>

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
                        <Text style={styles.bannerTitle}>Yapay Zekâ Üretici</Text>
                        <Text style={styles.bannerSub}>
                            Ayarları seç, AI senin için bulmaca üretsin.
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
                <Animated.View
                    style={[styles.ctaWrapper, { transform: [{ scale: ctaScale }] }]}
                >
                    <Pressable
                        onPress={handleGenerate}
                        onPressIn={() => {
                            Animated.spring(ctaScale, { toValue: 0.96, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
                        }}
                        onPressOut={() => {
                            Animated.spring(ctaScale, { toValue: 1, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
                        }}
                        disabled={isBusy}
                    >
                        <LinearGradient
                            colors={colors.gradientPrimary as readonly [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaGradient}
                        >
                            <Ionicons
                                name="sparkles"
                                size={20}
                                color={colors.textInverse}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.ctaText}>Bulmaca Oluştur</Text>
                        </LinearGradient>
                    </Pressable>
                </Animated.View>

                {/* ── AI Hint badge ── */}
                <View style={styles.aiBadge}>
                    <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
                    <Text style={styles.aiBadgeText}>AI ile üretilir</Text>
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
    // ── Banner ──
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
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
    // ── AI Badge ──
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: spacing.md,
    },
    aiBadgeText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '500',
    },
});
