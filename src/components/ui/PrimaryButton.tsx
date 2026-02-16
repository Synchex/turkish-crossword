import React, { useCallback, useRef } from 'react';
import {
    Text,
    Pressable,
    StyleSheet,
    ViewStyle,
    TextStyle,
    Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    icon?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function PrimaryButton({
    title,
    onPress,
    variant = 'primary',
    size = 'lg',
    disabled = false,
    icon,
    style,
    textStyle,
}: PrimaryButtonProps) {
    const t = useTheme();
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressOut = useCallback(() => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    }, [onPress]);

    const bgColor = disabled
        ? t.textMuted
        : variant === 'primary'
            ? t.primary
            : variant === 'secondary'
                ? t.secondary
                : variant === 'success'
                    ? t.success
                    : 'transparent';

    const txtColor =
        variant === 'outline' || variant === 'ghost'
            ? t.primary
            : t.textInverse;

    const height = size === 'sm' ? 40 : size === 'md' ? 48 : 56;

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
        >
            <Animated.View
                style={[
                    styles.base,
                    {
                        backgroundColor: bgColor,
                        height,
                        transform: [{ scale }],
                        ...(variant === 'outline'
                            ? { borderWidth: 2, borderColor: t.primary }
                            : {}),
                    },
                    variant !== 'outline' && variant !== 'ghost' && shadows.md,
                    style,
                ]}
            >
                <Text
                    style={[
                        typography.button,
                        { color: txtColor, fontSize: size === 'sm' ? 14 : 17 },
                        textStyle,
                    ]}
                >
                    {icon ? `${icon}  ${title}` : title}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
});
