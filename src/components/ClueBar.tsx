import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../cengel/types';
import { useUIProfile, useTheme } from '../theme/ThemeContext';

interface ClueBarProps {
    entry: Entry | null;
    /** Whether both directions exist at the active cell */
    canToggle: boolean;
    onToggle: () => void;
}

export default function ClueBar({ entry, canToggle, onToggle }: ClueBarProps) {
    const ui = useUIProfile();
    const t = useTheme();
    const gp = ui.gameplay;

    if (!entry) {
        return (
            <View style={[styles.bar, {
                minHeight: gp.clueBarMinHeight,
                backgroundColor: t.surface,
                borderColor: t.border,
            }]}>
                <Text style={[styles.placeholder, { fontSize: gp.clueBarFontSize, color: t.textMuted }]}>Bir hücreye dokun</Text>
            </View>
        );
    }

    const dirLabel = entry.direction === 'across' ? 'Yatay' : 'Dikey';
    const dirIcon = entry.direction === 'across' ? 'arrow-forward' : 'arrow-down';
    const toggleSize = Math.max(32, ui.minTouchTarget * 0.7);

    return (
        <View style={[styles.bar, {
            minHeight: gp.clueBarMinHeight,
            backgroundColor: t.surface,
            borderColor: t.border,
        }]}>
            {/* Direction badge */}
            <View style={[styles.badge, { backgroundColor: t.primarySoft }]}>
                <Ionicons name={dirIcon} size={Math.round(14 * ui.fontScale)} color={t.primary} />
                <Text style={[styles.badgeText, { fontSize: Math.round(12 * ui.fontScale), color: t.primary }]}>{dirLabel}</Text>
                <Text style={[styles.lengthText, { fontSize: Math.round(11 * ui.fontScale), color: t.primaryLight }]}>· {entry.length} harf</Text>
            </View>

            {/* Full clue text */}
            <Text
                style={[styles.clueText, {
                    fontSize: gp.clueBarFontSize,
                    lineHeight: gp.clueBarFontSize + 4,
                    color: t.text,
                }]}
                numberOfLines={2}
            >
                {entry.clueText}
            </Text>

            {/* Toggle button */}
            {canToggle && (
                <TouchableOpacity
                    style={[styles.toggleBtn, {
                        width: toggleSize,
                        height: toggleSize,
                        borderRadius: toggleSize / 2,
                        backgroundColor: t.primarySoft,
                    }]}
                    onPress={onToggle}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="swap-vertical" size={Math.round(18 * ui.fontScale)} color={t.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        marginHorizontal: 12,
        marginBottom: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
        gap: 8,
    },
    placeholder: {
        fontStyle: 'italic',
        flex: 1,
        textAlign: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 3,
    },
    badgeText: {
        fontWeight: '700',
    },
    lengthText: {
        fontWeight: '500',
    },
    clueText: {
        flex: 1,
        fontWeight: '500',
    },
    toggleBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
