import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    Dimensions,
    Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import IconBadge from './ui/IconBadge';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const SHEET_PAD = 20;
const CARD_SIZE = (SCREEN_WIDTH - SHEET_PAD * 2 - CARD_GAP) / 2;

interface PlayOption {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    onPress: () => void;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    options: PlayOption[];
}

// ── Animated Option Card ──
function OptionCard({ opt, onPress }: { opt: PlayOption; onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;

    return (
        <Animated.View style={[styles.optionCard, { transform: [{ scale }] }]}>
            <Pressable
                onPressIn={() => {
                    Animated.spring(scale, { toValue: 0.96, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
                }}
                onPressOut={() => {
                    Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
                }}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, gap: 6 }}
            >
                <IconBadge
                    name={opt.icon}
                    size={26}
                    color={opt.iconColor}
                    badgeSize={56}
                />
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionSub}>{opt.subtitle}</Text>
                <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={colors.textMuted}
                    style={styles.optionChevron}
                />
            </Pressable>
        </Animated.View>
    );
}

export default function PlayModeSheet({ visible, onClose, options }: Props) {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            fadeAnim.setValue(0);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 9,
                    tension: 60,
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
                    duration: 220,
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

    const handleOptionPress = useCallback(
        (opt: PlayOption) => {
            onClose();
            setTimeout(() => opt.onPress(), 280);
        },
        [onClose],
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Blur overlay */}
                <Animated.View
                    style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
                >
                    <BlurView
                        intensity={50}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.darkTint} />
                </Animated.View>

                {/* Dismiss */}
                <Pressable style={styles.dismissArea} onPress={onClose} />

                {/* Sheet */}
                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            paddingBottom: Math.max(insets.bottom, spacing.xl),
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Handle */}
                    <View style={styles.handleRow}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.sheetTitle}>Oyun Sec</Text>
                            <Text style={styles.sheetSub}>
                                Nasil oynamak istiyorsun?
                            </Text>
                        </View>
                        <Pressable
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <Ionicons
                                name="close"
                                size={18}
                                color={colors.textSecondary}
                            />
                        </Pressable>
                    </View>

                    {/* 2-up Grid */}
                    <View style={styles.grid}>
                        {options.map((opt, i) => (
                            <OptionCard
                                key={i}
                                opt={opt}
                                onPress={() => handleOptionPress(opt)}
                            />
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    darkTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    dismissArea: {
        flex: 1,
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: SHEET_PAD,
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
        alignItems: 'flex-start',
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },
    sheetTitle: {
        ...typography.h2,
        color: colors.text,
    },
    sheetSub: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.fill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // ── Grid ──
    grid: {
        flexDirection: 'row',
        gap: CARD_GAP,
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    optionCard: {
        width: CARD_SIZE,
        aspectRatio: 0.95,
        backgroundColor: colors.card,
        borderRadius: 22,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...shadows.sm,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        gap: 6,
    },
    optionTitle: {
        ...typography.headline,
        color: colors.text,
        marginTop: 4,
        textAlign: 'center',
    },
    optionSub: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },
    optionChevron: {
        marginTop: 4,
    },
});
