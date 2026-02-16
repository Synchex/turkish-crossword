import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMissionsStore, Mission } from '../store/useMissionsStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import IconBadge from './ui/IconBadge';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.72;

// ── Individual Mission Card ──
function MissionItem({
    mission,
    onClaim,
}: {
    mission: Mission;
    onClaim: (id: string) => void;
}) {
    const progressPercent = Math.min(1, mission.progress / mission.target);
    const diffColors: Record<string, string> = {
        easy: colors.success,
        medium: colors.accent,
        hard: colors.secondary,
    };
    const barColor = diffColors[mission.difficulty] ?? colors.primary;
    const diffLabel =
        mission.difficulty === 'easy'
            ? 'KOLAY'
            : mission.difficulty === 'medium'
                ? 'ORTA'
                : 'ZOR';

    return (
        <View style={itemStyles.card}>
            {/* Header: difficulty badge + rewards */}
            <View style={itemStyles.header}>
                <View style={[itemStyles.diffBadge, { backgroundColor: barColor }]}>
                    <Text style={itemStyles.diffText}>{diffLabel}</Text>
                </View>
                <View style={itemStyles.rewardsRow}>
                    <Ionicons name="wallet-outline" size={11} color={colors.textSecondary} />
                    <Text style={itemStyles.reward}> {mission.rewardCoins}  ·  </Text>
                    <Ionicons name="sparkles" size={11} color={colors.textSecondary} />
                    <Text style={itemStyles.reward}> {mission.rewardXP} XP</Text>
                </View>
            </View>

            {/* Title + description */}
            <Text style={itemStyles.title}>{mission.title}</Text>
            <Text style={itemStyles.desc}>{mission.description}</Text>

            {/* Progress bar */}
            <View style={itemStyles.progressTrack}>
                <View
                    style={[
                        itemStyles.progressFill,
                        {
                            width: `${progressPercent * 100}%`,
                            backgroundColor: barColor,
                        },
                    ]}
                />
            </View>
            <Text style={itemStyles.progressLabel}>
                {mission.progress}/{mission.target}
            </Text>

            {/* Claim / Claimed / In-progress */}
            {mission.completed && !mission.claimed && (
                <TouchableOpacity
                    style={[itemStyles.claimBtn, { backgroundColor: barColor }]}
                    onPress={() => onClaim(mission.id)}
                    activeOpacity={0.75}
                >
                    <Text style={itemStyles.claimBtnText}>Topla</Text>
                    <Ionicons name="arrow-down-circle" size={16} color={colors.textInverse} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            )}
            {mission.claimed && (
                <View style={itemStyles.claimedRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={itemStyles.claimedText}> Alındı</Text>
                </View>
            )}
        </View>
    );
}

const itemStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    diffBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
    },
    diffText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textInverse,
        letterSpacing: 0.5,
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
        marginTop: 2,
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
    progressLabel: {
        ...typography.label,
        color: colors.textMuted,
        marginTop: 4,
        textAlign: 'right',
    },
    claimBtn: {
        marginTop: spacing.sm,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    claimBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textInverse,
    },
    claimedRow: {
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

// ── Empty / Loading state ──
function EmptyState() {
    return (
        <View style={emptyStyles.container}>
            <IconBadge
                name="mail-open-outline"
                size={32}
                color={colors.textMuted}
                badgeSize={64}
            />
            <Text style={emptyStyles.title}>Bugün görev yok</Text>
            <Text style={emptyStyles.sub}>
                Yarın yeni görevler gelecek, takipte kal!
            </Text>
        </View>
    );
}

const emptyStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        gap: spacing.sm,
    },
    title: {
        ...typography.headline,
        color: colors.text,
    },
    sub: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

// ── Main Modal Sheet ──
interface Props {
    visible: boolean;
    missions: Mission[];
    onClaim: (id: string) => void;
    onClose: () => void;
}

export default function MissionsModalSheet({
    visible,
    missions,
    onClaim,
    onClose,
}: Props) {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const storeMissions = useMissionsStore((s) => s.missions);
    const displayMissions = missions.length > 0 ? missions : storeMissions;

    useEffect(() => {
        if (visible) {
            useMissionsStore.getState().ensureDailyMissions();

            slideAnim.setValue(SCREEN_HEIGHT);
            fadeAnim.setValue(0);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 65,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={sheetStyles.container}>
                <Animated.View
                    style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
                >
                    <BlurView
                        intensity={40}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={sheetStyles.darkTint} />
                </Animated.View>

                <TouchableOpacity
                    style={sheetStyles.dismissArea}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    style={[
                        sheetStyles.sheet,
                        {
                            maxHeight: SHEET_MAX_HEIGHT,
                            paddingBottom: Math.max(insets.bottom, spacing.lg),
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={sheetStyles.handleRow}>
                        <View style={sheetStyles.handle} />
                    </View>

                    <View style={sheetStyles.headerRow}>
                        <Text style={sheetStyles.sheetTitle}>Günlük Görevler</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={sheetStyles.closeBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={sheetStyles.subtitle}>
                        Görevleri tamamlayarak coin ve XP kazan!
                    </Text>

                    {displayMissions.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            bounces
                            contentContainerStyle={sheetStyles.scrollContent}
                        >
                            {displayMissions.map((m) => (
                                <MissionItem key={m.id} mission={m} onClaim={onClaim} />
                            ))}
                        </ScrollView>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const sheetStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    darkTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    dismissArea: {
        flex: 1,
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        minHeight: 200,
    },
    handleRow: {
        alignItems: 'center',
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.fill,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    sheetTitle: {
        ...typography.h2,
        color: colors.text,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.fill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    scrollContent: {
        gap: 12,
        paddingBottom: spacing.md,
    },
});
