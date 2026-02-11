import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'elevated' | 'accent';
    padding?: keyof typeof spacing;
}

export default function Card({
    children,
    style,
    variant = 'default',
    padding = 'md',
}: CardProps) {
    return (
        <View
            style={[
                styles.base,
                { padding: spacing[padding] },
                variant === 'elevated' && styles.elevated,
                variant === 'accent' && styles.accent,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        ...shadows.sm,
    },
    elevated: {
        ...shadows.md,
    },
    accent: {
        backgroundColor: colors.cardAlt,
        borderWidth: 1.5,
        borderColor: colors.primaryLight,
        ...shadows.glow,
    },
});
