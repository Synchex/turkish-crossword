import React, { useEffect, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';

const { width: SW } = Dimensions.get('window');

/**
 * Reusable floating particles background.
 * Props allow tuning for different screens.
 */
interface Props {
    /** Number of dots (default 12) */
    count?: number;
    /** Max Y range for dots (default 260) */
    height?: number;
    /** Max opacity multiplier (default 1.0) */
    intensity?: number;
}

function FloatingParticles({ count = 12, height = 260, intensity = 1.0 }: Props) {
    const dots = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: new Animated.Value(Math.random() * SW),
            y: new Animated.Value(Math.random() * height),
            o: new Animated.Value((Math.random() * 0.25 + 0.03) * intensity),
            s: Math.random() * 3 + 1.5,
            d: Math.random() * 5000 + 3000,
        })),
        []);

    useEffect(() => {
        dots.forEach((p) => {
            const loop = () => {
                Animated.parallel([
                    Animated.timing(p.y, {
                        toValue: Math.random() * height,
                        duration: p.d,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(p.x, {
                        toValue: Math.random() * SW,
                        duration: p.d * 1.2,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(p.o, {
                            toValue: (Math.random() * 0.35 + 0.05) * intensity,
                            duration: p.d / 2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(p.o, {
                            toValue: Math.random() * 0.1 * intensity,
                            duration: p.d / 2,
                            useNativeDriver: true,
                        }),
                    ]),
                ]).start(loop);
            };
            loop();
        });
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {dots.map((p) => (
                <Animated.View
                    key={p.id}
                    style={{
                        position: 'absolute',
                        width: p.s,
                        height: p.s,
                        borderRadius: p.s / 2,
                        backgroundColor: '#FFF',
                        opacity: p.o,
                        transform: [{ translateX: p.x }, { translateY: p.y }],
                    }}
                />
            ))}
        </View>
    );
}

export default React.memo(FloatingParticles);
