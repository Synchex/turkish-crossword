import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { NodePosition, PATH_WIDTH } from './mapLayout';

interface MapPathProps {
    nodes: NodePosition[];
    firstLockedIndex: number;
}

/**
 * Renders curved path segments between level nodes.
 * Uses multiple small segments to approximate smooth curves.
 * Completed path glows, locked path is very dim.
 */
export default function MapPath({ nodes, firstLockedIndex }: MapPathProps) {
    const theme = useTheme();
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];

        const isCompleted = i < firstLockedIndex;
        const isCurrent = i === firstLockedIndex - 1;

        // Divide each connection into curve sub-segments for organic feel
        const DIVISIONS = 6;
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        // Control point offset for curve (perpendicular to midpoint)
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const curveOffset = dx * 0.15; // subtle curve

        for (let d = 0; d < DIVISIONS; d++) {
            const t0 = d / DIVISIONS;
            const t1 = (d + 1) / DIVISIONS;

            // Quadratic bezier: P = (1-t)²·from + 2(1-t)t·ctrl + t²·to
            const ctrlX = midX + curveOffset;
            const ctrlY = midY;

            const x0 = (1 - t0) * (1 - t0) * from.x + 2 * (1 - t0) * t0 * ctrlX + t0 * t0 * to.x;
            const y0 = (1 - t0) * (1 - t0) * from.y + 2 * (1 - t0) * t0 * ctrlY + t0 * t0 * to.y;
            const x1 = (1 - t1) * (1 - t1) * from.x + 2 * (1 - t1) * t1 * ctrlX + t1 * t1 * to.x;
            const y1 = (1 - t1) * (1 - t1) * from.y + 2 * (1 - t1) * t1 * ctrlY + t1 * t1 * to.y;

            const segDx = x1 - x0;
            const segDy = y1 - y0;
            const length = Math.sqrt(segDx * segDx + segDy * segDy);
            const angle = Math.atan2(segDy, segDx) * (180 / Math.PI);

            const segmentColor = isCompleted
                ? theme.primary
                : isCurrent
                    ? theme.primaryLight + '60'
                    : 'rgba(255,255,255,0.04)';

            // Subtle thickness variation for organic feel
            const thicknessVar = PATH_WIDTH + Math.sin((i * 6 + d) * 0.7) * 0.8;

            // Main path segment
            segments.push(
                <View
                    key={`seg-${i}-${d}`}
                    style={[
                        s.segment,
                        {
                            left: x0,
                            top: y0 - thicknessVar / 2,
                            width: length + 1,
                            height: thicknessVar,
                            backgroundColor: segmentColor,
                            transform: [{ rotate: `${angle}deg` }],
                            transformOrigin: '0 50%',
                            borderRadius: thicknessVar / 2,
                        },
                        // Glow for completed path
                        isCompleted && {
                            shadowColor: theme.primary,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            elevation: 2,
                        },
                    ]}
                />,
            );
        }
    }

    return <>{segments}</>;
}

const s = StyleSheet.create({
    segment: {
        position: 'absolute',
        borderRadius: PATH_WIDTH / 2,
    },
});
