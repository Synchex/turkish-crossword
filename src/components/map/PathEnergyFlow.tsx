import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { NodePosition } from './mapLayout';

interface PathEnergyFlowProps {
    nodes: NodePosition[];
    firstLockedIndex: number;
}

const DOT_SIZE = 4;
const DOT_COUNT = 5;

/**
 * Compute a point at parameter t along the quadratic bezier
 * matching the MapPath curve formula.
 */
function bezierPoint(
    from: NodePosition,
    to: NodePosition,
    t: number,
): { x: number; y: number } {
    const dx = to.x - from.x;
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const curveOffset = dx * 0.15;
    const ctrlX = midX + curveOffset;
    const ctrlY = midY;

    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * ctrlX + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * ctrlY + t * t * to.y;
    return { x, y };
}

// ── Single energy dot (standard Animated API) ──
const EnergyDot = React.memo(function EnergyDot({
    nodes,
    completedCount,
    delay,
}: {
    nodes: NodePosition[];
    completedCount: number;
    delay: number;
}) {
    const progress = useRef(new Animated.Value(0)).current;

    const waypoints = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        const samplesPerSegment = 8;
        for (let i = 0; i < completedCount && i < nodes.length - 1; i++) {
            for (let s = 0; s < samplesPerSegment; s++) {
                const t = s / samplesPerSegment;
                pts.push(bezierPoint(nodes[i], nodes[i + 1], t));
            }
        }
        if (completedCount > 0 && completedCount < nodes.length) {
            pts.push({ x: nodes[completedCount].x, y: nodes[completedCount].y });
        }
        return pts;
    }, [nodes, completedCount]);

    useEffect(() => {
        if (waypoints.length < 2) return;
        const timeout = setTimeout(() => {
            Animated.loop(
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 4000 + delay * 0.3,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false, // need layout props
                }),
            ).start();
        }, delay);
        return () => clearTimeout(timeout);
    }, [waypoints.length]);

    if (waypoints.length < 2) return null;

    // Interpolate x and y through the waypoints
    const inputRange = waypoints.map((_, i) => i / (waypoints.length - 1));
    const outputX = waypoints.map(p => p.x - DOT_SIZE / 2);
    const outputY = waypoints.map(p => p.y - DOT_SIZE / 2);

    const left = progress.interpolate({ inputRange, outputRange: outputX });
    const top = progress.interpolate({ inputRange, outputRange: outputY });
    const opacity = progress.interpolate({
        inputRange: [0, 0.05, 0.5, 0.95, 1],
        outputRange: [0, 0.5, 0.7, 0.5, 0],
    });

    return (
        <Animated.View
            style={[
                st.dot,
                { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
                { left, top, opacity },
            ]}
        />
    );
});

/**
 * Renders subtle energy dots flowing along the completed path.
 * Uses standard RN Animated API (no Reanimated) for Expo Go compatibility.
 */
function PathEnergyFlow({ nodes, firstLockedIndex }: PathEnergyFlowProps) {
    if (firstLockedIndex <= 0) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: DOT_COUNT }, (_, i) => (
                <EnergyDot
                    key={i}
                    nodes={nodes}
                    completedCount={firstLockedIndex}
                    delay={i * 800}
                />
            ))}
        </View>
    );
}

export default React.memo(PathEnergyFlow);

const st = StyleSheet.create({
    dot: {
        position: 'absolute',
        backgroundColor: 'rgba(122,160,255,0.6)',
        shadowColor: '#5E8BFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
});
