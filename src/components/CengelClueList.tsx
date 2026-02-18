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
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { useUIProfile, useTheme } from '../theme/ThemeContext';

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
    const ui = useUIProfile();
    const t = useTheme();
    const gp = ui.gameplay;
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
        <View style={[styles.container, {
            backgroundColor: t.surface,
            borderColor: t.border,
        }]}>
            {/* Tabs */}
            <View style={[styles.tabsWrapper, { borderBottomColor: t.borderLight }]}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => switchTab('across')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: t.textMuted, fontSize: gp.clueListTabFontSize },
                                tab === 'across' && { color: t.primary, fontWeight: '700' },
                            ]}
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
                            style={[
                                styles.tabText,
                                { color: t.textMuted, fontSize: gp.clueListTabFontSize },
                                tab === 'down' && { color: t.primary, fontWeight: '700' },
                            ]}
                        >
                            Dikey ↓
                        </Text>
                    </TouchableOpacity>
                </View>
                <Animated.View style={[styles.underline, { left: underlineLeft, backgroundColor: t.primary }]} />
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
                                isSelected && {
                                    backgroundColor: t.primary + '0C',
                                    borderLeftWidth: 3,
                                    borderLeftColor: t.primary,
                                },
                                isLocked && {
                                    backgroundColor: t.success + '08',
                                },
                            ]}
                            onPress={() => onSelectEntry(entry)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.numBadge,
                                    {
                                        width: gp.clueListNumSize,
                                        height: gp.clueListNumSize,
                                        borderRadius: gp.clueListNumSize / 2,
                                        backgroundColor: isLocked
                                            ? t.success
                                            : isSelected
                                                ? t.primary
                                                : t.cardAlt,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.numText,
                                        {
                                            color:
                                                isLocked || isSelected
                                                    ? t.textInverse
                                                    : t.primary,
                                        },
                                    ]}
                                >
                                    {num}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.clueText,
                                    {
                                        fontSize: gp.clueListFontSize,
                                        lineHeight: gp.clueListLineHeight,
                                        color: t.text,
                                    },
                                    isLocked && {
                                        color: t.success,
                                        textDecorationLine: 'line-through',
                                    },
                                    isSelected && {
                                        fontWeight: '600',
                                        color: t.primaryDark,
                                    },
                                ]}
                            >
                                {entry.clueText}
                            </Text>
                            {isLocked && <Text style={[styles.checkMark, { color: t.success }]}>✓</Text>}
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
        borderRadius: radius.lg,
        marginHorizontal: 12,
        marginTop: 4,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
    },
    tabsWrapper: {
        position: 'relative',
        borderBottomWidth: StyleSheet.hairlineWidth,
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
        fontWeight: '600',
    },
    underline: {
        position: 'absolute',
        bottom: 0,
        width: '50%',
        height: 2.5,
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
    numBadge: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    numText: {
        fontSize: 11,
        fontWeight: '800',
    },
    clueText: {
        flex: 1,
    },
    checkMark: {
        fontSize: 14,
        fontWeight: '700',
    },
});
