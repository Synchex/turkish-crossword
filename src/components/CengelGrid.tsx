import React, { memo, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GameCell, Entry } from '../cengel/types';
import { colors } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 12;

interface CengelGridProps {
    gameGrid: GameCell[][];
    gridSize: [number, number];
    selectedCell: { row: number; col: number } | null;
    activeEntryCells: Array<{ row: number; col: number }>;
    onCellPress: (row: number, col: number) => void;
    correctFlash?: boolean;
}

export default function CengelGrid({
    gameGrid,
    gridSize,
    selectedCell,
    activeEntryCells,
    onCellPress,
    correctFlash,
}: CengelGridProps) {
    const [rows, cols] = gridSize;
    const availableWidth = SCREEN_WIDTH - GRID_PADDING * 2;
    const gap = 1.5;
    const cellSize = Math.floor((availableWidth - gap * (cols - 1)) / cols);
    const gridWidth = cellSize * cols + gap * (cols - 1);
    const gridHeight = cellSize * rows + gap * (rows - 1);

    // Selected cells set for fast lookup
    const activeSet = useMemo(() => {
        const set = new Set<string>();
        activeEntryCells.forEach((c) => set.add(`${c.row},${c.col}`));
        return set;
    }, [activeEntryCells]);

    return (
        <View style={[styles.container, { paddingHorizontal: GRID_PADDING }]}>
            <View
                style={[
                    styles.gridCard,
                    { width: gridWidth + 8, height: gridHeight + 8 },
                ]}
            >
                <View style={{ width: gridWidth, height: gridHeight }}>
                    {gameGrid.map((row, r) =>
                        row.map((cell, c) => (
                            <MemoCell
                                key={`${r}-${c}`}
                                cell={cell}
                                cellSize={cellSize}
                                gap={gap}
                                isSelected={
                                    selectedCell?.row === r && selectedCell?.col === c
                                }
                                isHighlighted={activeSet.has(`${r},${c}`)}
                                onPress={() => onCellPress(r, c)}
                                correctFlash={correctFlash}
                            />
                        )),
                    )}
                </View>
            </View>
        </View>
    );
}

// ── Memoized Cell ──
interface CellComponentProps {
    cell: GameCell;
    cellSize: number;
    gap: number;
    isSelected: boolean;
    isHighlighted: boolean;
    onPress: () => void;
    correctFlash?: boolean;
}

const MemoCell = memo(function CellComponent({
    cell,
    cellSize,
    gap,
    isSelected,
    isHighlighted,
    onPress,
    correctFlash,
}: CellComponentProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (cell.type === 'LETTER' && cell.userLetter) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 60,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [cell.type === 'LETTER' ? cell.userLetter : '']);

    const top = cell.row * (cellSize + gap);
    const left = cell.col * (cellSize + gap);

    // ── BLOCK cell ──
    if (cell.type === 'BLOCK') {
        return (
            <View
                style={[
                    styles.cell,
                    {
                        position: 'absolute',
                        top,
                        left,
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: '#1A1A2E',
                        borderRadius: 2,
                    },
                ]}
            />
        );
    }

    // ── CLUE cell ──
    if (cell.type === 'CLUE') {
        const hasAcross = !!cell.clueAcross;
        const hasDown = !!cell.clueDown;
        const displayClue = cell.clueAcross || cell.clueDown || '';
        const arrowSize = Math.max(8, cellSize * 0.2);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    Haptics.selectionAsync();
                    onPress();
                }}
                style={{ position: 'absolute', top, left, zIndex: 2 }}
            >
                <View
                    style={[
                        styles.clueCell,
                        { width: cellSize, height: cellSize },
                    ]}
                >
                    {/* Text area — takes all space above arrows */}
                    <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
                        <Text
                            style={[
                                styles.clueText,
                                { fontSize: cellSize * 0.18 },
                            ]}
                            adjustsFontSizeToFit
                            minimumFontScale={0.4}
                        >
                            {displayClue}
                        </Text>
                    </View>

                    {/* Arrow indicators */}
                    <View style={styles.arrowContainer}>
                        {hasAcross && (
                            <Ionicons
                                name="arrow-forward"
                                size={arrowSize}
                                color={colors.primary}
                            />
                        )}
                        {hasDown && (
                            <Ionicons
                                name="arrow-down"
                                size={arrowSize}
                                color={colors.primary}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // ── LETTER cell ──
    const isLocked = cell.isLocked ?? false;
    const isRevealed = cell.isRevealed ?? false;

    let bgColor = '#FFFFFF';
    let borderColor = 'rgba(0,0,0,0.12)';
    let borderW = StyleSheet.hairlineWidth;
    let letterColor = '#1A1A2E';

    if (isLocked) {
        bgColor = '#E8FAE8';
        borderColor = colors.success;
        borderW = 1.5;
        letterColor = colors.successDark;
    } else if (correctFlash && isHighlighted) {
        bgColor = '#E8FAE8';
    } else if (isSelected) {
        bgColor = '#EDE7FA';
        borderColor = colors.primary;
        borderW = 2;
    } else if (isHighlighted) {
        bgColor = '#F3F0FF';
        borderColor = colors.primaryLight;
        borderW = 1;
    }

    if (isRevealed) {
        letterColor = colors.accent;
    }

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
                Haptics.selectionAsync();
                onPress();
            }}
            style={{ position: 'absolute', top, left, zIndex: isSelected ? 10 : 1 }}
        >
            <Animated.View
                style={[
                    styles.cell,
                    {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: bgColor,
                        borderColor,
                        borderWidth: borderW,
                        borderRadius: 3,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Text
                    style={[
                        styles.letterText,
                        {
                            fontSize: Math.max(12, cellSize * 0.45),
                            color: letterColor,
                        },
                    ]}
                >
                    {cell.userLetter ?? ''}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 6,
        paddingBottom: 10,
    },
    gridCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    clueCell: {
        backgroundColor: '#F5F0EB',
        borderRadius: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
        padding: 2,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        overflow: 'hidden',
    },
    clueText: {
        color: '#4A3B2A',
        fontWeight: '600',
        textAlign: 'left',
        flex: 1,
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        alignSelf: 'flex-end',
    },
    letterText: {
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: undefined, // Will use system default for maximum Turkish char support
    },
});
