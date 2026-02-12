import React, { useRef, useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

// ── Turkish Q Keyboard Layout ──
const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const KEY_H_MARGIN = 1.5;
const KEYBOARD_H_PAD = 3;

interface Props {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onCheck: () => void;
  onHint: () => void;
  disabled?: boolean;
}

// ── Single Key (memoized) ──
const MemoKey = memo(function Key({
  label,
  onPress,
  width,
  isBackspace,
  disabled,
}: {
  label: string;
  onPress: () => void;
  width: number;
  isBackspace: boolean;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9,
      friction: 5,
      tension: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.key,
          {
            width,
            transform: [{ scale }],
          },
          isBackspace && styles.backspaceKey,
          disabled && styles.disabledKey,
        ]}
      >
        <Text
          style={[
            styles.keyText,
            isBackspace && styles.backspaceText,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

export default function TurkishKeyboard({
  onKeyPress,
  onBackspace,
  onCheck,
  onHint,
  disabled,
}: Props) {
  // Key widths calculated per row for balanced sizing
  const row1Count = ROWS[0].length; // 12
  const row1KeyW = (SCREEN_WIDTH - KEYBOARD_H_PAD * 2 - row1Count * KEY_H_MARGIN * 2) / row1Count;

  const row2Count = ROWS[1].length; // 11
  const row2KeyW = (SCREEN_WIDTH - KEYBOARD_H_PAD * 2 - row2Count * KEY_H_MARGIN * 2) / row2Count;

  // Row 3: 9 letter keys + backspace (1.6x width)
  const row3LetterCount = ROWS[2].length; // 9
  const row3TotalSlots = row3LetterCount + 1.6;
  const row3KeyW = (SCREEN_WIDTH - KEYBOARD_H_PAD * 2 - (row3LetterCount + 1) * KEY_H_MARGIN * 2) / row3TotalSlots;
  const backspaceW = row3KeyW * 1.6;

  const checkScale = useRef(new Animated.Value(1)).current;
  const hintScale = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 0.94, friction: 5, tension: 400, useNativeDriver: true }).start();
  };
  const pressOut = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
  };

  const getKeyWidth = (rowIndex: number) => {
    if (rowIndex === 0) return row1KeyW;
    if (rowIndex === 1) return row2KeyW;
    return row3KeyW;
  };

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <MemoKey
              key={key}
              label={key}
              onPress={() => onKeyPress(key)}
              width={getKeyWidth(rowIndex)}
              isBackspace={false}
              disabled={disabled}
            />
          ))}
          {/* Backspace on row 3 */}
          {rowIndex === 2 && (
            <MemoKey
              label="⌫"
              onPress={onBackspace}
              width={backspaceW}
              isBackspace={true}
              disabled={disabled}
            />
          )}
        </View>
      ))}

      {/* Action row */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onHint();
          }}
          onPressIn={() => pressIn(hintScale)}
          onPressOut={() => pressOut(hintScale)}
          disabled={disabled}
          style={styles.actionFlex}
        >
          <Animated.View
            style={[styles.actionBtn, styles.hintBtn, { transform: [{ scale: hintScale }] }]}
          >
            <Text style={styles.hintText}>💡 İpucu</Text>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onCheck();
          }}
          onPressIn={() => pressIn(checkScale)}
          onPressOut={() => pressOut(checkScale)}
          disabled={disabled}
          style={styles.actionFlex}
        >
          <Animated.View
            style={[styles.actionBtn, styles.checkBtn, { transform: [{ scale: checkScale }] }]}
          >
            <Text style={styles.checkText}>Kontrol Et</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: KEYBOARD_H_PAD,
    paddingBottom: 6,
    paddingTop: 8,
    backgroundColor: '#F2F0F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDD8E8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  key: {
    height: 46,
    borderRadius: radius.md,
    marginHorizontal: KEY_H_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    // iOS-style key shadow
    shadowColor: '#1A1A3E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 2,
  },
  backspaceKey: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1.5,
    borderColor: colors.secondary + '40',
  },
  disabledKey: {
    opacity: 0.3,
  },
  keyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
  backspaceText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 2,
    gap: 10,
    paddingHorizontal: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
  actionBtn: {
    height: 46,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintBtn: {
    backgroundColor: colors.accent + '1A',
    borderWidth: 1.5,
    borderColor: colors.accent + '50',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentDark,
  },
  checkBtn: {
    backgroundColor: colors.primary,
    // Colored shadow for depth
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
