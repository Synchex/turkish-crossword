// ── Achievement Definitions ──
// Data-driven list. Add/remove entries here to change achievements.

import { Ionicons } from '@expo/vector-icons';

export type AchievementCategory = 'puzzle' | 'accuracy' | 'speed' | 'economy' | 'streak' | 'special' | 'social' | 'mastery';

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
    // ═══════════════════════════════════
    //  PUZZLE COMPLETION
    // ═══════════════════════════════════
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
        id: 'dedicated',
        title: 'Kararlı Çözücü',
        description: '10 bulmaca tamamla',
        icon: 'fitness-outline',
        target: 10,
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
        id: 'half_century',
        title: 'Yarım Asırlık',
        description: '50 bulmaca tamamla',
        icon: 'ribbon-outline',
        target: 50,
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
        id: 'legendary',
        title: 'Efsane',
        description: '250 bulmaca tamamla',
        icon: 'shield-outline',
        target: 250,
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
        id: 'chapter_master',
        title: 'Bölüm Ustası',
        description: '3 bölümü tamamla',
        icon: 'map-outline',
        target: 30,
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
    {
        id: 'daily_devotee',
        title: 'Günlük Bağımlısı',
        description: '30 günlük bulmaca tamamla',
        icon: 'calendar-outline',
        target: 30,
        category: 'puzzle',
    },

    // ═══════════════════════════════════
    //  ACCURACY
    // ═══════════════════════════════════
    {
        id: 'perfect',
        title: 'Mükemmel!',
        description: 'Bir bulmacayı hatasız tamamla',
        icon: 'diamond-outline',
        target: 1,
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
    {
        id: 'sharp_mind',
        title: 'Keskin Zihin',
        description: '10 bulmacayı hatasız tamamla',
        icon: 'eye-outline',
        target: 10,
        category: 'accuracy',
    },
    {
        id: 'flawless',
        title: 'Kusursuz',
        description: '25 bulmacayı hatasız tamamla',
        icon: 'prism-outline',
        target: 25,
        category: 'accuracy',
    },
    {
        id: 'no_hint_win',
        title: 'Kendi Başına',
        description: 'Bir bulmacayı ipucu kullanmadan tamamla',
        icon: 'hand-left-outline',
        target: 1,
        category: 'accuracy',
    },
    {
        id: 'no_hint_streak_5',
        title: 'İpucusuz Seri',
        description: '5 bulmacayı üst üste ipucu kullanmadan tamamla',
        icon: 'shield-checkmark-outline',
        target: 5,
        category: 'accuracy',
    },

    // ═══════════════════════════════════
    //  SPEED
    // ═══════════════════════════════════
    {
        id: 'quick_solver',
        title: 'Hızlı Çözücü',
        description: 'Bir bulmacayı 2 dakika altında tamamla',
        icon: 'timer-outline',
        target: 1,
        category: 'speed',
    },
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
    {
        id: 'speed_series',
        title: 'Hız Serisi',
        description: '5 bulmacayı 2 dakika altında tamamla',
        icon: 'speedometer-outline',
        target: 5,
        category: 'speed',
    },

    // ═══════════════════════════════════
    //  ECONOMY
    // ═══════════════════════════════════
    {
        id: 'saver',
        title: 'Tasarruf Ustası',
        description: '5 bulmacayı ipucu kullanmadan tamamla',
        icon: 'shield-checkmark-outline',
        target: 5,
        category: 'economy',
    },
    {
        id: 'first_purchase',
        title: 'İlk Alışveriş',
        description: 'İlk ipucunu satın al',
        icon: 'cart-outline',
        target: 1,
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
    {
        id: 'coin_hoarder',
        title: 'Altın Biriktirici',
        description: '1000 coin biriktir',
        icon: 'cash-outline',
        target: 1000,
        category: 'economy',
    },
    {
        id: 'wealthy',
        title: 'Zengin',
        description: '5000 coin biriktir',
        icon: 'diamond-outline',
        target: 5000,
        category: 'economy',
    },

    // ═══════════════════════════════════
    //  STREAK
    // ═══════════════════════════════════
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
        id: 'streak_14',
        title: 'İki Haftalık Seri',
        description: '14 gün üst üste oyna',
        icon: 'flame-outline',
        target: 14,
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
    {
        id: 'streak_60',
        title: 'Çelik İrade',
        description: '60 gün üst üste oyna',
        icon: 'nuclear-outline',
        target: 60,
        category: 'streak',
    },
    {
        id: 'streak_100',
        title: 'Yüz Günlük Efsane',
        description: '100 gün üst üste oyna',
        icon: 'planet-outline',
        target: 100,
        category: 'streak',
    },

    // ═══════════════════════════════════
    //  MASTERY (Word & Knowledge)
    // ═══════════════════════════════════
    {
        id: 'word_hunter',
        title: 'Kelime Avcısı',
        description: 'Toplam 100 kelime bul',
        icon: 'search-outline',
        target: 100,
        category: 'mastery',
    },
    {
        id: 'word_master',
        title: 'Kelime Ustası',
        description: 'Toplam 500 kelime bul',
        icon: 'library-outline',
        target: 500,
        category: 'mastery',
    },
    {
        id: 'vocabulary_king',
        title: 'Sözcük Kralı',
        description: 'Toplam 1000 kelime bul',
        icon: 'school-outline',
        target: 1000,
        category: 'mastery',
    },
    {
        id: 'xp_collector_1000',
        title: 'XP Toplama',
        description: '1000 XP topla',
        icon: 'trending-up-outline',
        target: 1000,
        category: 'mastery',
    },
    {
        id: 'xp_collector_5000',
        title: 'XP Ustası',
        description: '5000 XP topla',
        icon: 'analytics-outline',
        target: 5000,
        category: 'mastery',
    },
    {
        id: 'level_5',
        title: 'Seviye 5',
        description: 'Seviye 5\'e ulaş',
        icon: 'arrow-up-circle-outline',
        target: 5,
        category: 'mastery',
    },
    {
        id: 'level_10',
        title: 'Seviye 10',
        description: 'Seviye 10\'a ulaş',
        icon: 'arrow-up-circle-outline',
        target: 10,
        category: 'mastery',
    },
    {
        id: 'three_star_collector',
        title: '3 Yıldız Koleksiyoncusu',
        description: '10 bulmacada 3 yıldız al',
        icon: 'star-outline',
        target: 10,
        category: 'mastery',
    },

    // ═══════════════════════════════════
    //  SPECIAL (Hidden & Rare)
    // ═══════════════════════════════════
    {
        id: 'last_second',
        title: 'Son Saniye',
        description: 'Son 3 saniyede bitir',
        icon: 'hourglass-outline',
        target: 1,
        category: 'special',
        hidden: true,
    },
    {
        id: 'night_owl',
        title: 'Gece Kuşu',
        description: 'Gece yarısından sonra bir bulmaca tamamla',
        icon: 'moon-outline',
        target: 1,
        category: 'special',
        hidden: true,
    },
    {
        id: 'early_bird',
        title: 'Erken Kuş',
        description: 'Sabah 6\'dan önce bir bulmaca tamamla',
        icon: 'sunny-outline',
        target: 1,
        category: 'special',
        hidden: true,
    },
    {
        id: 'weekend_warrior',
        title: 'Hafta Sonu Savaşçısı',
        description: 'Bir hafta sonu 5 bulmaca tamamla',
        icon: 'flag-outline',
        target: 5,
        category: 'special',
    },
    {
        id: 'comeback',
        title: 'Geri Dönüş',
        description: '7 gün ara verdikten sonra tekrar oyna',
        icon: 'refresh-outline',
        target: 1,
        category: 'special',
        hidden: true,
    },
    {
        id: 'big_puzzle_first',
        title: 'Büyük Meydan Okuma',
        description: 'İlk büyük bulmacayı tamamla',
        icon: 'grid-outline',
        target: 1,
        category: 'special',
    },
    {
        id: 'big_puzzle_master',
        title: 'Büyük Bulmaca Ustası',
        description: '10 büyük bulmaca tamamla',
        icon: 'apps-outline',
        target: 10,
        category: 'special',
    },
    {
        id: 'daily_streak_perfect',
        title: 'Günlük Mükemmellik',
        description: 'Günlük bulmacayı hatasız tamamla',
        icon: 'ribbon-outline',
        target: 1,
        category: 'special',
    },
    {
        id: 'all_stars',
        title: 'Tam Puan',
        description: 'Bir bölümdeki tüm bulmacalarda 3 yıldız al',
        icon: 'sparkles-outline',
        target: 1,
        category: 'special',
        hidden: true,
    },
];

/** Lookup map for quick access */
export const ACHIEVEMENT_MAP = new Map<string, AchievementDef>(
    ACHIEVEMENTS.map((a) => [a.id, a]),
);
