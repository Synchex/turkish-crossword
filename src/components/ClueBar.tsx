import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../cengel/types';
import { colors } from '../theme/colors';

interface ClueBarProps {
    entry: Entry | null;
    /** Whether both directions exist at the active cell */
    canToggle: boolean;
    onToggle: () => void;
}

export default function ClueBar({ entry, canToggle, onToggle }: ClueBarProps) {
    if (!entry) {
        return (
            <View style={styles.bar}>
                <Text style={styles.placeholder}>Bir hücreye dokun</Text>
            </View>
        );
    }

    const dirLabel = entry.direction === 'across' ? 'Yatay' : 'Dikey';
    const dirIcon = entry.direction === 'across' ? 'arrow-forward' : 'arrow-down';

    return (
        <View style={styles.bar}>
            {/* Direction badge */}
            <View style={styles.badge}>
                <Ionicons name={dirIcon} size={14} color={colors.primary} />
                <Text style={styles.badgeText}>{dirLabel}</Text>
                <Text style={styles.lengthText}>· {entry.length} harf</Text>
            </View>

            {/* Full clue text */}
            <Text style={styles.clueText} numberOfLines={2}>
                {entry.clueText}
            </Text>

            {/* Toggle button */}
            {canToggle && (
                <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={onToggle}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="swap-vertical" size={18} color={colors.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 12,
        marginBottom: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
        minHeight: 48,
        gap: 8,
    },
    placeholder: {
        color: colors.textMuted,
        fontSize: 14,
        fontStyle: 'italic',
        flex: 1,
        textAlign: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F0FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 3,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    lengthText: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.primaryLight,
    },
    clueText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#1C1C1E',
        lineHeight: 18,
    },
    toggleBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
