// ── Achievement Definitions ──
// Data-driven list. Add/remove entries here to change achievements.

import { Ionicons } from '@expo/vector-icons';

export type AchievementCategory = 'puzzle' | 'accuracy' | 'speed' | 'economy' | 'streak' | 'special';

export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    target: number;
    category: AchievementCategory;
    /** Hidden achievements show "???" until ≥50% progress */
    hidden?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    // ── Puzzle completion ──
    {
        id: 'first_step',
        title: 'İlk Adım',
        description: '1 bulmaca tamamla',
        icon: 'footsteps-outline',
        target: 1,
        category: 'puzzle',
    },
    {
        id: 'warmup',
        title: 'Isınma Turu',
        description: '5 bulmaca tamamla',
        icon: 'flame-outline',
        target: 5,
        category: 'puzzle',
    },
    {
        id: 'marathon',
        title: 'Maratoncu',
        description: '25 bulmaca tamamla',
        icon: 'trophy-outline',
        target: 25,
        category: 'puzzle',
    },
    {
        id: 'century',
        title: 'Yüzlük',
        description: '100 bulmaca tamamla',
        icon: 'medal-outline',
        target: 100,
        category: 'puzzle',
    },
    {
        id: 'world_explorer',
        title: 'Dünya Gezgini',
        description: '1 bölümü tamamla (10 seviye)',
        icon: 'earth-outline',
        target: 10,
        category: 'puzzle',
    },
    {
        id: 'daily_fan',
        title: 'Günlük Hayranı',
        description: '10 günlük bulmaca tamamla',
        icon: 'today-outline',
        target: 10,
        category: 'puzzle',
    },

    // ── Accuracy ──
    {
        id: 'perfect',
        title: 'Mükemmel!',
        description: 'Bir bulmacayı hatasız tamamla',
        icon: 'diamond-outline',
        target: 1,
        category: 'accuracy',
    },
    {
        id: 'sharp_mind',
        title: 'Keskin Zihin',
        description: '10 bulmacayı %90+ doğrulukla tamamla',
        icon: 'eye-outline',
        target: 10,
        category: 'accuracy',
    },
    {
        id: 'perfectionist',
        title: 'Mükemmeliyetçi',
        description: '5 bulmacayı hatasız tamamla',
        icon: 'star-outline',
        target: 5,
        category: 'accuracy',
    },

    // ── Speed ──
    {
        id: 'speed_demon',
        title: 'Hız Şeytanı',
        description: 'Bir bulmacayı 60 saniye altında tamamla',
        icon: 'flash-outline',
        target: 1,
        category: 'speed',
    },
    {
        id: 'lightning',
        title: 'Yıldırım',
        description: 'Bir bulmacayı 30 saniye altında tamamla',
        icon: 'thunderstorm-outline',
        target: 1,
        category: 'speed',
    },

    // ── Economy ──
    {
        id: 'saver',
        title: 'Tasarruf Ustası',
        description: '5 bulmacayı ipucu kullanmadan tamamla',
        icon: 'shield-checkmark-outline',
        target: 5,
        category: 'economy',
    },
    {
        id: 'hint_collector',
        title: 'İpucu Koleksiyoncusu',
        description: '50 kez ipucu kullan',
        icon: 'bulb-outline',
        target: 50,
        category: 'economy',
    },
    {
        id: 'big_spender',
        title: 'Müsrif',
        description: 'Toplam 500 coin harca',
        icon: 'wallet-outline',
        target: 500,
        category: 'economy',
    },

    // ── Streak ──
    {
        id: 'streak_3',
        title: 'Başlangıç Serisi',
        description: '3 gün üst üste oyna',
        icon: 'bonfire-outline',
        target: 3,
        category: 'streak',
    },
    {
        id: 'streak_7',
        title: 'Haftalık Seri',
        description: '7 gün üst üste oyna',
        icon: 'flame-outline',
        target: 7,
        category: 'streak',
    },
    {
        id: 'streak_30',
        title: 'Ay Serisi',
        description: '30 gün üst üste oyna',
        icon: 'rocket-outline',
        target: 30,
        category: 'streak',
    },

    // ── Special ──
    {
        id: 'last_second',
        title: 'Son Saniye',
        description: 'Son 3 saniyede bitir',
        icon: 'hourglass-outline',
        target: 1,
        category: 'special',
        hidden: true,
    },
];

/** Lookup map for quick access */
export const ACHIEVEMENT_MAP = new Map<string, AchievementDef>(
    ACHIEVEMENTS.map((a) => [a.id, a]),
);
