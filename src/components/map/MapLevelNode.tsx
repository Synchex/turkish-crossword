import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { NODE_SIZE, BOSS_NODE_SIZE } from './mapLayout';

// ── Types ──
export type NodeState = 'locked' | 'unlocked' | 'current' | 'completed';

interface MapLevelNodeProps {
    levelNumber: number;
    state: NodeState;
    stars: number;
    isBoss: boolean;
    onPress: () => void;
}

// ── Star row ──
function StarRow({ stars, size }: { stars: number; size: number }) {
    return (
        <View style={starStyles.row}>
            {[1, 2, 3].map(i => (
                <Ionicons
                    key={i}
                    name={i <= stars ? 'star' : 'star-outline'}
                    size={size}
                    color={i <= stars ? '#FFD700' : 'rgba(255,255,255,0.2)'}
                />
            ))}
        </View>
    );
}

const starStyles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 2, justifyContent: 'center' },
});

// ── Micro interactions ──
const SPARKLE_COUNT = 6;
const STAR_BURST_COUNT = 5;

function TapEffects({ playId, isBoss, nodeState }: { playId: number, isBoss: boolean, nodeState: NodeState }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (playId === 0) return;
        anim.setValue(0);
        Animated.timing(anim, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [playId]);

    if (playId === 0) return null;

    const isCompleted = nodeState === 'completed';
    const xpTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -55] });
    const xpOpacity = anim.interpolate({ inputRange: [0, 0.15, 0.65, 1], outputRange: [0, 1, 1, 0] });

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]} pointerEvents="none">
            {/* Sparkle / Star burst particles */}
            {Array.from({ length: isCompleted ? STAR_BURST_COUNT : SPARKLE_COUNT }).map((_, i) => {
                const count = isCompleted ? STAR_BURST_COUNT : SPARKLE_COUNT;
                const angle = (i / count) * Math.PI * 2 + (isCompleted ? 0.3 : 0);
                const dist = isBoss ? 65 : 55;
                const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] });
                const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] });
                const opacity = anim.interpolate({ inputRange: [0, 0.15, 0.55, 1], outputRange: [0, 1, 1, 0] });
                const scale = anim.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.2, 1.2, 0] });

                return (
                    <Animated.View
                        key={`sparkle-${i}`}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            marginLeft: -4,
                            marginTop: -4,
                            transform: [{ translateX: tx }, { translateY: ty }, { scale }],
                            opacity,
                        }}
                    >
                        {isCompleted ? (
                            <Text style={{ fontSize: 10, textAlign: 'center' }}>⭐</Text>
                        ) : (
                            <View style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#A5B4FC',
                                shadowColor: '#A5B4FC',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.7,
                                shadowRadius: 3,
                            }} />
                        )}
                    </Animated.View>
                );
            })}

            {/* Floating +50 XP */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '15%',
                    marginLeft: -36,
                    width: 72,
                    alignItems: 'center',
                    transform: [{ translateY: xpTranslateY }],
                    opacity: xpOpacity,
                }}
            >
                <Text style={{
                    color: '#FCD34D',
                    fontWeight: '800',
                    fontSize: 16,
                    letterSpacing: -0.3,
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                }}>
                    +50 XP
                </Text>
            </Animated.View>
        </View>
    );
}


// ── Main component ──
export default function MapLevelNode({
    levelNumber,
    state,
    stars,
    isBoss,
    onPress,
}: MapLevelNodeProps) {
    const theme = useTheme();

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const pressScale = useRef(new Animated.Value(1)).current;

    const [effectId, setEffectId] = useState(0);

    useEffect(() => {
        if (state === 'current') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            );
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.85,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.3,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
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
    const currentBoost = state === 'current' ? 8 : 0;
    const effectiveSize = size + currentBoost;

    const isInteractive = state !== 'locked';

    // Gradient colors per state
    const getGradient = (): readonly [string, string] => {
        switch (state) {
            case 'completed': return ['#818CF8', theme.primaryLight] as const;
            case 'current': return theme.gradientPrimary;
            case 'unlocked': return [theme.primary, theme.primaryDark] as const;
            case 'locked': return ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)'] as const;
        }
    };

    const getBorderColor = () => {
        switch (state) {
            case 'completed': return theme.primaryLight + '90';
            case 'current': return theme.primaryLight;
            case 'unlocked': return theme.primary + '60';
            case 'locked': return 'rgba(255,255,255,0.06)';
        }
    };

    const handlePressIn = () => {
        if (!isInteractive) return;
        Animated.spring(pressScale, {
            toValue: 0.92,
            friction: 5,
            tension: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        // Bounce overshoot spring for satisfying feel
        Animated.spring(pressScale, {
            toValue: 1,
            friction: 3,
            tension: 250,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        if (!isInteractive) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setEffectId(prev => prev + 1);
        onPress();
    };

    return (
        <View style={s.wrapper}>
            {/* Outer glow halo for current */}
            {state === 'current' && (
                <>
                    {/* Faint outer aura */}
                    <View
                        style={[
                            s.outerAura,
                            {
                                width: effectiveSize + 40,
                                height: effectiveSize + 40,
                                borderRadius: (effectiveSize + 40) / 2,
                                backgroundColor: theme.primary + '06',
                            },
                        ]}
                    />
                    {/* Thin progress ring */}
                    <Animated.View
                        style={[
                            s.progressRing,
                            {
                                width: effectiveSize + 18,
                                height: effectiveSize + 18,
                                borderRadius: (effectiveSize + 18) / 2,
                                borderColor: theme.primaryLight + '50',
                                opacity: glowAnim,
                            },
                        ]}
                    />
                    {/* Outer glow halo — reduced */}
                    <Animated.View
                        style={[
                            s.glowHalo,
                            {
                                width: effectiveSize + 28,
                                height: effectiveSize + 28,
                                borderRadius: (effectiveSize + 28) / 2,
                                backgroundColor: theme.primary + '08',
                                borderColor: theme.primary + '18',
                                opacity: glowAnim,
                            },
                        ]}
                    />
                </>
            )}

            {/* Completed glow shadow */}
            {state === 'completed' && (
                <View
                    style={[
                        s.completedGlow,
                        {
                            width: effectiveSize + 12,
                            height: effectiveSize + 12,
                            borderRadius: (effectiveSize + 12) / 2,
                            shadowColor: theme.primary,
                            shadowOpacity: 0.12,
                        },
                    ]}
                />
            )}

            {/* Boss crown badge */}
            {isBoss && state !== 'locked' && (
                <View style={[s.crownBadge, { backgroundColor: '#FFD700' }]}>
                    <Ionicons name="trophy" size={12} color="#B8860B" />
                </View>
            )}

            <TapEffects playId={effectId} isBoss={isBoss} nodeState={state} />

            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!isInteractive}
            >
                <Animated.View
                    style={{
                        transform: [
                            { scale: Animated.multiply(pulseAnim, pressScale) },
                        ],
                    }}
                >
                    {/* Main circle */}
                    <View
                        style={[
                            s.outerCircle,
                            {
                                width: effectiveSize,
                                height: effectiveSize,
                                borderRadius: effectiveSize / 2,
                                borderColor: getBorderColor(),
                                borderWidth: state === 'current' ? 3 : 2,
                            },
                            state !== 'locked' && {
                                shadowColor: theme.primary,
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: state === 'current' ? 0.25 : 0.12,
                                shadowRadius: state === 'current' ? 8 : 4,
                                elevation: 4,
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={getGradient()}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={[
                                s.gradientFill,
                                {
                                    borderRadius: effectiveSize / 2,
                                    opacity: state === 'locked' ? 0.45 : 1,
                                },
                            ]}
                        >
                            {/* Radial depth highlight — top-left bright spot */}
                            {state !== 'locked' && (
                                <View
                                    style={[
                                        s.innerHighlight,
                                        {
                                            width: effectiveSize * 0.45,
                                            height: effectiveSize * 0.45,
                                            borderRadius: effectiveSize * 0.225,
                                        },
                                    ]}
                                />
                            )}

                            {/* Soft inner shadow for 3D depth */}
                            {state !== 'locked' && (
                                <View
                                    style={[
                                        s.innerShadow,
                                        {
                                            width: effectiveSize,
                                            height: effectiveSize,
                                            borderRadius: effectiveSize / 2,
                                        },
                                    ]}
                                />
                            )}

                            {/* Icon / Number */}
                            {state === 'locked' ? (
                                <Ionicons
                                    name="lock-closed"
                                    size={isBoss ? 22 : 18}
                                    color="rgba(255,255,255,0.3)"
                                />
                            ) : state === 'completed' ? (
                                <Ionicons
                                    name="checkmark-sharp"
                                    size={isBoss ? 15 : 12}
                                    color="rgba(255,255,255,0.5)"
                                />
                            ) : (
                                <Text
                                    style={[
                                        s.levelText,
                                        {
                                            fontSize: isBoss ? 22 : 18,
                                            color: '#FFFFFF',
                                        },
                                    ]}
                                >
                                    {levelNumber}
                                </Text>
                            )}
                        </LinearGradient>
                    </View>
                </Animated.View>
            </Pressable>

            {/* Stars (completed only) */}
            {state === 'completed' && (
                <View style={s.starContainer}>
                    <StarRow stars={stars} size={isBoss ? 13 : 11} />
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
    progressRing: {
        position: 'absolute',
        borderWidth: 1.5,
        zIndex: -1,
        backgroundColor: 'transparent',
    },
    glowHalo: {
        position: 'absolute',
        borderWidth: 2,
        zIndex: -1,
    },
    completedGlow: {
        position: 'absolute',
        zIndex: -1,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        backgroundColor: 'transparent',
    },
    crownBadge: {
        position: 'absolute',
        top: -8,
        right: -4,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
    outerCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    gradientFill: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerHighlight: {
        position: 'absolute',
        top: '6%',
        left: '12%',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    innerShadow: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: 'transparent',
        borderTopColor: 'rgba(255,255,255,0.04)',
        borderLeftColor: 'rgba(255,255,255,0.02)',
        borderBottomColor: 'rgba(0,0,0,0.12)',
        borderRightColor: 'rgba(0,0,0,0.06)',
    },
    outerAura: {
        position: 'absolute',
        zIndex: -2,
    },
    levelText: {
        fontWeight: '800',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    starContainer: {
        marginTop: 5,
    },
});
