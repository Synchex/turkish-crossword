import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../src/theme/ThemeContext';
import { allPuzzles } from '../../src/cengel/puzzles/index';
import { usePuzzleProgressStore } from '../../src/store/usePuzzleProgressStore';
import MapLevelNode, { NodeState } from '../../src/components/map/MapLevelNode';
import MapPath from '../../src/components/map/MapPath';
import WorldBanner from '../../src/components/map/WorldBanner';
import {
    NODE_POSITIONS,
    BANNER_POSITIONS,
    MAP_HEIGHT,
    MAP_PADDING_TOP,
    NODE_SIZE,
    BOSS_NODE_SIZE,
} from '../../src/components/map/mapLayout';

const { height: SCREEN_H } = Dimensions.get('window');

export default function ChaptersScreen() {
    const router = useRouter();
    const theme = useTheme();
    const scrollRef = useRef<ScrollView>(null);

    const progress = usePuzzleProgressStore((s) => s.progress);

    // Derive level states
    const levelStates = useMemo(() => {
        return allPuzzles.map((puzzle, index) => {
            const p = progress[puzzle.id];
            const completed = p?.completed ?? false;
            const stars = p?.stars ?? 0;

            // Unlock logic: level 0 always unlocked, otherwise previous must be completed
            const unlocked = index === 0 || (progress[allPuzzles[index - 1]?.id]?.completed ?? false);

            let state: NodeState;
            if (completed) {
                state = 'completed';
            } else if (unlocked) {
                // Find the first incomplete unlocked level — that's the "current" one
                const isFirst = !allPuzzles.slice(0, index).some((prev, pi) => {
                    const pp = progress[prev.id];
                    return !(pp?.completed);
                }) || index === 0;
                state = isFirst ? 'current' : 'unlocked';
            } else {
                state = 'locked';
            }

            return { puzzleId: puzzle.id, state, stars, index };
        });
    }, [progress]);

    // Find current level index for auto-scroll
    const currentIndex = useMemo(() => {
        const idx = levelStates.findIndex(l => l.state === 'current');
        return idx >= 0 ? idx : 0;
    }, [levelStates]);

    // First locked index for path coloring
    const firstLockedIndex = useMemo(() => {
        const idx = levelStates.findIndex(l => l.state === 'locked');
        return idx >= 0 ? idx : levelStates.length;
    }, [levelStates]);

    // Auto-scroll to current level
    useEffect(() => {
        const timer = setTimeout(() => {
            const node = NODE_POSITIONS[currentIndex];
            if (node && scrollRef.current) {
                const scrollY = Math.max(0, node.y - SCREEN_H / 2);
                scrollRef.current.scrollTo({ y: scrollY, animated: true });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [currentIndex]);

    const handleNodePress = useCallback((puzzleId: string) => {
        router.push(`/game/${puzzleId}`);
    }, [router]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView style={styles.flex} edges={['top']}>
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={[
                        styles.mapContent,
                        { height: MAP_HEIGHT + MAP_PADDING_TOP },
                    ]}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >
                    {/* Map container */}
                    <View style={styles.mapContainer}>
                        {/* Path lines */}
                        <MapPath
                            nodes={NODE_POSITIONS}
                            firstLockedIndex={firstLockedIndex}
                        />

                        {/* World banners */}
                        {BANNER_POSITIONS.map((bp) => (
                            <WorldBanner
                                key={`world-${bp.worldIndex}`}
                                worldIndex={bp.worldIndex}
                                y={bp.y}
                            />
                        ))}

                        {/* Level nodes */}
                        {NODE_POSITIONS.map((nodePos) => {
                            const levelState = levelStates[nodePos.index];
                            if (!levelState) return null;

                            const nodeSize = nodePos.isBoss ? BOSS_NODE_SIZE : NODE_SIZE;

                            return (
                                <View
                                    key={`node-${nodePos.index}`}
                                    style={[
                                        styles.nodeWrapper,
                                        {
                                            left: nodePos.x - nodeSize / 2 - 8,
                                            top: nodePos.y - nodeSize / 2 - 8,
                                            width: nodeSize + 16,
                                            height: nodeSize + 30, // extra for stars
                                        },
                                    ]}
                                >
                                    <MapLevelNode
                                        levelNumber={nodePos.index + 1}
                                        state={levelState.state}
                                        stars={levelState.stars}
                                        isBoss={nodePos.isBoss}
                                        onPress={() => handleNodePress(levelState.puzzleId)}
                                    />
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    mapContent: {
        position: 'relative',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    nodeWrapper: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});
