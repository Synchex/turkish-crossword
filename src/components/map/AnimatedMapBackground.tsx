/**
 * AnimatedMapBackground — Premium cinematic 5-layer background.
 *
 * Layer 1: Multi-stop base gradient (handled by parent chapters.tsx)
 * Layer 2: Nebula glow blobs (soft radial, very low opacity)
 * Layer 3: Bokeh depth orbs (asymmetric, blurred, multi-size)
 * Layer 4: Star field (micro dots, a few twinkle)
 * Layer 5: Light streaks (faint diagonal)
 *
 * All layers drift with slow parallax for cinematic depth.
 * Fully configurable via constants.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SW, height: SH } = Dimensions.get('window');

// ═══════════════════════════════════
//  CONFIGURATION — Tweak these!
// ═══════════════════════════════════

/** Layer 2: Nebula glow blobs */
const NEBULA_BLOBS = [
    {
        // Primary blue-purple nebula — upper right
        color1: 'rgba(88,100,255,0.14)',
        color2: 'rgba(88,100,255,0)',
        size: 320,
        x: SW * 0.55,
        y: SH * 0.08,
        driftX: 6,
        driftY: 4,
        duration: 12000,
    },
    {
        // Secondary teal-indigo nebula — lower left
        color1: 'rgba(70,180,220,0.08)',
        color2: 'rgba(70,180,220,0)',
        size: 240,
        x: -SW * 0.1,
        y: SH * 0.7,
        driftX: -4,
        driftY: -3,
        duration: 15000,
    },
    {
        // Faint warm accent — mid right
        color1: 'rgba(140,90,220,0.06)',
        color2: 'rgba(140,90,220,0)',
        size: 200,
        x: SW * 0.7,
        y: SH * 0.45,
        driftX: 3,
        driftY: -5,
        duration: 18000,
    },
];

/** Layer 3: Bokeh depth orbs */
const BOKEH_ORBS = [
    { size: 140, x: SW * 0.08, y: SH * 0.15, opacity: 0.06, color: '#6366F1' },
    { size: 100, x: SW * 0.75, y: SH * 0.28, opacity: 0.05, color: '#818CF8' },
    { size: 180, x: SW * 0.3, y: SH * 0.55, opacity: 0.04, color: '#5B8DEF' },
    { size: 90, x: SW * 0.85, y: SH * 0.7, opacity: 0.07, color: '#7C3AED' },
    { size: 120, x: SW * 0.1, y: SH * 0.85, opacity: 0.045, color: '#4F9CF7' },
    { size: 70, x: SW * 0.6, y: SH * 0.05, opacity: 0.055, color: '#A78BFA' },
];

/** Layer 4: Star field */
const STAR_COUNT = 45;
const TWINKLE_COUNT = 6; // How many stars twinkle

/** Layer 5: Light streaks */
const LIGHT_STREAKS = [
    {
        angle: -25,
        x: SW * 0.2,
        y: SH * 0.1,
        width: SW * 0.7,
        height: 1.5,
        opacity: 0.04,
    },
    {
        angle: -35,
        x: SW * 0.5,
        y: SH * 0.6,
        width: SW * 0.5,
        height: 1,
        opacity: 0.03,
    },
];

// ═══════════════════════════════════
//  LAYER 2 — Nebula Blobs
// ═══════════════════════════════════

const NebulaBlob = React.memo(function NebulaBlob({
    blob,
}: {
    blob: (typeof NEBULA_BLOBS)[0];
}) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, blob.driftX],
    });
    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, blob.driftY],
    });

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: blob.x - blob.size / 2,
                top: blob.y - blob.size / 2,
                width: blob.size,
                height: blob.size,
                borderRadius: blob.size / 2,
                transform: [{ translateX }, { translateY }],
                overflow: 'hidden',
            }}
        >
            <LinearGradient
                colors={[blob.color1, blob.color2]}
                style={{ width: blob.size, height: blob.size, borderRadius: blob.size / 2 }}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 0, y: 0 }}
            />
        </Animated.View>
    );
});

// ═══════════════════════════════════
//  LAYER 3 — Bokeh Depth Orbs
// ═══════════════════════════════════

const BokehOrb = React.memo(function BokehOrb({
    orb,
}: {
    orb: (typeof BOKEH_ORBS)[0];
}) {
    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: orb.x - orb.size / 2,
                top: orb.y - orb.size / 2,
                width: orb.size,
                height: orb.size,
                borderRadius: orb.size / 2,
                backgroundColor: orb.color,
                opacity: orb.opacity,
            }}
        />
    );
});

// ═══════════════════════════════════
//  LAYER 4 — Star Field
// ═══════════════════════════════════

interface StarData {
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinkle: boolean;
}

function generateStars(count: number, twinkleCount: number): StarData[] {
    // Seeded pseudo-random for consistent positions
    let seed = 42;
    const rng = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    const stars: StarData[] = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: rng() * SW,
            y: rng() * SH * 2, // Extend beyond viewport for scrolling
            size: rng() > 0.7 ? 2 : 1,
            opacity: 0.10 + rng() * 0.25,
            twinkle: i < twinkleCount,
        });
    }
    return stars;
}

const TwinkleStar = React.memo(function TwinkleStar({ star }: { star: StarData }) {
    const anim = useRef(new Animated.Value(star.opacity)).current;

    useEffect(() => {
        const delay = Math.random() * 4000;
        const timeout = setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: star.opacity * 2.5,
                        duration: 1200 + Math.random() * 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: star.opacity,
                        duration: 1200 + Math.random() * 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        }, delay);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: '#E0E7FF',
                opacity: anim,
            }}
        />
    );
});

const StaticStar = React.memo(function StaticStar({ star }: { star: StarData }) {
    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: '#E0E7FF',
                opacity: star.opacity,
            }}
        />
    );
});

// ═══════════════════════════════════
//  LAYER 5 — Light Streaks
// ═══════════════════════════════════

const LightStreak = React.memo(function LightStreak({
    streak,
}: {
    streak: (typeof LIGHT_STREAKS)[0];
}) {
    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: streak.x,
                top: streak.y,
                width: streak.width,
                height: streak.height,
                opacity: streak.opacity,
                transform: [{ rotate: `${streak.angle}deg` }],
                overflow: 'hidden',
                borderRadius: streak.height,
            }}
        >
            <LinearGradient
                colors={[
                    'rgba(165,180,252,0)',
                    'rgba(165,180,252,0.6)',
                    'rgba(165,180,252,0)',
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ width: '100%', height: '100%' }}
            />
        </View>
    );
});

// ═══════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════

export default function AnimatedMapBackground() {
    const stars = useMemo(() => generateStars(STAR_COUNT, TWINKLE_COUNT), []);

    // Global slow parallax drift for nebula layer
    const parallaxAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(parallaxAnim, {
                    toValue: 1,
                    duration: 20000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(parallaxAnim, {
                    toValue: 0,
                    duration: 20000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    const nebulaTranslateX = parallaxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 2, 0],
    });
    const nebulaTranslateY = parallaxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -1.5, 0],
    });
    const starTranslateX = parallaxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 0],
    });
    const starTranslateY = parallaxAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -0.5, 0],
    });

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* ── Layer 2: Nebula Glow ── */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [
                            { translateX: nebulaTranslateX },
                            { translateY: nebulaTranslateY },
                        ],
                    },
                ]}
            >
                {NEBULA_BLOBS.map((blob, i) => (
                    <NebulaBlob key={`neb-${i}`} blob={blob} />
                ))}
            </Animated.View>

            {/* ── Layer 3: Bokeh Depth Orbs ── */}
            <View style={StyleSheet.absoluteFill}>
                {BOKEH_ORBS.map((orb, i) => (
                    <BokehOrb key={`bok-${i}`} orb={orb} />
                ))}
            </View>

            {/* ── Layer 4: Star Field ── */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [
                            { translateX: starTranslateX },
                            { translateY: starTranslateY },
                        ],
                    },
                ]}
            >
                {stars.map((star, i) =>
                    star.twinkle ? (
                        <TwinkleStar key={`star-${i}`} star={star} />
                    ) : (
                        <StaticStar key={`star-${i}`} star={star} />
                    ),
                )}
            </Animated.View>

            {/* ── Layer 5: Light Streaks ── */}
            <View style={StyleSheet.absoluteFill}>
                {LIGHT_STREAKS.map((streak, i) => (
                    <LightStreak key={`streak-${i}`} streak={streak} />
                ))}
            </View>
        </View>
    );
}
