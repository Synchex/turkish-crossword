import React, { useRef, useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { useUIProfile, useTheme } from '../theme/ThemeContext';

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
  height,
  fontSize,
  isBackspace,
  disabled,
  keyBg,
  keyTextColor,
  backspaceBg,
  backspaceBorderColor,
  backspaceTextColor,
}: {
  label: string;
  onPress: () => void;
  width: number;
  height: number;
  fontSize: number;
  isBackspace: boolean;
  disabled?: boolean;
  keyBg: string;
  keyTextColor: string;
  backspaceBg: string;
  backspaceBorderColor: string;
  backspaceTextColor: string;
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
            height,
            backgroundColor: isBackspace ? backspaceBg : keyBg,
            transform: [{ scale }],
          },
          isBackspace && { borderWidth: 1.5, borderColor: backspaceBorderColor },
          disabled && styles.disabledKey,
        ]}
      >
        <Text
          style={[
            styles.keyText,
            {
              fontSize,
              color: isBackspace ? backspaceTextColor : keyTextColor,
            },
            isBackspace && { fontWeight: '700' },
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
  const ui = useUIProfile();
  const t = useTheme();
  const gp = ui.gameplay;

  // Theme-derived key colors
  const keyBg = t.surface;
  const keyTextColor = t.text;
  const backspaceBg = t.id === 'black' ? '#2A1A1A' : '#FFE8E8';
  const backspaceBorderColor = t.secondary + '40';
  const backspaceTextColor = t.id === 'black' ? '#FF6B6B' : '#C0392B';
  const containerBg = t.id === 'black' ? t.surface2 : '#F2F0F7';
  const containerBorder = t.borderLight;

  // Key widths calculated per row for balanced sizing
  const row1Count = ROWS[0].length;
  const row1KeyW = (SCREEN_WIDTH - KEYBOARD_H_PAD * 2 - row1Count * KEY_H_MARGIN * 2) / row1Count;

  const row2Count = ROWS[1].length;
  const row2KeyW = (SCREEN_WIDTH - KEYBOARD_H_PAD * 2 - row2Count * KEY_H_MARGIN * 2) / row2Count;

  const row3LetterCount = ROWS[2].length;
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
    <View style={[styles.container, { backgroundColor: containerBg, borderTopColor: containerBorder }]}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <MemoKey
              key={key}
              label={key}
              onPress={() => onKeyPress(key)}
              width={getKeyWidth(rowIndex)}
              height={gp.keyHeight}
              fontSize={gp.keyFontSize}
              isBackspace={false}
              disabled={disabled}
              keyBg={keyBg}
              keyTextColor={keyTextColor}
              backspaceBg={backspaceBg}
              backspaceBorderColor={backspaceBorderColor}
              backspaceTextColor={backspaceTextColor}
            />
          ))}
          {rowIndex === 2 && (
            <MemoKey
              label="⌫"
              onPress={onBackspace}
              width={backspaceW}
              height={gp.keyHeight}
              fontSize={gp.keyFontSize + 5}
              isBackspace={true}
              disabled={disabled}
              keyBg={keyBg}
              keyTextColor={keyTextColor}
              backspaceBg={backspaceBg}
              backspaceBorderColor={backspaceBorderColor}
              backspaceTextColor={backspaceTextColor}
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
            style={[
              styles.actionBtn,
              {
                height: gp.actionBtnHeight,
                backgroundColor: t.accent + '1A',
                borderWidth: 1.5,
                borderColor: t.accent + '50',
                transform: [{ scale: hintScale }],
              },
            ]}
          >
            <Text style={[styles.hintText, { fontSize: gp.actionFontSize, color: t.id === 'black' ? t.accent : '#C67700' }]}>
              {ui.mode === 'accessible' ? 'İpucu Al' : '💡 İpucu'}
            </Text>
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
            style={[
              styles.actionBtn,
              {
                height: gp.actionBtnHeight,
                backgroundColor: t.primary,
                shadowColor: t.primaryDark,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Text style={[styles.checkText, { fontSize: gp.actionFontSize }]}>Kontrol Et</Text>
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
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  key: {
    borderRadius: radius.md,
    marginHorizontal: KEY_H_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1A3E',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 2,
  },
  disabledKey: {
    opacity: 0.3,
  },
  keyText: {
    fontWeight: '600',
    letterSpacing: 0.3,
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
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontWeight: '700',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
