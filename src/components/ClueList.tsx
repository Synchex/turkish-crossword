import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Word, Direction } from '../game/types';

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
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        showsVerticalScrollIndicator={false}
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
            >
              <Text style={[styles.clueNum, isLocked && styles.lockedText]}>
                {word.num}.
              </Text>
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
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#1565C0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    paddingHorizontal: 8,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginVertical: 2,
  },
  selectedClue: {
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#F9A825',
  },
  lockedClue: {
    backgroundColor: '#E8F5E9',
  },
  clueNum: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565C0',
    width: 28,
  },
  clueText: {
    fontSize: 13,
    color: '#424242',
    flex: 1,
  },
  selectedClueText: {
    fontWeight: '600',
    color: '#212121',
  },
  lockedText: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  checkMark: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 4,
  },
});
