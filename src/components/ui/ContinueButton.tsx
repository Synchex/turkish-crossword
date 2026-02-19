import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { shadows } from '../../theme/shadows';

const { width: SW } = Dimensions.get('window');
const SHIMMER_WIDTH = 80;

interface ContinueButtonProps {
    title: string;
    subtitle: string;
    xpLabel: string;
    onPress: () => void;
    primaryColors: readonly [string, string];
    glowColor?: string;
    isDark: boolean;
    isBig: boolean;
    fontScale: number;
    glowEnabled: boolean;
}

export default function ContinueButton({
    title,
    subtitle,
    xpLabel,
    onPress,
    primaryColors,
    glowColor,
    isDark,
    isBig,
    fontScale: fs,
    glowEnabled,
}: ContinueButtonProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const rotation = useRef(new Animated.Value(0)).current;
    const arrowX = useRef(new Animated.Value(0)).current;
    const shimmerX = useRef(new Animated.Value(-SHIMMER_WIDTH - 40)).current;
    const idleBounce = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Shimmer loop
        Animated.loop(
            Animated.timing(shimmerX, {
                toValue: SW + SHIMMER_WIDTH,
                duration: 2500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ).start();

        // Idle bounce
        Animated.loop(
            Animated.sequence([
                Animated.timing(idleBounce, { toValue: -4, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(idleBounce, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ]),
        ).start();
    }, []);

    const handlePressIn = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.spring(scale, { toValue: 0.97, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
        Animated.spring(rotation, { toValue: 1, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
        Animated.spring(arrowX, { toValue: 6, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
    }, []);

    const handlePressOut = useCallback(() => {
        Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
        Animated.spring(rotation, { toValue: 0, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
        Animated.spring(arrowX, { toValue: 0, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
    }, []);

    const handlePress = useCallback(() => {
        setTimeout(onPress, 180);
    }, [onPress]);

    const rotateInterp = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-0.5deg'],
    });

    const minHeight = isBig ? 82 : 72;
    const gColor = glowColor ?? primaryColors[0];

    return (
        <Animated.View
            style={[
                styles.outer,
                {
                    transform: [
                        { translateY: idleBounce },
                        { scale },
                        { rotate: rotateInterp },
                    ],
                },
            ]}
        >
            <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                {glowEnabled && (
                    <View
                        style={[
                            styles.glow,
                            {
                                backgroundColor: gColor,
                                shadowColor: gColor,
                            },
                        ]}
                    />
                )}

                <View style={[styles.btnClip, { minHeight, borderRadius: 24 }]}>
                    <LinearGradient
                        colors={primaryColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.btn, { minHeight }]}
                    >
                        <View style={styles.content}>
                            <Text style={[styles.title, { fontSize: Math.round(21 * fs) }]}>
                                {title}
                            </Text>
                            <View style={styles.metaRow}>
                                <Text style={[styles.meta, { fontSize: Math.round(12 * fs) }]}>
                                    {subtitle}
                                </Text>
                                <View style={styles.xpChip}>
                                    <Ionicons name="sparkles" size={10} color="rgba(255,255,255,0.9)" />
                                    <Text style={[styles.xpText, { fontSize: Math.round(11 * fs) }]}>
                                        {xpLabel}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Animated.View style={[styles.arrowCircle, { transform: [{ translateX: arrowX }] }]}>
                            <Ionicons name="arrow-forward" size={Math.round(22 * fs)} color="#FFF" />
                        </Animated.View>

                        {/* Shimmer overlay */}
                        <Animated.View
                            style={[
                                styles.shimmerContainer,
                                { transform: [{ translateX: shimmerX }, { rotate: '-20deg' }] },
                            ]}
                            pointerEvents="none"
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.shimmerStripe}
                            />
                        </Animated.View>
                    </LinearGradient>
                </View>

                {isDark && (
                    <View
                        style={[
                            styles.softShadow,
                            {
                                shadowColor: gColor,
                                borderRadius: 24,
                                minHeight,
                            },
                        ]}
                    />
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    outer: {
        marginHorizontal: 20,
        marginTop: -18,
    },
    glow: {
        position: 'absolute',
        top: 6,
        left: 24,
        right: 24,
        height: '100%',
        borderRadius: 24,
        opacity: 0.2,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
    },
    btnClip: {
        overflow: 'hidden',
    },
    btn: {
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        ...shadows.lg,
    },
    content: {
        gap: 3,
    },
    title: {
        color: '#FFF',
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    meta: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    xpChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 8,
    },
    xpText: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '700',
    },
    arrowCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shimmerContainer: {
        position: 'absolute',
        top: -20,
        bottom: -20,
        width: SHIMMER_WIDTH,
    },
    shimmerStripe: {
        flex: 1,
        width: SHIMMER_WIDTH,
    },
    softShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 16,
        backgroundColor: 'transparent',
    },
});
