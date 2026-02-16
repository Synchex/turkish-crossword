import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGeneratorStore, SeedMode, GeneratedPuzzleEntry } from '../../src/store/useGeneratorStore';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';

// ── Stepper Component ──

function Stepper({
    label,
    value,
    onValueChange,
    min,
    max,
}: {
    label: string;
    value: number;
    onValueChange: (v: number) => void;
    min: number;
    max: number;
}) {
    return (
        <View style={stepStyles.row}>
            <Text style={stepStyles.label}>{label}</Text>
            <View style={stepStyles.controls}>
                <TouchableOpacity
                    style={[stepStyles.btn, value <= min && stepStyles.btnDisabled]}
                    onPress={() => value > min && onValueChange(value - 1)}
                    disabled={value <= min}
                >
                    <Text style={stepStyles.btnText}>−</Text>
                </TouchableOpacity>
                <Text style={stepStyles.value}>{value}</Text>
                <TouchableOpacity
                    style={[stepStyles.btn, value >= max && stepStyles.btnDisabled]}
                    onPress={() => value < max && onValueChange(value + 1)}
                    disabled={value >= max}
                >
                    <Text style={stepStyles.btnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const stepStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    label: {
        ...typography.bodyBold,
        color: colors.text,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    btn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDisabled: {
        backgroundColor: colors.border,
    },
    btnText: {
        color: colors.textInverse,
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 22,
    },
    value: {
        ...typography.h3,
        color: colors.text,
        minWidth: 32,
        textAlign: 'center',
    },
});

// ── Puzzle Row Component ──

function PuzzleRow({
    item,
    onPlay,
}: {
    item: GeneratedPuzzleEntry;
    onPlay: (id: string) => void;
}) {
    const isFailed = item.status === 'failed';
    return (
        <View style={[rowStyles.card, isFailed && rowStyles.cardFailed]}>
            <View style={rowStyles.info}>
                <View style={rowStyles.topRow}>
                    <Text style={rowStyles.id}>#{item.id}</Text>
                    {isFailed ? (
                        <View style={rowStyles.errorBadge}>
                            <Text style={rowStyles.errorText}>Başarısız</Text>
                        </View>
                    ) : (
                        <View style={rowStyles.successBadge}>
                            <Text style={rowStyles.successText}>✓</Text>
                        </View>
                    )}
                </View>
                <View style={rowStyles.metaRow}>
                    <Text style={rowStyles.meta}>Lv {item.level}</Text>
                    <Text style={rowStyles.metaDot}>·</Text>
                    <Text style={rowStyles.meta}>
                        {item.gridSize > 0 ? `${item.gridSize}×${item.gridSize}` : '—'}
                    </Text>
                    <Text style={rowStyles.metaDot}>·</Text>
                    <Text style={rowStyles.meta}>
                        {item.difficultyScore > 0 ? `⭐ ${item.difficultyScore.toFixed(1)}` : '—'}
                    </Text>
                    <Text style={rowStyles.metaDot}>·</Text>
                    <Text style={rowStyles.meta}>{item.genTimeMs}ms</Text>
                </View>
                {isFailed && item.error && (
                    <Text style={rowStyles.errorDetail} numberOfLines={1}>
                        {item.error}
                    </Text>
                )}
            </View>
            {!isFailed && (
                <TouchableOpacity
                    style={rowStyles.playBtn}
                    onPress={() => onPlay(item.id)}
                >
                    <Text style={rowStyles.playText}>Oyna ▶</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const rowStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cardFailed: {
        borderColor: colors.danger + '40',
        backgroundColor: colors.dangerLight,
    },
    info: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 4,
    },
    id: {
        ...typography.caption,
        color: colors.textMuted,
        fontFamily: 'monospace',
        fontSize: 12,
    },
    errorBadge: {
        backgroundColor: colors.danger,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.xs,
    },
    errorText: {
        color: colors.textInverse,
        fontSize: 10,
        fontWeight: '700',
    },
    successBadge: {
        backgroundColor: colors.success,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        color: colors.textInverse,
        fontSize: 11,
        fontWeight: '800',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    meta: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 13,
    },
    metaDot: {
        color: colors.textMuted,
        fontSize: 10,
    },
    errorDetail: {
        ...typography.caption,
        color: colors.danger,
        fontSize: 11,
        marginTop: 4,
    },
    playBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radius.full,
    },
    playText: {
        ...typography.label,
        color: colors.textInverse,
        fontWeight: '700',
        fontSize: 13,
        textTransform: 'none',
    },
});

// ── Main Screen ──

export default function GeneratorScreen() {
    const router = useRouter();

    const [level, setLevel] = useState(3);
    const [count, setCount] = useState(5);
    const [seedMode, setSeedMode] = useState<SeedMode>('random');
    const [manualSeed, setManualSeed] = useState('42');

    const {
        generatedPuzzles,
        isGenerating,
        successCount,
        totalAttempted,
        generateMany,
        clear,
    } = useGeneratorStore();

    const handleGenerate = useCallback(() => {
        generateMany({
            level,
            count,
            seedMode,
            manualSeed: seedMode === 'manual' ? parseInt(manualSeed, 10) || 42 : undefined,
        });
    }, [level, count, seedMode, manualSeed, generateMany]);

    const handlePlay = useCallback(
        (id: string) => {
            router.push(`/game/gen_${id}`);
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: GeneratedPuzzleEntry }) => (
            <PuzzleRow item={item} onPlay={handlePlay} />
        ),
        [handlePlay],
    );

    const keyExtractor = useCallback((item: GeneratedPuzzleEntry) => item.id, []);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>

            {/* ── Controls ── */}
            <View style={styles.controls}>
                <Stepper
                    label="Seviye"
                    value={level}
                    onValueChange={setLevel}
                    min={1}
                    max={50}
                />
                <Stepper
                    label="Adet"
                    value={count}
                    onValueChange={setCount}
                    min={1}
                    max={20}
                />

                {/* Seed Mode Toggle */}
                <View style={styles.seedRow}>
                    <Text style={styles.seedLabel}>Seed</Text>
                    <View style={styles.seedToggle}>
                        <TouchableOpacity
                            style={[
                                styles.seedOption,
                                seedMode === 'random' && styles.seedOptionActive,
                            ]}
                            onPress={() => setSeedMode('random')}
                        >
                            <Text
                                style={[
                                    styles.seedOptionText,
                                    seedMode === 'random' && styles.seedOptionTextActive,
                                ]}
                            >
                                Rastgele
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.seedOption,
                                seedMode === 'manual' && styles.seedOptionActive,
                            ]}
                            onPress={() => setSeedMode('manual')}
                        >
                            <Text
                                style={[
                                    styles.seedOptionText,
                                    seedMode === 'manual' && styles.seedOptionTextActive,
                                ]}
                            >
                                Manuel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {seedMode === 'manual' && (
                    <TextInput
                        style={styles.seedInput}
                        value={manualSeed}
                        onChangeText={setManualSeed}
                        keyboardType="number-pad"
                        placeholder="Seed değeri"
                        placeholderTextColor={colors.textMuted}
                    />
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
                        onPress={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator size="small" color={colors.textInverse} />
                                <Text style={styles.generateText}>
                                    {totalAttempted}/{count}...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.generateText}>⚡ Oluştur</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={clear}
                        disabled={isGenerating}
                    >
                        <Text style={styles.clearText}>🗑 Temizle</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Results Header ── */}
            {generatedPuzzles.length > 0 && (
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>
                        Sonuçlar ({generatedPuzzles.length})
                    </Text>
                    <View style={styles.successRateBadge}>
                        <Text style={styles.successRateText}>
                            ✅ {successCount}/{totalAttempted}
                        </Text>
                    </View>
                </View>
            )}

            {/* ── Results List ── */}
            <FlatList
                data={generatedPuzzles}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isGenerating ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🧩</Text>
                            <Text style={styles.emptyText}>
                                Henüz bulmaca oluşturulmadı.{'\n'}Yukarıdan ayarları seçip "Oluştur"a basın.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

// ── Styles ──

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    controls: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    seedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    seedLabel: {
        ...typography.bodyBold,
        color: colors.text,
    },
    seedToggle: {
        flexDirection: 'row',
        backgroundColor: colors.cardAlt,
        borderRadius: radius.full,
        overflow: 'hidden',
    },
    seedOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: radius.full,
    },
    seedOptionActive: {
        backgroundColor: colors.primary,
    },
    seedOptionText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    seedOptionTextActive: {
        color: colors.textInverse,
    },
    seedInput: {
        backgroundColor: colors.cardAlt,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        ...typography.body,
        color: colors.text,
        marginBottom: spacing.sm,
        fontFamily: 'monospace',
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    generateBtn: {
        flex: 2,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateBtnDisabled: {
        backgroundColor: colors.primaryLight,
    },
    generateText: {
        ...typography.button,
        color: colors.textInverse,
        fontSize: 15,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    clearBtn: {
        flex: 1,
        backgroundColor: colors.dangerLight,
        paddingVertical: 14,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearText: {
        ...typography.button,
        color: colors.danger,
        fontSize: 15,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    resultsTitle: {
        ...typography.h3,
        color: colors.text,
        fontSize: 16,
    },
    successRateBadge: {
        backgroundColor: colors.successLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.full,
    },
    successRateText: {
        ...typography.caption,
        color: colors.successDark,
        fontWeight: '700',
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: spacing.xxxl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        ...typography.body,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
});
