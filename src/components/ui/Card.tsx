import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
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
    const t = useTheme();
    const isDark = t.id === 'black';
    return (
        <View
            style={[
                styles.base,
                {
                    backgroundColor: t.card,
                    borderColor: t.border,
                    padding: spacing[padding],
                },
                isDark && {
                    shadowColor: t.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 6,
                },
                variant === 'elevated' && styles.elevated,
                variant === 'accent' && {
                    borderWidth: 1,
                    borderColor: t.primary + '20',
                    ...shadows.md,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        ...shadows.sm,
    },
    elevated: {
        ...shadows.md,
    },
});
