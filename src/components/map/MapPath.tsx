import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { NodePosition, PATH_WIDTH } from './mapLayout';

interface MapPathProps {
    nodes: NodePosition[];
    /** Index of the first locked node (all before it are "completed" path) */
    firstLockedIndex: number;
}

/**
 * Renders path segments between consecutive level nodes.
 * Completed path segments use the primary color; locked ones are faded.
 * Each segment is a thin View positioned/rotated to connect two node centers.
 */
export default function MapPath({ nodes, firstLockedIndex }: MapPathProps) {
    const theme = useTheme();

    const segments: React.ReactNode[] = [];

    for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];

        // Skip segments that cross world boundaries (banner gap)
        if (from.worldIndex !== to.worldIndex) {
            // Draw two half-segments: from → banner edge, banner edge → to
            // For simplicity, still draw a connecting line (the banner overlays it)
        }

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        const isCompleted = i < firstLockedIndex;
        const isCurrent = i === firstLockedIndex - 1;

        const segmentColor = isCompleted
            ? theme.primary
            : isCurrent
                ? theme.primaryLight
                : theme.textMuted + '40'; // 25% opacity

        segments.push(
            <View
                key={`seg-${i}`}
                style={[
                    s.segment,
                    {
                        left: from.x,
                        top: from.y,
                        width: length,
                        height: PATH_WIDTH,
                        backgroundColor: segmentColor,
                        transform: [
                            { translateX: -0 },
                            { translateY: -PATH_WIDTH / 2 },
                            { rotate: `${angle}deg` },
                        ],
                        transformOrigin: '0 50%',
                    },
                ]}
            />,
        );

        // Decorative dots along completed path
        if (isCompleted) {
            const dotCount = Math.floor(length / 24);
            for (let d = 1; d < dotCount; d++) {
                const frac = d / dotCount;
                const dotX = from.x + dx * frac;
                const dotY = from.y + dy * frac;
                segments.push(
                    <View
                        key={`dot-${i}-${d}`}
                        style={[
                            s.dot,
                            {
                                left: dotX - 3,
                                top: dotY - 3,
                                backgroundColor: theme.primaryLight + '60',
                            },
                        ]}
                    />,
                );
            }
        }
    }

    return <>{segments}</>;
}

const s = StyleSheet.create({
    segment: {
        position: 'absolute',
        borderRadius: 2,
    },
    dot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
