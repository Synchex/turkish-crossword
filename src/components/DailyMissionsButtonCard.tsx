import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';
import Card from './ui/Card';

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
    const allDone = completedCount === totalCount && totalCount > 0;

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <Card style={styles.card} variant="accent" padding="lg">
                <View style={styles.row}>
                    {/* Icon */}
                    <Text style={styles.emoji}>📋</Text>

                    {/* Text */}
                    <View style={styles.textColumn}>
                        <Text style={styles.title}>Günlük Görevler</Text>
                        <Text style={styles.subtitle}>
                            {allDone
                                ? 'Tüm görevler tamamlandı! 🎉'
                                : 'Bugünkü görevlerini tamamla, coin ve XP kazan!'}
                        </Text>
                    </View>

                    {/* Badge + chevron */}
                    <View style={styles.rightSection}>
                        <View
                            style={[
                                styles.badge,
                                allDone && styles.badgeDone,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    allDone && styles.badgeTextDone,
                                ]}
                            >
                                {completedCount}/{totalCount}
                            </Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    emoji: {
        fontSize: 32,
    },
    textColumn: {
        flex: 1,
    },
    title: {
        ...typography.h3,
        color: colors.primary,
    },
    subtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    badge: {
        backgroundColor: colors.primary + '18',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.full,
    },
    badgeDone: {
        backgroundColor: colors.success + '20',
    },
    badgeText: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.primary,
        fontSize: 12,
    },
    badgeTextDone: {
        color: colors.success,
    },
    chevron: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textMuted,
        marginTop: -2,
    },
});
