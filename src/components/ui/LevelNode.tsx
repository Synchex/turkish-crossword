import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
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
    index: number;
    onPress: () => void;
}

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
    const scale = useRef(new Animated.Value(1)).current;
    const pulse = useRef(new Animated.Value(1)).current;
    const entryOpacity = useRef(new Animated.Value(0)).current;
    const entryTranslateY = useRef(new Animated.Value(24)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const delay = Math.min(index * 80, 600);
        Animated.parallel([
            Animated.timing(entryOpacity, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(entryTranslateY, {
                toValue: 0,
                damping: 14,
                stiffness: 120,
                mass: 1,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (isNext) {
            const anim = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1.06,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1.0,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            anim.start();
            return () => anim.stop();
        } else {
            Animated.timing(pulse, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isNext]);

    useEffect(() => {
        if (stars === 3) {
            const anim = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowOpacity, {
                        toValue: 0.5,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0.15,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ]),
            );
            anim.start();
            return () => anim.stop();
        }
    }, [stars]);

    const handlePressIn = () => {
        if (!unlocked) return;
        Animated.spring(scale, {
            toValue: 0.9,
            damping: 15,
            stiffness: 200,
            mass: 1,
            useNativeDriver: true,
        }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            damping: 10,
            stiffness: 180,
            mass: 1,
            useNativeDriver: true,
        }).start();
    };
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const combinedScale = Animated.multiply(scale, pulse);

    const size = isNext ? NODE_SIZE_NEXT : NODE_SIZE;
    const innerSize = isNext ? INNER_SIZE_NEXT : INNER_SIZE;

    const diffColor =
        difficulty === 'Kolay'
            ? colors.success
            : difficulty === 'Orta'
                ? colors.accent
                : colors.secondary;

    const nodeColor = !unlocked
        ? '#C7C7CC'
        : completed
            ? colors.success
            : isNext
                ? colors.primary
                : colors.primaryLight;

    const bgTint = !unlocked
        ? '#E5E5EA'
        : completed
            ? colors.success + '14'
            : isNext
                ? colors.primary + '14'
                : colors.primaryLight + '0C';

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    opacity: entryOpacity,
                    transform: [
                        { translateY: entryTranslateY },
                        { scale: combinedScale },
                    ],
                },
            ]}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {stars === 3 && (
                    <Animated.View
                        style={[
                            styles.glowRing,
                            {
                                width: size + 16,
                                height: size + 16,
                                borderRadius: (size + 16) / 2,
                                borderColor: colors.accent,
                                opacity: glowOpacity,
                            },
                        ]}
                    />
                )}

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
                            <Ionicons name="checkmark" size={isNext ? 28 : 24} color="#fff" />
                        ) : unlocked ? (
                            <Text style={[styles.levelNumber, isNext && styles.levelNumberLg]}>
                                {levelId}
                            </Text>
                        ) : (
                            <Ionicons name="lock-closed" size={18} color="#A0A0A8" />
                        )}
                    </View>
                </View>

                {/* Star rating */}
                {completed && (
                    <View style={styles.starsRow}>
                        {[1, 2, 3].map((i) => (
                            <Ionicons
                                key={i}
                                name={i <= stars ? 'star' : 'star-outline'}
                                size={14}
                                color={i <= stars ? colors.accent : '#C7C7CC'}
                            />
                        ))}
                    </View>
                )}

                <Text
                    style={[styles.title, !unlocked && styles.lockedTitle]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                <View style={[styles.diffBadge, { backgroundColor: diffColor + '18' }]}>
                    <Text style={[styles.diffText, { color: diffColor }]}>
                        {difficulty}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
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
        borderWidth: 2.5,
        zIndex: -1,
        alignSelf: 'center',
    },
    outerRing: {
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    nextShadow: {
        borderWidth: 3.5,
        ...shadows.glow,
    },
    innerCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    levelNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.3,
    },
    levelNumberLg: {
        fontSize: 26,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 5,
        alignSelf: 'center',
    },
    title: {
        ...typography.caption,
        fontSize: 12,
        fontWeight: '600',
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
        alignSelf: 'center',
    },
    diffText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
