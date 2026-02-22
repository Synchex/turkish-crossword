import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import FloatingParticles from '../FloatingParticles';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Glow blob config (subtle for map) ──
interface GlowBlob {
    color: string;
    size: number;
    startX: number;
    startY: number;
    driftX: number;
    driftY: number;
    duration: number;
    delay: number;
    opacity: number;
}

const BLOBS: GlowBlob[] = [
    { color: '#5E8BFF', size: 200, startX: -40, startY: SH * 0.2, driftX: 60, driftY: 40, duration: 20000, delay: 0, opacity: 0.035 },
    { color: '#7B61FF', size: 160, startX: SW - 80, startY: SH * 0.5, driftX: -50, driftY: 30, duration: 24000, delay: 2000, opacity: 0.025 },
    { color: '#5AC8FA', size: 180, startX: SW * 0.3, startY: SH * 0.8, driftX: 40, driftY: -50, duration: 22000, delay: 4000, opacity: 0.02 },
];

// ── Glow Blob ──
const GlowBlobView = React.memo(function GlowBlobView({ blob }: { blob: GlowBlob }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: blob.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: blob.duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        }, blob.delay);
        return () => clearTimeout(timeout);
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, blob.driftX],
    });
    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, blob.driftY],
    });
    const scale = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.1, 1],
    });

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: blob.startX,
                top: blob.startY,
                width: blob.size,
                height: blob.size,
                borderRadius: blob.size / 2,
                backgroundColor: blob.color,
                opacity: blob.opacity,
                transform: [{ translateX }, { translateY }, { scale }],
            }}
        />
    );
});

// ── Main Component ──
export default function AnimatedMapBackground() {
    const parallaxAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(parallaxAnim, {
                    toValue: 1,
                    duration: 30000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(parallaxAnim, {
                    toValue: 0,
                    duration: 30000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    const parallaxX = parallaxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 8, 0],
    });
    const parallaxY = parallaxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -6, 0],
    });

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: parallaxX }, { translateY: parallaxY }] },
            ]}
            pointerEvents="none"
        >
            {/* Same floating particles as Home — slightly reduced for map */}
            <FloatingParticles count={10} height={SH * 2} intensity={0.7} />

            {/* Subtle glow blobs */}
            {BLOBS.map((blob, i) => (
                <GlowBlobView key={i} blob={blob} />
            ))}
        </Animated.View>
    );
}
