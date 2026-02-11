import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

interface LevelNodeProps {
    levelId: number;
    title: string;
    difficulty: string;
    gridSize: number;
    unlocked: boolean;
    completed: boolean;
    stars: number;
    onPress: () => void;
}

export default function LevelNode({
    levelId,
    title,
    difficulty,
    gridSize,
    unlocked,
    completed,
    stars,
    onPress,
}: LevelNodeProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        if (!unlocked) return;
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    }, [unlocked]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }, []);

    const handlePress = useCallback(() => {
        if (!unlocked) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [unlocked, onPress]);

    const diffColor =
        difficulty === 'Kolay'
            ? colors.success
            : difficulty === 'Orta'
                ? colors.accent
                : colors.secondary;

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!unlocked}
            style={styles.container}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <View
                    style={[
                        styles.card,
                        completed && styles.completedCard,
                        !unlocked && styles.lockedCard,
                    ]}
                >
                    {/* Level number circle */}
                    <View
                        style={[
                            styles.numberCircle,
                            {
                                backgroundColor: !unlocked
                                    ? colors.textMuted
                                    : completed
                                        ? colors.success
                                        : colors.primary,
                            },
                        ]}
                    >
                        <Text style={styles.numberText}>
                            {unlocked ? levelId : '🔒'}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text
                        style={[styles.title, !unlocked && styles.lockedText]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>

                    {/* Difficulty badge */}
                    <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
                        <Text style={[styles.diffText, { color: diffColor }]}>
                            {difficulty} · {gridSize}×{gridSize}
                        </Text>
                    </View>

                    {/* Stars */}
                    {completed && (
                        <View style={styles.starsRow}>
                            {[1, 2, 3].map((i) => (
                                <Text key={i} style={styles.star}>
                                    {i <= stars ? '⭐' : '☆'}
                                </Text>
                            ))}
                        </View>
                    )}

                    {/* Lock overlay */}
                    {!unlocked && <View style={styles.lockOverlay} />}
                </View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
        minHeight: 140,
        justifyContent: 'center',
        gap: 6,
    },
    completedCard: {
        borderWidth: 2,
        borderColor: colors.success,
        backgroundColor: colors.successLight,
    },
    lockedCard: {
        opacity: 0.5,
    },
    numberCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    numberText: {
        color: colors.textInverse,
        fontWeight: '800',
        fontSize: 18,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    lockedText: {
        color: colors.textMuted,
    },
    diffBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.full,
    },
    diffText: {
        fontSize: 11,
        fontWeight: '600',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
    },
    star: {
        fontSize: 14,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: radius.lg,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
