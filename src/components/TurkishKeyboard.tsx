import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

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

export default function TurkishKeyboard({
  onKeyPress,
  onBackspace,
  onCheck,
  onHint,
  disabled,
}: Props) {
  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isBackspace = key === '⌫';
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  isBackspace && styles.backspaceKey,
                  disabled && styles.disabledKey,
                ]}
                onPress={() => {
                  if (disabled) return;
                  if (isBackspace) onBackspace();
                  else onKeyPress(key);
                }}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.keyText,
                    isBackspace && styles.backspaceText,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.hintBtn]}
          onPress={onHint}
          disabled={disabled}
        >
          <Text style={styles.actionText}>💡 İpucu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.checkBtn]}
          onPress={onCheck}
          disabled={disabled}
        >
          <Text style={[styles.actionText, styles.checkText]}>Kontrol Et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const keyWidth = (SCREEN_WIDTH - 20) / 11;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingBottom: 4,
    backgroundColor: '#ECEFF1',
    borderTopWidth: 1,
    borderTopColor: '#CFD8DC',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  key: {
    width: keyWidth,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginHorizontal: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  backspaceKey: {
    width: keyWidth * 1.4,
    backgroundColor: '#B0BEC5',
  },
  disabledKey: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  backspaceText: {
    fontSize: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 2,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  hintBtn: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  checkBtn: {
    backgroundColor: '#1565C0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
  },
  checkText: {
    color: '#FFFFFF',
  },
});
