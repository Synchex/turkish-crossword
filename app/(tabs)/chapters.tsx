import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chapters, getPuzzleById } from '../../src/cengel/puzzles/index';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';

const DIFFICULTY_COLORS = {
    easy: '#34C759',
    medium: '#FF9500',
    hard: '#FF3B30',
};

const DIFFICULTY_LABELS = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
};

export default function ChaptersScreen() {
    const router = useRouter();

    // TODO: Pull per-puzzle progress from store
    const totalPuzzles = chapters.reduce((a, c) => a + c.puzzleIds.length, 0);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ── */}
            <LinearGradient
                colors={colors.gradientPrimary as readonly [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Bölümler</Text>
                <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>
                        {totalPuzzles} Bulmaca
                    </Text>
                </View>
            </LinearGradient>

            {/* ── Chapter List ── */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {chapters.map((chapter) => (
                    <View key={chapter.id} style={styles.chapterCard}>
                        {/* Chapter header */}
                        <View style={styles.chapterHeader}>
                            <Text style={styles.chapterTitle}>{chapter.title}</Text>
                            <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
                        </View>

                        {/* Puzzle list */}
                        {chapter.puzzleIds.map((puzzleId, idx) => {
                            const puzzle = getPuzzleById(puzzleId);
                            if (!puzzle) return null;
                            const diffColor = DIFFICULTY_COLORS[puzzle.difficulty] || '#999';
                            const diffLabel = DIFFICULTY_LABELS[puzzle.difficulty] || puzzle.difficulty;

                            return (
                                <TouchableOpacity
                                    key={puzzleId}
                                    style={styles.puzzleRow}
                                    activeOpacity={0.7}
                                    onPress={() => router.push(`/game/${puzzleId}`)}
                                >
                                    {/* Number badge */}
                                    <View style={[styles.numBadge, { backgroundColor: diffColor + '20' }]}>
                                        <Text style={[styles.numText, { color: diffColor }]}>{idx + 1}</Text>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.puzzleInfo}>
                                        <Text style={styles.puzzleName}>{puzzle.title}</Text>
                                        <View style={styles.puzzleMeta}>
                                            <Text style={styles.metaText}>
                                                {puzzle.size[0]}×{puzzle.size[1]}
                                            </Text>
                                            <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
                                            <Text style={[styles.metaText, { color: diffColor }]}>
                                                {diffLabel}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Arrow */}
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.textInverse,
        textAlign: 'center',
    },
    progressBadge: {
        marginTop: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: radius.full,
    },
    progressText: {
        ...typography.caption,
        color: colors.textInverse,
        fontWeight: '700',
        fontSize: 13,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    chapterCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    chapterHeader: {
        padding: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    chapterTitle: {
        ...typography.h3,
        color: colors.text,
    },
    chapterSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    puzzleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        gap: 12,
    },
    numBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numText: {
        fontSize: 14,
        fontWeight: '800',
    },
    puzzleInfo: {
        flex: 1,
    },
    puzzleName: {
        ...typography.callout,
        fontWeight: '600',
        color: colors.text,
    },
    puzzleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    metaText: {
        ...typography.label,
        color: colors.textSecondary,
    },
    diffDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
});
