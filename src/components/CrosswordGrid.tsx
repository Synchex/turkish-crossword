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
  const cellSize = Math.floor((SCREEN_WIDTH - 32) / gridSize);
  const gridWidth = cellSize * gridSize;

  return (
    <View style={[styles.container, { width: gridWidth, height: gridWidth }]}>
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

  useEffect(() => {
    if (cell.userLetter) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cell.userLetter]);

  useEffect(() => {
    if (shouldShake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
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
            top: cell.row * cellSize,
            left: cell.col * cellSize,
          },
        ]}
      />
    );
  }

  let bgColor = '#FFFFFF';
  if (cell.isLocked) bgColor = correctFlash ? '#81C784' : '#E8F5E9';
  else if (isSelected) bgColor = '#FFF176';
  else if (isWordHighlight) bgColor = '#FFF9C4';

  const borderColor = cell.isLocked ? '#4CAF50' : isSelected ? '#F57F17' : '#424242';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ position: 'absolute', top: cell.row * cellSize, left: cell.col * cellSize }}
    >
      <Animated.View
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            backgroundColor: bgColor,
            borderColor,
            transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {cell.number !== undefined && (
          <Text style={[styles.number, { fontSize: cellSize * 0.22 }]}>{cell.number}</Text>
        )}
        <Text
          style={[
            styles.letter,
            {
              fontSize: cellSize * 0.45,
              color: cell.isRevealed ? '#1565C0' : cell.isLocked ? '#2E7D32' : '#212121',
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
    borderWidth: 2,
    borderColor: '#212121',
    backgroundColor: '#212121',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#424242',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackCell: {
    backgroundColor: '#212121',
  },
  number: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontWeight: '700',
    color: '#757575',
  },
  letter: {
    fontWeight: '700',
    fontFamily: 'System',
  },
});
