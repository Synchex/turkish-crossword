import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressBarProps {
    progress: number; // 0–1
    height?: number;
    color?: string;
    trackColor?: string;
    style?: ViewStyle;
}

export default function ProgressBar({
    progress,
    height = 12,
    color = colors.success,
    trackColor = colors.border,
    style,
}: ProgressBarProps) {
    const width = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const clamped = Math.min(Math.max(progress, 0), 1);
        Animated.timing(width, {
            toValue: clamped,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // width can't use native driver
        }).start();
    }, [progress]);

    const fillWidth = width.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View
            style={[
                styles.track,
                { height, borderRadius: height / 2, backgroundColor: trackColor },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.fill,
                    {
                        height,
                        borderRadius: height / 2,
                        backgroundColor: color,
                        width: fillWidth,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
});
