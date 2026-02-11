import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

interface FeedbackPanelProps {
    type: 'correct' | 'wrong' | null;
    message?: string;
}

export default function FeedbackPanel({
    type,
    message,
}: FeedbackPanelProps) {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (type) {
            // Fire haptic
            if (type === 'correct') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            // Reset
            translateY.setValue(100);
            opacity.setValue(0);
            scale.setValue(0.8);

            // Slide up
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-dismiss after 1.5s
            const timeout = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: 100,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 1500);

            return () => clearTimeout(timeout);
        } else {
            translateY.setValue(100);
            opacity.setValue(0);
            scale.setValue(0.8);
        }
    }, [type]);

    if (!type) return null;

    const isCorrect = type === 'correct';
    const bg = isCorrect ? colors.success : colors.danger;
    const emoji = isCorrect ? '✅' : '❌';
    const defaultMsg = isCorrect ? 'Doğru!' : 'Yanlış!';

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: bg,
                    transform: [{ translateY }, { scale }],
                    opacity,
                },
            ]}
            pointerEvents="none"
        >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.message}>{message || defaultMsg}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        borderRadius: radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 10,
        ...shadows.lg,
    },
    emoji: {
        fontSize: 24,
    },
    message: {
        color: colors.textInverse,
        fontSize: 18,
        fontWeight: '800',
    },
});
