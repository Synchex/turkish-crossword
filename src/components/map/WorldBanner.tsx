import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { WORLD_BANNER_HEIGHT, WORLD_NAMES } from './mapLayout';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W * 0.75;

interface WorldBannerProps {
    worldIndex: number;  // 0-based
    y: number;           // center Y position
}

export default function WorldBanner({ worldIndex, y }: WorldBannerProps) {
    const theme = useTheme();
    const name = WORLD_NAMES[worldIndex] ?? `Dünya ${worldIndex + 1}`;

    return (
        <View
            style={[
                s.wrapper,
                {
                    top: y - WORLD_BANNER_HEIGHT / 2,
                    left: (SCREEN_W - BANNER_W) / 2,
                    width: BANNER_W,
                    height: WORLD_BANNER_HEIGHT,
                },
            ]}
        >
            <LinearGradient
                colors={theme.gradientPrimary as readonly [string, string]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={s.gradient}
            >
                <Ionicons
                    name="flag"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                    style={s.icon}
                />
                <Text style={s.title}>
                    Dünya {worldIndex + 1}
                </Text>
                <View style={s.divider} />
                <Text style={s.subtitle}>{name}</Text>
            </LinearGradient>
        </View>
    );
}

const s = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: WORLD_BANNER_HEIGHT / 2,
        paddingHorizontal: 20,
        gap: 6,
    },
    icon: {
        marginRight: 2,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    divider: {
        width: 1,
        height: 18,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 6,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: '600',
    },
});
