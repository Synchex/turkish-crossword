import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

interface XPBadgeProps {
    value: number | string;
    icon?: string;
    color?: string;
}

export default function XPBadge({
    value,
    icon = '🪙',
    color = colors.accent,
}: XPBadgeProps) {
    return (
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.value, { color }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
        gap: 4,
    },
    icon: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
    },
});
