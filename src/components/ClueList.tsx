import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { Word, Direction } from '../game/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

interface Props {
  words: Word[];
  selectedWordId: string | null;
  selectedDirection: Direction;
  lockedWordIds: Set<string>;
  onSelectWord: (word: Word) => void;
}

export default function ClueList({
  words,
  selectedWordId,
  selectedDirection,
  lockedWordIds,
  onSelectWord,
}: Props) {
  const [tab, setTab] = useState<Direction>(selectedDirection);
  const scrollRef = useRef<ScrollView>(null);
  const underlineAnim = useRef(new Animated.Value(selectedDirection === 'across' ? 0 : 1)).current;

  useEffect(() => {
    setTab(selectedDirection);
    Animated.spring(underlineAnim, {
      toValue: selectedDirection === 'across' ? 0 : 1,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  }, [selectedDirection]);

  const switchTab = (dir: Direction) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(dir);
    Animated.spring(underlineAnim, {
      toValue: dir === 'across' ? 0 : 1,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  const acrossWords = words.filter((w) => w.direction === 'across');
  const downWords = words.filter((w) => w.direction === 'down');
  const currentWords = tab === 'across' ? acrossWords : downWords;

  // Underline position interpolation
  const underlineLeft = underlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.container}>
      {/* Underline-style tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab('across')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'across' && styles.activeTabText]}>
              Yatay →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab('down')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'down' && styles.activeTabText]}>
              Dikey ↓
            </Text>
          </TouchableOpacity>
        </View>
        {/* Animated underline */}
        <Animated.View
          style={[styles.underline, { left: underlineLeft }]}
        />
      </View>

      {/* Clue list */}
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {currentWords.map((word) => {
          const isSelected = word.id === selectedWordId;
          const isLocked = lockedWordIds.has(word.id);
          return (
            <TouchableOpacity
              key={word.id}
              style={[
                styles.clueRow,
                isSelected && styles.selectedClue,
                isLocked && styles.lockedClue,
              ]}
              onPress={() => onSelectWord(word)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.numBadge,
                  {
                    backgroundColor: isLocked
                      ? colors.success
                      : isSelected
                        ? colors.primary
                        : colors.cardAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.numText,
                    {
                      color:
                        isLocked || isSelected
                          ? colors.textInverse
                          : colors.primary,
                    },
                  ]}
                >
                  {word.num}
                </Text>
              </View>
              <Text
                style={[
                  styles.clueText,
                  isLocked && styles.lockedText,
                  isSelected && styles.selectedClueText,
                ]}
                numberOfLines={2}
              >
                {word.clue}
              </Text>
              {isLocked && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  tabsWrapper: {
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.sm,
    gap: 3,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    gap: 10,
  },
  selectedClue: {
    backgroundColor: colors.primary + '0C',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  lockedClue: {
    backgroundColor: colors.success + '08',
  },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clueText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  selectedClueText: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  lockedText: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
  checkMark: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
  },
});
