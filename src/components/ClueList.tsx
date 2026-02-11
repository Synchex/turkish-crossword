import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Word, Direction } from '../game/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

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
  const [tab, setTab] = React.useState<Direction>(selectedDirection);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTab(selectedDirection);
  }, [selectedDirection]);

  const acrossWords = words.filter((w) => w.direction === 'across');
  const downWords = words.filter((w) => w.direction === 'down');
  const currentWords = tab === 'across' ? acrossWords : downWords;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'across' && styles.activeTab]}
          onPress={() => setTab('across')}
        >
          <Text style={[styles.tabText, tab === 'across' && styles.activeTabText]}>
            Yatay →
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'down' && styles.activeTab]}
          onPress={() => setTab('down')}
        >
          <Text style={[styles.tabText, tab === 'down' && styles.activeTabText]}>
            Dikey ↓
          </Text>
        </TouchableOpacity>
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
                      color: isLocked || isSelected
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
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.textInverse,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.sm,
    gap: 4,
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
    backgroundColor: colors.primary + '12',
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
  },
  lockedClue: {
    backgroundColor: colors.successLight,
  },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    fontSize: 12,
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
    color: colors.primary,
  },
  lockedText: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
  checkMark: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '700',
  },
});
