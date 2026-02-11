import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { CellData } from '../game/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  grid: CellData[][];
  gridSize: number;
  selectedCell: { row: number; col: number } | null;
  selectedWordCells: Array<{ row: number; col: number }>;
  onCellPress: (row: number, col: number) => void;
  shakeCell?: { row: number; col: number } | null;
  correctFlash?: boolean;
}

export default function CrosswordGrid({
  grid,
  gridSize,
  selectedCell,
  selectedWordCells,
  onCellPress,
  shakeCell,
  correctFlash,
}: Props) {
  const cellSize = Math.floor((SCREEN_WIDTH - 40) / gridSize);
  const gridWidth = cellSize * gridSize;

  return (
    <View style={[styles.container, { width: gridWidth + 4, height: gridWidth + 4 }]}>
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            cell={cell}
            cellSize={cellSize}
            isSelected={selectedCell?.row === r && selectedCell?.col === c}
            isWordHighlight={selectedWordCells.some(
              (wc) => wc.row === r && wc.col === c
            )}
            onPress={() => onCellPress(r, c)}
            shouldShake={shakeCell?.row === r && shakeCell?.col === c}
            correctFlash={correctFlash && cell.isLocked}
          />
        ))
      )}
    </View>
  );
}

function Cell({
  cell,
  cellSize,
  isSelected,
  isWordHighlight,
  onPress,
  shouldShake,
  correctFlash,
}: {
  cell: CellData;
  cellSize: number;
  isSelected: boolean;
  isWordHighlight: boolean;
  onPress: () => void;
  shouldShake?: boolean;
  correctFlash?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cell.userLetter) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.12,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cell.userLetter]);

  useEffect(() => {
    if (shouldShake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [shouldShake]);

  if (cell.isBlack) {
    return (
      <View
        style={[
          styles.cell,
          styles.blackCell,
          {
            width: cellSize,
            height: cellSize,
            top: cell.row * cellSize + 2,
            left: cell.col * cellSize + 2,
          },
        ]}
      />
    );
  }

  let bgColor = colors.surface;
  if (cell.isLocked) bgColor = correctFlash ? colors.success : colors.successLight;
  else if (isSelected) bgColor = colors.accent;
  else if (isWordHighlight) bgColor = colors.warningLight;

  const borderColor = cell.isLocked
    ? colors.success
    : isSelected
      ? colors.accentDark
      : colors.border;

  const borderWidth = isSelected ? 2 : 1;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ position: 'absolute', top: cell.row * cellSize + 2, left: cell.col * cellSize + 2 }}
    >
      <Animated.View
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: bgColor,
            borderColor,
            borderWidth,
            borderRadius: radius.xs,
            transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {cell.number !== undefined && (
          <Text
            style={[
              styles.number,
              { fontSize: cellSize * 0.2, color: colors.textSecondary },
            ]}
          >
            {cell.number}
          </Text>
        )}
        <Text
          style={[
            styles.letter,
            {
              fontSize: cellSize * 0.42,
              color: cell.isRevealed
                ? colors.primary
                : cell.isLocked
                  ? colors.successDark
                  : colors.text,
            },
          ]}
        >
          {cell.userLetter}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackCell: {
    backgroundColor: colors.border,
  },
  number: {
    position: 'absolute',
    top: 1,
    left: 3,
    fontWeight: '700',
  },
  letter: {
    fontWeight: '700',
    fontFamily: 'System',
  },
});
