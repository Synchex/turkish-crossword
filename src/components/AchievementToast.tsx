import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useTheme } from '../theme/ThemeContext';

const TOAST_DURATION = 3500;

export default function AchievementToast() {
    const t = useTheme();
    const pendingToast = useAchievementsStore((s) => s.pendingToast);
    const dismissToast = useAchievementsStore((s) => s.dismissToast);

    const slideAnim = useRef(new Animated.Value(-120)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!pendingToast) return;

        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Slide in
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 60,
                friction: 8,
                tension: 60,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -120,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                dismissToast();
            });
        }, TOAST_DURATION);

        return () => clearTimeout(timer);
    }, [pendingToast]);

    if (!pendingToast) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    backgroundColor: t.id === 'black' ? '#1A2040' : '#FFFFFF',
                    borderColor: t.success + '44',
                    shadowColor: t.success,
                },
            ]}
            pointerEvents="none"
        >
            <View style={[styles.iconWrap, { backgroundColor: t.success + '18' }]}>
                <Ionicons
                    name={(pendingToast.icon as any) ?? 'trophy'}
                    size={22}
                    color={t.success}
                />
            </View>
            <View style={styles.textWrap}>
                <Text style={[styles.label, { color: t.success }]}>
                    🏆 Başarım Açıldı!
                </Text>
                <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
                    {pendingToast.title}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 18,
        borderWidth: 1.5,
        gap: 12,
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
        zIndex: 9999,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: {
        flex: 1,
        gap: 2,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
});
