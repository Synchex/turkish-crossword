import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { NODE_SIZE, BOSS_NODE_SIZE } from './mapLayout';

// ── Types ──
export type NodeState = 'locked' | 'unlocked' | 'current' | 'completed';

interface MapLevelNodeProps {
    levelNumber: number;       // 1-based
    state: NodeState;
    stars: number;             // 0-3
    isBoss: boolean;
    onPress: () => void;
}

// ── Star row ──
function StarRow({ stars, size }: { stars: number; size: number }) {
    const theme = useTheme();
    return (
        <View style={starStyles.row}>
            {[1, 2, 3].map(i => (
                <Ionicons
                    key={i}
                    name={i <= stars ? 'star' : 'star-outline'}
                    size={size}
                    color={i <= stars ? '#FFD700' : theme.textMuted}
                />
            ))}
        </View>
    );
}

const starStyles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 1, justifyContent: 'center' },
});

// ── Main component ──
export default function MapLevelNode({
    levelNumber,
    state,
    stars,
    isBoss,
    onPress,
}: MapLevelNodeProps) {
    const theme = useTheme();

    // Glow / pulse animation for current node
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (state === 'current') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.12,
                        duration: 900,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 900,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            );
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 900,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.4,
                        duration: 900,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            );
            pulse.start();
            glow.start();
            return () => { pulse.stop(); glow.stop(); };
        } else {
            pulseAnim.setValue(1);
            glowAnim.setValue(0);
        }
    }, [state]);

    const size = isBoss ? BOSS_NODE_SIZE : NODE_SIZE;
    const innerSize = size - 14;

    // Colors based on state
    const getBgColor = () => {
        switch (state) {
            case 'locked': return theme.fill;
            case 'unlocked': return theme.primary;
            case 'current': return theme.primary;
            case 'completed': return theme.success;
        }
    };

    const getBorderColor = () => {
        switch (state) {
            case 'locked': return theme.textMuted;
            case 'unlocked': return theme.primaryDark;
            case 'current': return theme.primaryLight;
            case 'completed': return theme.successDark;
        }
    };

    const getTextColor = () => {
        switch (state) {
            case 'locked': return theme.textMuted;
            default: return '#FFFFFF';
        }
    };

    const handlePress = () => {
        if (state === 'locked') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const isInteractive = state !== 'locked';

    return (
        <View style={s.wrapper}>
            {/* Glow ring for current node */}
            {state === 'current' && (
                <Animated.View
                    style={[
                        s.glowRing,
                        {
                            width: size + 16,
                            height: size + 16,
                            borderRadius: (size + 16) / 2,
                            borderColor: theme.primary,
                            opacity: glowAnim,
                        },
                    ]}
                />
            )}

            {/* Boss crown badge */}
            {isBoss && state !== 'locked' && (
                <View style={[s.crownBadge, { backgroundColor: '#FFD700' }]}>
                    <Ionicons name="trophy" size={14} color="#B8860B" />
                </View>
            )}

            <Pressable
                onPress={handlePress}
                disabled={!isInteractive}
                style={({ pressed }) => [
                    { opacity: pressed && isInteractive ? 0.85 : 1 },
                ]}
            >
                <Animated.View
                    style={[
                        s.outerCircle,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            borderColor: getBorderColor(),
                            backgroundColor: getBgColor(),
                            transform: [{ scale: pulseAnim }],
                        },
                        isBoss && {
                            borderWidth: 3,
                        },
                    ]}
                >
                    <View
                        style={[
                            s.innerCircle,
                            {
                                width: innerSize,
                                height: innerSize,
                                borderRadius: innerSize / 2,
                                backgroundColor: state === 'locked'
                                    ? theme.surface2
                                    : 'rgba(255,255,255,0.15)',
                            },
                        ]}
                    >
                        {state === 'locked' ? (
                            <Ionicons
                                name="lock-closed"
                                size={isBoss ? 22 : 18}
                                color={theme.textMuted}
                            />
                        ) : (
                            <Text
                                style={[
                                    s.levelText,
                                    {
                                        color: getTextColor(),
                                        fontSize: isBoss ? 20 : 17,
                                    },
                                ]}
                            >
                                {levelNumber}
                            </Text>
                        )}
                    </View>
                </Animated.View>
            </Pressable>

            {/* Stars (only for completed or unlocked with stars) */}
            {state === 'completed' && (
                <View style={s.starContainer}>
                    <StarRow stars={stars} size={isBoss ? 14 : 12} />
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        borderWidth: 2.5,
        zIndex: -1,
    },
    crownBadge: {
        position: 'absolute',
        top: -10,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    outerCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    innerCircle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelText: {
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    starContainer: {
        marginTop: 4,
    },
});
