import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';

// ── Sizes ──
const NODE_SIZE = 72;
const NODE_SIZE_NEXT = 82;
const INNER_SIZE = 54;
const INNER_SIZE_NEXT = 62;

interface LevelNodeProps {
    levelId: number;
    title: string;
    difficulty: string;
    gridSize: number;
    unlocked: boolean;
    completed: boolean;
    stars: number;
    isNext: boolean;
    index: number; // for staggered entry
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LevelNode({
    levelId,
    title,
    difficulty,
    unlocked,
    completed,
    stars,
    isNext,
    index,
    onPress,
}: LevelNodeProps) {
    // ── Shared values ──
    const scale = useSharedValue(1);
    const pulse = useSharedValue(1);
    const entryOpacity = useSharedValue(0);
    const entryTranslateY = useSharedValue(24);
    const glowOpacity = useSharedValue(0);

    // ── Entry animation (staggered) ──
    useEffect(() => {
        const delay = Math.min(index * 80, 600);
        entryOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
        entryTranslateY.value = withDelay(
            delay,
            withSpring(0, { damping: 14, stiffness: 120 })
        );
    }, []);

    // ── Pulse for current node ──
    useEffect(() => {
        if (isNext) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            cancelAnimation(pulse);
            pulse.value = withTiming(1, { duration: 200 });
        }
    }, [isNext]);

    // ── 3-star glow ──
    useEffect(() => {
        if (stars === 3) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1200 }),
                    withTiming(0.3, { duration: 1200 })
                ),
                -1,
                true
            );
        }
    }, [stars]);

    // ── Press handlers ──
    const handlePressIn = () => {
        if (!unlocked) return;
        scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 180 });
    };
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    // ── Animated styles ──
    const containerStyle = useAnimatedStyle(() => ({
        opacity: entryOpacity.value,
        transform: [
            { translateY: entryTranslateY.value },
            { scale: scale.value * pulse.value },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glowOpacity.value, [0, 1], [0, 0.6]),
    }));

    // ── Derived values ──
    const size = isNext ? NODE_SIZE_NEXT : NODE_SIZE;
    const innerSize = isNext ? INNER_SIZE_NEXT : INNER_SIZE;

    const diffColor =
        difficulty === 'Kolay'
            ? colors.success
            : difficulty === 'Orta'
                ? colors.accent
                : colors.secondary;

    const nodeColor = !unlocked
        ? '#CBD5E0'
        : completed
            ? colors.success
            : isNext
                ? colors.primary
                : colors.primaryLight;

    const bgTint = !unlocked
        ? '#E2E8F0'
        : completed
            ? colors.success + '18'
            : isNext
                ? colors.primary + '18'
                : colors.primaryLight + '12';

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.wrapper, containerStyle]}
        >
            {/* 3-star glow ring */}
            {stars === 3 && (
                <Animated.View
                    style={[
                        styles.glowRing,
                        {
                            width: size + 16,
                            height: size + 16,
                            borderRadius: (size + 16) / 2,
                            borderColor: colors.accent,
                        },
                        glowStyle,
                    ]}
                />
            )}

            {/* Outer ring */}
            <View
                style={[
                    styles.outerRing,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor: nodeColor,
                        backgroundColor: bgTint,
                    },
                    isNext && styles.nextShadow,
                ]}
            >
                {/* Inner circle */}
                <View
                    style={[
                        styles.innerCircle,
                        {
                            width: innerSize,
                            height: innerSize,
                            borderRadius: innerSize / 2,
                            backgroundColor: nodeColor,
                        },
                    ]}
                >
                    {completed ? (
                        <Text style={[styles.checkmark, isNext && styles.checkmarkLg]}>
                            ✓
                        </Text>
                    ) : unlocked ? (
                        <Text style={[styles.levelNumber, isNext && styles.levelNumberLg]}>
                            {levelId}
                        </Text>
                    ) : (
                        <Text style={styles.lockIcon}>🔒</Text>
                    )}
                </View>
            </View>

            {/* Star rating */}
            {completed && (
                <View style={styles.starsRow}>
                    {[1, 2, 3].map((i) => (
                        <Text key={i} style={[styles.star, i <= stars && styles.starFilled]}>
                            {i <= stars ? '★' : '☆'}
                        </Text>
                    ))}
                </View>
            )}

            {/* Title */}
            <Text
                style={[styles.title, !unlocked && styles.lockedTitle]}
                numberOfLines={1}
            >
                {title}
            </Text>

            {/* Difficulty badge */}
            <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
                <Text style={[styles.diffText, { color: diffColor }]}>
                    {difficulty}
                </Text>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        width: 130,
    },
    glowRing: {
        position: 'absolute',
        top: -8,
        borderWidth: 3,
        zIndex: -1,
    },
    outerRing: {
        borderWidth: 3.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextShadow: {
        borderWidth: 4,
        ...shadows.glow,
    },
    innerCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    checkmark: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    checkmarkLg: {
        fontSize: 28,
    },
    levelNumber: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.3,
    },
    levelNumberLg: {
        fontSize: 26,
    },
    lockIcon: {
        fontSize: 20,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 5,
    },
    star: {
        fontSize: 14,
        color: '#CBD5E0',
    },
    starFilled: {
        color: colors.accent,
    },
    title: {
        ...typography.caption,
        fontSize: 12,
        fontWeight: '700',
        color: colors.text,
        marginTop: 3,
        textAlign: 'center',
    },
    lockedTitle: {
        color: colors.textMuted,
    },
    diffBadge: {
        paddingHorizontal: 9,
        paddingVertical: 2,
        borderRadius: radius.full,
        marginTop: 3,
    },
    diffText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
