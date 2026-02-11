import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    Pressable,
    Animated,
    Dimensions,
} from 'react-native';
import { Question, Difficulty, QuestionType } from '../data/questions';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    question: Question | null;
    onClose: () => void;
}

const DIFF_COLORS: Record<Difficulty, string> = {
    easy: colors.success,
    medium: colors.accent,
    hard: colors.secondary,
};
const DIFF_LABELS: Record<Difficulty, string> = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
};
const TYPE_LABELS: Record<QuestionType, string> = {
    multipleChoice: 'Çoktan Seçmeli',
    wordFill: 'Kelime Tamamla',
    crossword: 'Bulmaca',
};

export default function QuestionDetailModal({ question, onClose }: Props) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (question) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [question]);

    if (!question) return null;

    return (
        <Modal transparent visible={!!question} animationType="none">
            {/* Overlay */}
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Drag handle */}
                <View style={styles.handleWrapper}>
                    <View style={styles.handle} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <Text style={styles.modalId}>#{question.id}</Text>
                        <View
                            style={[
                                styles.diffBadge,
                                { backgroundColor: DIFF_COLORS[question.difficulty] },
                            ]}
                        >
                            <Text style={styles.diffBadgeText}>
                                {DIFF_LABELS[question.difficulty]}
                            </Text>
                        </View>
                    </View>

                    {/* Prompt */}
                    <Text style={styles.promptLabel}>Soru</Text>
                    <View style={styles.promptCard}>
                        <Text style={styles.promptText}>{question.prompt}</Text>
                    </View>

                    {/* Options (for multiple choice) */}
                    {question.options && question.options.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Seçenekler</Text>
                            <View style={styles.optionsContainer}>
                                {question.options.map((opt, i) => {
                                    const isCorrect = opt === question.correctAnswer;
                                    return (
                                        <View
                                            key={i}
                                            style={[
                                                styles.optionRow,
                                                isCorrect && styles.correctOption,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.optionLetter,
                                                    isCorrect && styles.correctLetter,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionLetterText,
                                                        isCorrect && styles.correctLetterText,
                                                    ]}
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </Text>
                                            </View>
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isCorrect && styles.correctOptionText,
                                                ]}
                                            >
                                                {opt}
                                            </Text>
                                            {isCorrect && <Text style={styles.checkMark}>✅</Text>}
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* Correct answer (for non-MC) */}
                    {(!question.options || question.options.length === 0) && (
                        <>
                            <Text style={styles.sectionLabel}>Doğru Cevap</Text>
                            <View style={styles.answerCard}>
                                <Text style={styles.answerText}>
                                    {question.correctAnswer}
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Metadata */}
                    <Text style={styles.sectionLabel}>Bilgi</Text>
                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaKey}>Tür</Text>
                            <Text style={styles.metaVal}>
                                {TYPE_LABELS[question.type]}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaKey}>Zorluk</Text>
                            <Text
                                style={[
                                    styles.metaVal,
                                    { color: DIFF_COLORS[question.difficulty] },
                                ]}
                            >
                                {DIFF_LABELS[question.difficulty]}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaKey}>Seviye</Text>
                            <Text style={styles.metaVal}>{question.level}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaKey}>Oluşturulma</Text>
                            <Text style={styles.metaVal}>{question.createdAt}</Text>
                        </View>
                    </View>

                    {/* Close button */}
                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Kapat</Text>
                    </Pressable>
                </ScrollView>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: SCREEN_HEIGHT * 0.85,
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        ...shadows.lg,
    },
    handleWrapper: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 40,
        gap: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalId: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textMuted,
        fontFamily: 'monospace',
    },
    diffBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: radius.full,
    },
    diffBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textInverse,
    },
    promptLabel: {
        ...typography.label,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        marginTop: spacing.sm,
    },
    promptCard: {
        backgroundColor: colors.cardAlt,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    promptText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 24,
    },
    sectionLabel: {
        ...typography.label,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        marginTop: spacing.md,
    },
    optionsContainer: {
        gap: 8,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: radius.md,
        backgroundColor: colors.cardAlt,
        gap: 12,
    },
    correctOption: {
        backgroundColor: colors.successLight,
        borderWidth: 1.5,
        borderColor: colors.success,
    },
    optionLetter: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    correctLetter: {
        backgroundColor: colors.success,
    },
    optionLetterText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    correctLetterText: {
        color: colors.textInverse,
    },
    optionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    correctOptionText: {
        fontWeight: '700',
        color: colors.successDark,
    },
    checkMark: {
        fontSize: 16,
    },
    answerCard: {
        backgroundColor: colors.successLight,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
    },
    answerText: {
        ...typography.h3,
        color: colors.successDark,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    metaItem: {
        width: '47%',
        backgroundColor: colors.cardAlt,
        borderRadius: radius.md,
        padding: 12,
    },
    metaKey: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metaVal: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    closeBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.xl,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.md,
        ...shadows.md,
    },
    closeBtnText: {
        ...typography.button,
        color: colors.textInverse,
    },
});
