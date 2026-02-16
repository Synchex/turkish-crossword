import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import IconBadge from './ui/IconBadge';

const { width: SW } = Dimensions.get('window');
const PANEL_W = Math.min(SW * 0.92, 420);
const TILE_GAP = 12;
const TILE_W = (PANEL_W - 20 * 2 - TILE_GAP) / 2;

interface Option {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    onPress: () => void;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    options: Option[];
}

// ── Option Tile ──
function Tile({ opt, onSelect }: { opt: Option; onSelect: () => void }) {
    const sc = useRef(new Animated.Value(1)).current;
    const op = useRef(new Animated.Value(1)).current;

    return (
        <Animated.View style={[styles.tile, { transform: [{ scale: sc }], opacity: op }]}>
            <Pressable
                onPressIn={() => {
                    Animated.spring(sc, { toValue: 0.97, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
                    Animated.spring(op, { toValue: 0.92, damping: 15, stiffness: 300, mass: 1, useNativeDriver: true }).start();
                }}
                onPressOut={() => {
                    Animated.spring(sc, { toValue: 1, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
                    Animated.spring(op, { toValue: 1, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }).start();
                }}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect();
                }}
                style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', paddingVertical: spacing.md, paddingHorizontal: 8, gap: 4 }}
            >
                <IconBadge name={opt.icon} size={26} color={opt.iconColor} badgeSize={58} />
                <Text style={styles.tileTitle}>{opt.title}</Text>
                <Text style={styles.tileSub}>{opt.subtitle}</Text>
            </Pressable>
        </Animated.View>
    );
}

// ── Panel ──
export default function PlayChooserPanel({ visible, onClose, options }: Props) {
    const scaleAnim = useRef(new Animated.Value(0.96)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0.96);
            opacityAnim.setValue(0);
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 90,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.96,
                    duration: 140,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 140,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleSelect = useCallback(
        (opt: Option) => {
            onClose();
            setTimeout(() => opt.onPress(), 200);
        },
        [onClose],
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Transparent dismiss layer — NO dim */}
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Animated.View
                    style={[
                        styles.panelOuter,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Stop propagation so tapping inside doesn't dismiss */}
                    <Pressable onPress={() => { }}>
                        {/* Glass card */}
                        <BlurView intensity={45} tint="light" style={styles.glass}>
                            {/* White tint overlay */}
                            <View style={styles.tintOverlay} />

                            {/* Header */}
                            <View style={styles.header}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>Oyun Sec</Text>
                                    <Text style={styles.subtitle}>
                                        Nasil oynamak istiyorsun?
                                    </Text>
                                </View>
                                <Pressable onPress={onClose} style={styles.closeBtn}>
                                    <BlurView
                                        intensity={30}
                                        tint="default"
                                        style={styles.closeBtnBlur}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={15}
                                            color={colors.textSecondary}
                                        />
                                    </BlurView>
                                </Pressable>
                            </View>

                            {/* Tiles */}
                            <View style={styles.grid}>
                                {options.map((opt, i) => (
                                    <Tile
                                        key={i}
                                        opt={opt}
                                        onSelect={() => handleSelect(opt)}
                                    />
                                ))}
                            </View>
                        </BlurView>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    panelOuter: {
        width: PANEL_W,
        borderRadius: 26,
        // Premium iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 16,
    },
    glass: {
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.35)',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 18,
    },
    tintOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.55)',
    },
    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        zIndex: 1,
    },
    title: {
        fontSize: 23,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
        fontWeight: '400',
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: 'hidden',
        marginLeft: 8,
    },
    closeBtnBlur: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(120,120,128,0.12)',
    },
    // ── Grid ──
    grid: {
        flexDirection: 'row',
        gap: TILE_GAP,
        zIndex: 1,
    },
    tile: {
        width: TILE_W,
        aspectRatio: 0.88,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: 8,
        gap: 4,
        // Very subtle inner shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    tileTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
        marginTop: 6,
        textAlign: 'center',
        letterSpacing: -0.2,
    },
    tileSub: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '400',
    },
});
