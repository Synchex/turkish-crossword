/**
 * CluePopover — Compact bottom sheet showing clue details.
 * Shows clue text, direction, word length, and optional direction toggle.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word, Direction } from '../game/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
    visible: boolean;
    word: Word | null;
    /** Whether the current cell also has the other direction */
    hasBothDirections: boolean;
    onClose: () => void;
    onToggleDirection: () => void;
}

export default function CluePopover({
    visible,
    word,
    hasBothDirections,
    onClose,
    onToggleDirection,
}: Props) {
    if (!word) return null;

    const dirLabel = word.direction === 'across' ? 'Yatay' : 'Dikey';
    const dirIcon = word.direction === 'across' ? 'arrow-forward' : 'arrow-down';
    const length = word.answer.length;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Title row */}
                    <View style={styles.titleRow}>
                        <View style={styles.numBadge}>
                            <Text style={styles.numText}>{word.num}</Text>
                        </View>
                        <Text style={styles.title}>İpucu</Text>
                        <View style={styles.dirBadge}>
                            <Ionicons
                                name={dirIcon as any}
                                size={12}
                                color={colors.primary}
                            />
                            <Text style={styles.dirText}>{dirLabel}</Text>
                        </View>
                    </View>

                    {/* Clue text */}
                    <ScrollView
                        style={styles.clueScroll}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.clueText}>{word.clue}</Text>
                    </ScrollView>

                    {/* Meta row */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                            <Text style={styles.metaText}>
                                {length} harf
                            </Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Ionicons
                                name={dirIcon as any}
                                size={11}
                                color={colors.textSecondary}
                            />
                            <Text style={styles.metaText}>{dirLabel}</Text>
                        </View>
                    </View>

                    {/* Toggle direction button */}
                    {hasBothDirections && (
                        <Pressable
                            style={styles.toggleBtn}
                            onPress={() => {
                                onToggleDirection();
                                onClose();
                            }}
                        >
                            <Ionicons
                                name="swap-horizontal"
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.toggleText}>Yön değiştir</Text>
                        </Pressable>
                    )}

                    {/* Close */}
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={onClose}
                    >
                        <Text style={styles.closeText}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.overlay,
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    // Title row
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    numBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numText: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textInverse,
    },
    title: {
        ...typography.h2,
        color: colors.text,
        flex: 1,
    },
    dirBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primary + '14',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.full,
    },
    dirText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    // Clue
    clueScroll: {
        maxHeight: 120,
        marginBottom: spacing.md,
    },
    clueText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    // Meta
    metaRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.cardAlt,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.md,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    // Toggle
    toggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        backgroundColor: colors.primary + '0C',
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.primary + '30',
        marginBottom: spacing.sm,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    // Close
    closeBtn: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.xs,
    },
    closeText: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
});
