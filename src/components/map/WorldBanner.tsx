import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { WORLD_BANNER_HEIGHT, WORLD_NAMES } from './mapLayout';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W * 0.68;

interface WorldBannerProps {
    worldIndex: number;
    y: number;
}

export default function WorldBanner({ worldIndex, y }: WorldBannerProps) {
    const theme = useTheme();
    const name = WORLD_NAMES[worldIndex] ?? `Dünya ${worldIndex + 1}`;

    // Subtle entrance animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: worldIndex * 100,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay: worldIndex * 100,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                s.wrapper,
                {
                    top: y - WORLD_BANNER_HEIGHT / 2,
                    left: (SCREEN_W - BANNER_W) / 2,
                    width: BANNER_W,
                    height: WORLD_BANNER_HEIGHT,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Glass background */}
            <View style={[s.glassInner, { borderColor: theme.primary + '20' }]}>
                <LinearGradient
                    colors={[theme.primary + '25', theme.primary + '10']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={s.gradient}
                >
                    <Ionicons
                        name="flag"
                        size={14}
                        color={theme.primaryLight}
                        style={s.icon}
                    />
                    <Text style={[s.title, { color: theme.primaryLight }]}>
                        Dünya {worldIndex + 1}
                    </Text>
                    <View style={[s.divider, { backgroundColor: theme.primary + '30' }]} />
                    <Text style={[s.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
                        {name}
                    </Text>
                </LinearGradient>
            </View>
        </Animated.View>
    );
}

const s = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        zIndex: 20,
    },
    glassInner: {
        flex: 1,
        borderRadius: WORLD_BANNER_HEIGHT / 2,
        borderWidth: 1,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        gap: 5,
    },
    icon: {
        marginRight: 2,
    },
    title: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    divider: {
        width: 1,
        height: 16,
        marginHorizontal: 6,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
});
