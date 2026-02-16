import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface IconBadgeProps {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    backgroundColor?: string;
    badgeSize?: number;
    style?: ViewStyle;
}

export default function IconBadge({
    name,
    size = 20,
    color = colors.primary,
    backgroundColor,
    badgeSize = 42,
    style,
}: IconBadgeProps) {
    const bg = backgroundColor ?? (color + '14');

    return (
        <View
            style={[
                styles.badge,
                {
                    width: badgeSize,
                    height: badgeSize,
                    borderRadius: badgeSize / 2,
                    backgroundColor: bg,
                },
                style,
            ]}
        >
            <Ionicons name={name} size={size} color={color} />
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
