import React, { useEffect, useRef, memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CellData, Word } from '../game/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { buildStartCellMap, StartCellInfo } from '../utils/crosswordHelpers';
import type { CellFeedback } from '../hooks/useCellFeedback';
import { cellKey } from '../hooks/useCellFeedback';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_H_PADDING = 16;

interface Props {
  grid: CellData[][];
  gridSize: number;
  selectedCell: { row: number; col: number } | null;
  selectedWordCells: Array<{ row: number; col: number }>;
  onCellPress: (row: number, col: number) => void;
  shakeCell?: { row: number; col: number } | null;
  correctFlash?: boolean;
  // ── Clue chip props ──
  words?: Word[];
  selectedWordId?: string | null;
  onClueChipPress?: (word: Word) => void;
  // ── Cell feedback ──
  cellFeedback?: CellFeedback;
}

export default function CrosswordGrid({
  grid,
  gridSize,
  selectedCell,
  selectedWordCells,
  onCellPress,
  shakeCell,
  correctFlash,
  words,
  selectedWordId,
  onClueChipPress,
  cellFeedback,
}: Props) {
  const GAP = 2.5;
  const cardInnerPad = 8;
  const totalGaps = (gridSize - 1) * GAP;
  const cellSize = Math.floor(
    (SCREEN_WIDTH - CARD_H_PADDING * 2 - cardInnerPad * 2 - totalGaps) / gridSize
  );
  const gridWidth = cellSize * gridSize + totalGaps + cardInnerPad * 2;

  // Build start-cell map (memoized)
  const startCellMap = useMemo(
    () => (words ? buildStartCellMap(words) : new Map<string, StartCellInfo>()),
    [words],
  );

  return (
    <View style={styles.heroWrapper}>
      {/* Floating hero card */}
      <View style={[styles.heroCard, { width: gridWidth }]}>
        <View style={[styles.gridInner, { padding: cardInnerPad, height: cellSize * gridSize + totalGaps + cardInnerPad * 2 }]}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const startInfo = startCellMap.get(`${r},${c}`);
              return (
                <MemoCell
                  key={`${r}-${c}`}
                  cell={cell}
                  cellSize={cellSize}
                  gap={GAP}
                  isSelected={selectedCell?.row === r && selectedCell?.col === c}
                  isWordHighlight={selectedWordCells.some(
                    (wc) => wc.row === r && wc.col === c
                  )}
                  onPress={() => onCellPress(r, c)}
                  shouldShake={shakeCell?.row === r && shakeCell?.col === c}
                  correctFlash={correctFlash && cell.isLocked}
                  startInfo={startInfo}
                  selectedWordId={selectedWordId ?? null}
                  onClueChipPress={onClueChipPress}
                  cellFeedback={cellFeedback}
                />
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

// ── Memoized Cell ──
interface CellProps {
  cell: CellData;
  cellSize: number;
  gap: number;
  isSelected: boolean;
  isWordHighlight: boolean;
  onPress: () => void;
  shouldShake?: boolean;
  correctFlash?: boolean;
  startInfo?: StartCellInfo;
  selectedWordId: string | null;
  onClueChipPress?: (word: Word) => void;
  cellFeedback?: CellFeedback;
}

const MemoCell = memo(function Cell({
  cell,
  cellSize,
  gap,
  isSelected,
  isWordHighlight,
  onPress,
  shouldShake,
  correctFlash,
  startInfo,
  selectedWordId,
  onClueChipPress,
  cellFeedback,
}: CellProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Register with cellFeedback — get (or create) the animated values for this cell
  const feedbackVals = useMemo(() => {
    if (!cellFeedback) return null;
    return cellFeedback.getValues(cellKey(cell.row, cell.col));
  }, [cellFeedback, cell.row, cell.col]);

  // Letter entry bounce
  useEffect(() => {
    if (cell.userLetter) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.18,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: isSelected ? 1.05 : 1,
          friction: 4,
          tension: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cell.userLetter]);

  // Active cell scale
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  // Wrong answer shake (legacy prop-driven)
  useEffect(() => {
    if (shouldShake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]).start();
    }
  }, [shouldShake]);

  // Combine transforms: base scale + feedback scale, base shake + feedback shake
  const combinedTranslateX = feedbackVals
    ? Animated.add(shakeAnim, feedbackVals.shakeX)
    : shakeAnim;

  const combinedScale = feedbackVals
    ? Animated.multiply(scaleAnim, feedbackVals.scale)
    : scaleAnim;

  // Top / left position with gaps
  const top = cell.row * (cellSize + gap);
  const left = cell.col * (cellSize + gap);

  if (cell.isBlack) {
    return (
      <View
        style={[
          styles.cell,
          styles.blackCell,
          { width: cellSize, height: cellSize, top, left },
        ]}
      />
    );
  }

  // ── State-driven styling ──
  const isLocked = cell.isLocked;
  const isCorrectGlow = correctFlash && isLocked;

  let bgColor = '#FFFFFF';
  let borderColor = '#D8D5E2';
  let borderW = 1;
  let elevationStyle = {};

  if (isCorrectGlow) {
    bgColor = '#A3FFD2';
    borderColor = colors.success;
    borderW = 2;
  } else if (isLocked) {
    bgColor = '#EAFFF4';
    borderColor = '#B8E8D0';
  } else if (isSelected) {
    bgColor = '#F0EDFF';
    borderColor = colors.primary;
    borderW = 2.5;
    elevationStyle = {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    };
  } else if (isWordHighlight) {
    bgColor = '#F7F5FF';
    borderColor = '#CCCADD';
  }

  const letterColor = cell.isRevealed
    ? colors.primary
    : isLocked
      ? '#158A5D'
      : isSelected
        ? colors.primaryDark
        : '#1A1A2E';

  // ── Clue chips ──
  const hasAcrossStart = !!startInfo?.across;
  const hasDownStart = !!startInfo?.down;
  const hasBothStarts = hasAcrossStart && hasDownStart;

  // Chip sizing (responsive to cell size)
  const chipH = Math.max(10, cellSize * 0.3);
  const chipFont = Math.max(6, cellSize * 0.17);
  const chipPadH = Math.max(2, cellSize * 0.06);

  // Flash border color: interpolate from opacity
  const flashBorderColor = feedbackVals
    ? feedbackVals.flashOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', feedbackVals.flashType === 'correct' ? '#34D399' : '#F87171'],
    })
    : undefined;

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
            borderRadius: radius.md,
            transform: [{ translateX: combinedTranslateX }, { scale: combinedScale }],
          },
          elevationStyle,
        ]}
      >
        {/* Feedback flash overlay */}
        {feedbackVals && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: radius.md,
                zIndex: 0,
                borderWidth: 2.5,
                borderColor: flashBorderColor,
                opacity: feedbackVals.flashOpacity,
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* ── Purple clue chip(s) ── */}
        {hasAcrossStart && (
          <ClueChip
            num={startInfo!.across!.word.num}
            suffix="A"
            isActive={selectedWordId === startInfo!.across!.word.id}
            position="topLeft"
            chipH={chipH}
            chipFont={chipFont}
            chipPadH={chipPadH}
            onPress={() => onClueChipPress?.(startInfo!.across!.word)}
          />
        )}
        {hasDownStart && (
          <ClueChip
            num={startInfo!.down!.word.num}
            suffix="D"
            isActive={selectedWordId === startInfo!.down!.word.id}
            position={hasBothStarts ? 'topRight' : 'topLeft'}
            chipH={chipH}
            chipFont={chipFont}
            chipPadH={chipPadH}
            onPress={() => onClueChipPress?.(startInfo!.down!.word)}
          />
        )}

        {/* Letter */}
        <Text
          style={[
            styles.letter,
            {
              fontSize: cellSize * 0.44,
              color: letterColor,
              marginTop: (hasAcrossStart || hasDownStart) ? chipH * 0.3 : 0,
              zIndex: 1,
            },
          ]}
        >
          {cell.userLetter}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

// ── Purple Clue Chip ──

interface ChipProps {
  num: number;
  suffix: 'A' | 'D';
  isActive: boolean;
  position: 'topLeft' | 'topRight';
  chipH: number;
  chipFont: number;
  chipPadH: number;
  onPress: () => void;
}

function ClueChip({
  num,
  suffix,
  isActive,
  position,
  chipH,
  chipFont,
  chipPadH,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      hitSlop={4}
      style={[
        styles.clueChip,
        {
          height: chipH,
          paddingHorizontal: chipPadH,
          borderRadius: chipH * 0.3,
          backgroundColor: isActive ? colors.primary : '#7C6BC4',
          opacity: isActive ? 1 : 0.75,
          transform: [{ scale: isActive ? 1.08 : 1 }],
        },
        position === 'topLeft' ? { left: 1, top: 1 } : { right: 1, top: 1 },
      ]}
    >
      <Text
        style={[
          styles.clueChipText,
          { fontSize: chipFont },
        ]}
      >
        {num}{suffix}
      </Text>
    </Pressable>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  heroWrapper: {
    paddingHorizontal: CARD_H_PADDING,
    paddingTop: 6,
    paddingBottom: 10,
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    // Dramatic hero shadow
    shadowColor: '#2D2B55',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  gridInner: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackCell: {
    backgroundColor: '#F0EEF5',
    borderRadius: radius.md,
    borderWidth: 0,
  },
  letter: {
    fontWeight: '800',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  // ── Clue chip ──
  clueChip: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    shadowColor: '#3B2880',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  clueChipText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
