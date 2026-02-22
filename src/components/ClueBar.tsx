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
import { useSpeech } from '../hooks/useSpeech';

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
    const { speak, stop, isSpeaking } = useSpeech();

    // Stop speaking if the active clue changes
    React.useEffect(() => {
        stop();
    }, [entry?.id, stop]);

    if (!entry) {
        return (
            <View style={[styles.bar, {
                minHeight: gp.clueBarMinHeight,
                backgroundColor: t.surface,
                borderColor: t.border,
            }]}>
                <Text style={[styles.placeholder, { fontSize: 15, color: t.textMuted }]}>Bir hücreye dokun</Text>
            </View>
        );
    }

    const dirLabel = entry.direction === 'across' ? 'Yatay' : 'Dikey';
    const dirIcon = entry.direction === 'across' ? 'arrow-forward' : 'arrow-down';
    const ttsSize = Math.max(30, ui.minTouchTarget * 0.65);

    return (
        <View style={[styles.bar, {
            minHeight: gp.clueBarMinHeight,
            backgroundColor: t.surface,
            borderColor: t.border,
        }]}>
            {/* Compact direction badge */}
            <View style={[styles.badge, { backgroundColor: t.primarySoft }]}>
                <Ionicons name={dirIcon} size={12} color={t.primary} />
                <Text style={[styles.badgeText, { color: t.primary }]}>{dirLabel} · {entry.length}</Text>
            </View>

            {/* Full clue text — maximum space, dynamic font */}
            <Text
                style={[styles.clueText, {
                    fontSize: entry.clueText.length <= 25 ? 20 : entry.clueText.length <= 45 ? 18 : 16,
                    lineHeight: entry.clueText.length <= 25 ? 26 : entry.clueText.length <= 45 ? 24 : 22,
                    color: t.text,
                }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
            >
                {entry.clueText}
            </Text>

            {/* Read Aloud button — only icon on right */}
            <TouchableOpacity
                style={[styles.ttsBtn, {
                    width: ttsSize,
                    height: ttsSize,
                    borderRadius: ttsSize / 2,
                    backgroundColor: isSpeaking ? t.primary : t.primarySoft,
                }]}
                onPress={() => isSpeaking ? stop() : speak(entry.clueText)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={isSpeaking ? "volume-high" : "volume-medium"}
                    size={16}
                    color={isSpeaking ? t.textInverse : t.primary}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        marginHorizontal: 12,
        marginBottom: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
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
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 3,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    clueText: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        fontWeight: '500',
    },
    ttsBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
});
