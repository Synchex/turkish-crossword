import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

const ROWS = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '⌫'],
];

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onCheck: () => void;
  onHint: () => void;
  disabled?: boolean;
}

function Key({
  label,
  onPress,
  isBackspace,
  disabled,
  keyWidth,
}: {
  label: string;
  onPress: () => void;
  isBackspace: boolean;
  disabled?: boolean;
  keyWidth: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
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
            width: isBackspace ? keyWidth * 1.4 : keyWidth,
            backgroundColor: isBackspace ? colors.cardAlt : colors.surface,
            transform: [{ scale }],
          },
          disabled && styles.disabledKey,
        ]}
      >
        <Text
          style={[
            styles.keyText,
            isBackspace && styles.backspaceText,
            { color: isBackspace ? colors.secondary : colors.text },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function TurkishKeyboard({
  onKeyPress,
  onBackspace,
  onCheck,
  onHint,
  disabled,
}: Props) {
  const keyWidth = (SCREEN_WIDTH - 24) / 11;

  const checkScale = useRef(new Animated.Value(1)).current;
  const hintScale = useRef(new Animated.Value(1)).current;

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isBackspace = key === '⌫';
            return (
              <Key
                key={key}
                label={key}
                onPress={() => {
                  if (isBackspace) onBackspace();
                  else onKeyPress(key);
                }}
                isBackspace={isBackspace}
                disabled={disabled}
                keyWidth={keyWidth}
              />
            );
          })}
        </View>
      ))}

      {/* Action row */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onHint();
          }}
          onPressIn={() => {
            Animated.spring(hintScale, { toValue: 0.93, useNativeDriver: true }).start();
          }}
          onPressOut={() => {
            Animated.spring(hintScale, { toValue: 1, useNativeDriver: true }).start();
          }}
          disabled={disabled}
        >
          <Animated.View
            style={[
              styles.actionBtn,
              styles.hintBtn,
              { transform: [{ scale: hintScale }] },
            ]}
          >
            <Text style={styles.hintText}>💡 İpucu</Text>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onCheck();
          }}
          onPressIn={() => {
            Animated.spring(checkScale, { toValue: 0.93, useNativeDriver: true }).start();
          }}
          onPressOut={() => {
            Animated.spring(checkScale, { toValue: 1, useNativeDriver: true }).start();
          }}
          disabled={disabled}
        >
          <Animated.View
            style={[
              styles.actionBtn,
              styles.checkBtn,
              { transform: [{ scale: checkScale }] },
            ]}
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
    paddingHorizontal: 4,
    paddingBottom: 4,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  key: {
    height: 44,
    borderRadius: radius.sm,
    marginHorizontal: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  disabledKey: {
    opacity: 0.35,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backspaceText: {
    fontSize: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    gap: 10,
    paddingHorizontal: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: (SCREEN_WIDTH - 40) / 2,
  },
  hintBtn: {
    backgroundColor: colors.accent + '25',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentDark,
  },
  checkBtn: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  checkText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
