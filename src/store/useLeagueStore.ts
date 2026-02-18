import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════
// LEAGUE TYPES
// ═══════════════════════════════════════════════

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'elite';

export const LEAGUE_ORDER: LeagueTier[] = ['bronze', 'silver', 'gold', 'diamond', 'elite'];

export const LEAGUE_META: Record<LeagueTier, {
    label: string;
    icon: string;
    color: string;
    minWeeklyXP: number; // approximate min XP for mock competitors
    maxWeeklyXP: number;
}> = {
    bronze: { label: 'Bronz', icon: 'shield-outline', color: '#CD7F32', minWeeklyXP: 0, maxWeeklyXP: 200 },
    silver: { label: 'Gümüş', icon: 'shield-half', color: '#C0C0C0', minWeeklyXP: 100, maxWeeklyXP: 400 },
    gold: { label: 'Altın', icon: 'shield', color: '#FFD700', minWeeklyXP: 200, maxWeeklyXP: 600 },
    diamond: { label: 'Elmas', icon: 'diamond-outline', color: '#B9F2FF', minWeeklyXP: 350, maxWeeklyXP: 900 },
    elite: { label: 'Elit', icon: 'trophy', color: '#9B59B6', minWeeklyXP: 500, maxWeeklyXP: 1200 },
};

export interface Competitor {
    name: string;
    xp: number;
    isUser: boolean;
}

interface LeagueState {
    league: LeagueTier;
    competitors: Competitor[];
    weekKey: string | null;
    promotionHistory: Array<{ week: string; from: LeagueTier; to: LeagueTier }>;

    // Actions
    ensureWeeklyLeague: (weekKey: string, userWeeklyXP: number) => void;
    getRank: (userWeeklyXP: number) => number;
    getPromotionThreshold: () => number;
    getDemotionThreshold: () => number;
    applyWeekEnd: (userWeeklyXP: number) => { promoted: boolean; demoted: boolean; newLeague: LeagueTier };
}

// ── Turkish names for mock competitors ──
const TURKISH_NAMES = [
    'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Zeynep', 'Mustafa', 'Elif',
    'Emre', 'Ece', 'Burak', 'Selin', 'Can', 'Deniz', 'Hakan', 'İrem',
    'Kerem', 'Lale', 'Mert', 'Naz', 'Oğuz', 'Pelin', 'Serkan', 'Tuba',
    'Umut', 'Yağmur', 'Volkan', 'Sibel', 'Barış', 'Gizem',
];

function generateCompetitors(league: LeagueTier, weekKey: string): Competitor[] {
    const meta = LEAGUE_META[league];
    const competitors: Competitor[] = [];

    // Seed from weekKey for determinism
    let seed = 0;
    for (let i = 0; i < weekKey.length; i++) {
        seed = (seed * 31 + weekKey.charCodeAt(i)) | 0;
    }
    const rand = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    // Pick 19 unique names
    const shuffled = [...TURKISH_NAMES].sort(() => rand() - 0.5);
    const picked = shuffled.slice(0, 19);

    for (const name of picked) {
        const range = meta.maxWeeklyXP - meta.minWeeklyXP;
        const xp = Math.round(meta.minWeeklyXP + rand() * range);
        competitors.push({ name, xp, isUser: false });
    }

    return competitors;
}

export const useLeagueStore = create<LeagueState>()(
    persist(
        (set, get) => ({
            league: 'bronze',
            competitors: [],
            weekKey: null,
            promotionHistory: [],

            ensureWeeklyLeague: (weekKey, userWeeklyXP) => {
                const state = get();
                if (state.weekKey === weekKey) return;

                // New week: apply promotion/demotion from last week first
                if (state.weekKey && state.competitors.length > 0) {
                    const result = get().applyWeekEnd(userWeeklyXP);
                    // result already applied
                }

                // Generate new competitors for this week
                const league = get().league;
                const newCompetitors = generateCompetitors(league, weekKey);
                set({ competitors: newCompetitors, weekKey });
            },

            getRank: (userWeeklyXP) => {
                const { competitors } = get();
                const all = [...competitors, { name: 'Sen', xp: userWeeklyXP, isUser: true }];
                all.sort((a, b) => b.xp - a.xp);
                const idx = all.findIndex((c) => c.isUser);
                return idx + 1; // 1-indexed
            },

            getPromotionThreshold: () => {
                const { competitors } = get();
                if (competitors.length === 0) return 0;
                const sorted = [...competitors].sort((a, b) => b.xp - a.xp);
                // Top 20% = rank 4 out of 20 → beat the 4th competitor
                const cutoff = Math.floor(sorted.length * 0.2);
                return sorted[Math.max(0, cutoff - 1)]?.xp ?? 0;
            },

            getDemotionThreshold: () => {
                const { competitors } = get();
                if (competitors.length === 0) return 0;
                const sorted = [...competitors].sort((a, b) => b.xp - a.xp);
                // Bottom 20% = rank 17+ out of 20 → below 16th competitor
                const cutoff = Math.floor(sorted.length * 0.8);
                return sorted[Math.min(sorted.length - 1, cutoff)]?.xp ?? 0;
            },

            applyWeekEnd: (userWeeklyXP) => {
                const state = get();
                const rank = state.getRank(userWeeklyXP);
                const totalPlayers = state.competitors.length + 1; // 20
                const topCutoff = Math.ceil(totalPlayers * 0.2); // 4
                const bottomCutoff = Math.floor(totalPlayers * 0.8); // 16

                let newLeague = state.league;
                let promoted = false;
                let demoted = false;

                const idx = LEAGUE_ORDER.indexOf(state.league);

                if (rank <= topCutoff && idx < LEAGUE_ORDER.length - 1) {
                    newLeague = LEAGUE_ORDER[idx + 1];
                    promoted = true;
                } else if (rank > bottomCutoff && idx > 0) {
                    newLeague = LEAGUE_ORDER[idx - 1];
                    demoted = true;
                }

                if (promoted || demoted) {
                    const week = state.weekKey ?? '';
                    set({
                        league: newLeague,
                        promotionHistory: [
                            ...state.promotionHistory.slice(-10), // keep last 10
                            { week, from: state.league, to: newLeague },
                        ],
                    });
                }

                return { promoted, demoted, newLeague };
            },
        }),
        {
            name: 'league-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
