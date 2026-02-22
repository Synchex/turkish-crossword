/**
 * AchievementToast — Premium achievement notification banner.
 *
 * • Slides down from top with spring animation
 * • Dark gradient background (blue → purple)
 * • Trophy icon + title + description
 * • Tap to dismiss, auto-dismiss after 3s
 * • Queue-aware: shows next achievement when current dismissed
 * • Haptic + optional SFX on appear
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAchievementsStore, PendingToast } from '../store/useAchievementsStore';
import { LinearGradient } from 'expo-linear-gradient';

const DISPLAY_DURATION = 3000;
const ANIM_IN_MS = 250;
const ANIM_OUT_MS = 220;

export default function AchievementToast() {
    const insets = useSafeAreaInsets();
    const pendingToast = useAchievementsStore((s) => s.pendingToast);
    const dismissToast = useAchievementsStore((s) => s.dismissToast);

    const slideY = useRef(new Animated.Value(-140)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.92)).current;
    const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentToastId = useRef<string | null>(null);

    const animateOut = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideY, {
                toValue: -140,
                duration: ANIM_OUT_MS,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: ANIM_OUT_MS - 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            dismissToast();
            currentToastId.current = null;
        });
    }, [dismissToast, slideY, opacity]);

    const handleTap = useCallback(() => {
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        animateOut();
    }, [animateOut]);

    useEffect(() => {
        if (!pendingToast) return;
        // Don't re-animate for the same toast
        if (currentToastId.current === pendingToast.id) return;
        currentToastId.current = pendingToast.id;

        // Reset
        slideY.setValue(-140);
        opacity.setValue(0);
        scale.setValue(0.92);

        // Haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Animate in
        Animated.parallel([
            Animated.spring(slideY, {
                toValue: insets.top + 8,
                friction: 9,
                tension: 65,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: ANIM_IN_MS,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 8,
                tension: 70,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(animateOut, DISPLAY_DURATION);

        return () => {
            if (dismissTimer.current) clearTimeout(dismissTimer.current);
        };
    }, [pendingToast?.id]);

    if (!pendingToast) return null;

    const iconName = (pendingToast.icon as keyof typeof Ionicons.glyphMap) ?? 'trophy';

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateY: slideY },
                        { scale },
                    ],
                    opacity,
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleTap}
                style={styles.touchable}
            >
                <LinearGradient
                    colors={['#1E2A4A', '#2D1B4E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Icon */}
                    <View style={styles.iconWrap}>
                        <Ionicons name={iconName} size={24} color="#FFC857" />
                    </View>

                    {/* Text */}
                    <View style={styles.textWrap}>
                        <Text style={styles.title} numberOfLines={1}>
                            🏆 Tebrikler!
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={2}>
                            "{pendingToast.title}" başarımını elde ettin
                            {pendingToast.description ? ` — ${pendingToast.description}` : ''}
                        </Text>
                    </View>

                    {/* Sparkle accent */}
                    <Ionicons
                        name="sparkles"
                        size={16}
                        color="rgba(255,200,87,0.5)"
                        style={styles.sparkle}
                    />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        zIndex: 99999,
        elevation: 99,
    },
    touchable: {
        borderRadius: 18,
        overflow: 'hidden',
        // Shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,200,87,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: {
        flex: 1,
        gap: 3,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFC857',
        letterSpacing: -0.2,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 17,
    },
    sparkle: {
        marginLeft: 4,
        opacity: 0.6,
    },
});
