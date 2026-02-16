import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import IconBadge from './ui/IconBadge';

interface Props {
    completedCount: number;
    totalCount: number;
    onPress: () => void;
}

export default function DailyMissionsButtonCard({
    completedCount,
    totalCount,
    onPress,
}: Props) {
    const t = useTheme();
    const allDone = completedCount === totalCount && totalCount > 0;

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
                <View style={styles.row}>
                    <IconBadge
                        name="clipboard-outline"
                        size={20}
                        color={t.primary}
                        badgeSize={42}
                    />
                    <View style={styles.textColumn}>
                        <Text style={[styles.title, { color: t.text }]}>Günlük Görevler</Text>
                        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
                            {allDone
                                ? 'Tüm görevler tamamlandı!'
                                : 'Bugünkü görevlerini tamamla, coin ve XP kazan!'}
                        </Text>
                    </View>
                    <View style={styles.rightSection}>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: t.primary + '14' },
                                allDone && { backgroundColor: t.success + '18' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    { color: t.primary },
                                    allDone && { color: t.success },
                                ]}
                            >
                                {completedCount}/{totalCount}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        ...shadows.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    textColumn: {
        flex: 1,
    },
    title: {
        ...typography.headline,
        fontSize: 16,
    },
    subtitle: {
        ...typography.caption,
        marginTop: 2,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        ...typography.label,
        fontWeight: '600',
    },
});
