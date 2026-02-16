import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    LayoutAnimation,
} from 'react-native';
import { Entry } from '../cengel/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

interface Props {
    entries: Entry[];
    activeEntryId: string | null;
    activeDirection: 'across' | 'down';
    lockedEntryIds: Set<string>;
    onSelectEntry: (entry: Entry) => void;
}

export default function CengelClueList({
    entries,
    activeEntryId,
    activeDirection,
    lockedEntryIds,
    onSelectEntry,
}: Props) {
    const [tab, setTab] = useState<'across' | 'down'>(activeDirection);
    const scrollRef = useRef<ScrollView>(null);
    const underlineAnim = useRef(
        new Animated.Value(activeDirection === 'across' ? 0 : 1),
    ).current;

    useEffect(() => {
        setTab(activeDirection);
        Animated.spring(underlineAnim, {
            toValue: activeDirection === 'across' ? 0 : 1,
            friction: 8,
            tension: 80,
            useNativeDriver: false,
        }).start();
    }, [activeDirection]);

    const switchTab = (dir: 'across' | 'down') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTab(dir);
        Animated.spring(underlineAnim, {
            toValue: dir === 'across' ? 0 : 1,
            friction: 8,
            tension: 80,
            useNativeDriver: false,
        }).start();
    };

    const acrossEntries = useMemo(
        () => entries.filter((e) => e.direction === 'across'),
        [entries],
    );
    const downEntries = useMemo(
        () => entries.filter((e) => e.direction === 'down'),
        [entries],
    );
    const currentEntries = tab === 'across' ? acrossEntries : downEntries;

    const underlineLeft = underlineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'],
    });

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabsWrapper}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => switchTab('across')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[styles.tabText, tab === 'across' && styles.activeTabText]}
                        >
                            Yatay →
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => switchTab('down')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[styles.tabText, tab === 'down' && styles.activeTabText]}
                        >
                            Dikey ↓
                        </Text>
                    </TouchableOpacity>
                </View>
                <Animated.View style={[styles.underline, { left: underlineLeft }]} />
            </View>

            {/* Clue list */}
            <ScrollView
                ref={scrollRef}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {currentEntries.map((entry, idx) => {
                    const isSelected = entry.id === activeEntryId;
                    const isLocked = lockedEntryIds.has(entry.id);
                    const num = idx + 1;
                    return (
                        <TouchableOpacity
                            key={entry.id}
                            style={[
                                styles.clueRow,
                                isSelected && styles.selectedClue,
                                isLocked && styles.lockedClue,
                            ]}
                            onPress={() => onSelectEntry(entry)}
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
                                    {num}
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
                                {entry.clueText}
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
        marginHorizontal: 12,
        marginTop: 4,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
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
