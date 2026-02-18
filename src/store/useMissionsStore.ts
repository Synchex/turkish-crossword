import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateISO } from '../utils/dateHelpers';
import { useEconomyStore } from './useEconomyStore';
import { useGamificationStore } from './useGamificationStore';

// ═══════════════════════════════════════════════
// MISSION TYPES
// ═══════════════════════════════════════════════

export type MissionType =
    | 'SOLVE_PUZZLES'
    | 'SOLVE_WITHOUT_HINTS'
    | 'ENTER_CORRECT_WORDS'
    | 'FINISH_UNDER_TIME'
    | 'NO_MISTAKES_RUN'
    | 'EARN_XP'
    | 'SOLVE_MEDIUM';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: MissionType;
    difficulty: MissionDifficulty;
    target: number;
    progress: number;
    rewardCoins: number;
    rewardXP: number;
    completed: boolean;
    claimed: boolean;
    createdForDate: string;
}

// ═══════════════════════════════════════════════
// CHEST REWARD SYSTEM
// ═══════════════════════════════════════════════

export type ChestRewardType = 'coins' | 'xp_boost' | 'streak_freeze';

export interface ChestReward {
    type: ChestRewardType;
    label: string;
    amount: number; // coins amount, or boost duration ms, or freeze count
}

function generateChestReward(dateStr: string): ChestReward {
    // Seeded random from date
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) {
        seed = (seed * 31 + dateStr.charCodeAt(i)) | 0;
    }
    const roll = Math.abs(seed) % 100;

    if (roll < 50) {
        // 50% chance: coins (20–50)
        const coins = 20 + (Math.abs(seed * 7) % 31);
        return { type: 'coins', label: `${coins} Coin`, amount: coins };
    } else if (roll < 80) {
        // 30% chance: 2x XP boost (30 min)
        return { type: 'xp_boost', label: '2x XP (30 dk)', amount: 30 * 60 * 1000 };
    } else {
        // 20% chance: streak freeze
        return { type: 'streak_freeze', label: 'Seri Kalkanı', amount: 1 };
    }
}

// ── Mission Templates ──
interface MissionTemplate {
    type: MissionType;
    difficulty: MissionDifficulty;
    title: string;
    description: string;
    target: number;
    rewardCoins: number;
    rewardXP: number;
}

const EASY_TEMPLATES: MissionTemplate[] = [
    {
        type: 'SOLVE_PUZZLES',
        difficulty: 'easy',
        title: '1 Bulmaca Çöz',
        description: 'Herhangi bir bulmacayı tamamla.',
        target: 1,
        rewardCoins: 15,
        rewardXP: 10,
    },
    {
        type: 'ENTER_CORRECT_WORDS',
        difficulty: 'easy',
        title: '5 Doğru Kelime',
        description: '5 kelimeyi doğru gir.',
        target: 5,
        rewardCoins: 10,
        rewardXP: 5,
    },
];

const MEDIUM_TEMPLATES: MissionTemplate[] = [
    {
        type: 'SOLVE_PUZZLES',
        difficulty: 'medium',
        title: '2 Bulmaca Çöz',
        description: '2 bulmacayı tamamla.',
        target: 2,
        rewardCoins: 30,
        rewardXP: 20,
    },
    {
        type: 'SOLVE_WITHOUT_HINTS',
        difficulty: 'medium',
        title: 'İpucusuz Çöz',
        description: 'Bir bulmacayı ipucu kullanmadan bitir.',
        target: 1,
        rewardCoins: 25,
        rewardXP: 15,
    },
    {
        type: 'EARN_XP',
        difficulty: 'medium',
        title: '80 XP Kazan',
        description: 'Toplam 80 XP kazan.',
        target: 80,
        rewardCoins: 25,
        rewardXP: 15,
    },
];

const HARD_TEMPLATES: MissionTemplate[] = [
    {
        type: 'NO_MISTAKES_RUN',
        difficulty: 'hard',
        title: 'Hatasız Bitir',
        description: 'Bir bulmacayı hiç hata yapmadan bitir.',
        target: 1,
        rewardCoins: 50,
        rewardXP: 35,
    },
    {
        type: 'FINISH_UNDER_TIME',
        difficulty: 'hard',
        title: '3 Dakikada Bitir',
        description: 'Bir bulmacayı 180 saniye içinde tamamla.',
        target: 1,
        rewardCoins: 50,
        rewardXP: 35,
    },
];

// Deterministic pick based on date seed
function pickFromPool<T>(pool: T[], dateStr: string, salt: number): T {
    let hash = salt;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
    }
    return pool[Math.abs(hash) % pool.length];
}

function generateDailyMissions(dateStr: string): Mission[] {
    const easy = pickFromPool(EASY_TEMPLATES, dateStr, 1);
    const medium = pickFromPool(MEDIUM_TEMPLATES, dateStr, 2);
    const hard = pickFromPool(HARD_TEMPLATES, dateStr, 3);

    return [easy, medium, hard].map((t, i) => ({
        id: `${dateStr}-${i}`,
        title: t.title,
        description: t.description,
        type: t.type,
        difficulty: t.difficulty,
        target: t.target,
        progress: 0,
        rewardCoins: t.rewardCoins,
        rewardXP: t.rewardXP,
        completed: false,
        claimed: false,
        createdForDate: dateStr,
    }));
}

// ═══════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════

interface MissionsState {
    missions: Mission[];
    lastGeneratedDate: string | null;
    chestClaimed: boolean;
    lastChestReward: ChestReward | null;

    ensureDailyMissions: () => void;
    updateProgress: (type: MissionType, amount: number) => void;
    claimMission: (id: string) => { coins: number; xp: number } | null;
    areAllClaimed: () => boolean;
    claimChest: () => ChestReward | null;
}

export const useMissionsStore = create<MissionsState>()(
    persist(
        (set, get) => ({
            missions: [],
            lastGeneratedDate: null,
            chestClaimed: false,
            lastChestReward: null,

            ensureDailyMissions: () => {
                const today = getCurrentDateISO();
                const { lastGeneratedDate } = get();

                if (lastGeneratedDate !== today) {
                    const newMissions = generateDailyMissions(today);
                    set({
                        missions: newMissions,
                        lastGeneratedDate: today,
                        chestClaimed: false,
                        lastChestReward: null,
                    });
                }
            },

            updateProgress: (type, amount) => {
                set((s) => ({
                    missions: s.missions.map((m) => {
                        if (m.type !== type || m.completed || m.claimed) return m;
                        const newProgress = Math.min(m.target, m.progress + amount);
                        return {
                            ...m,
                            progress: newProgress,
                            completed: newProgress >= m.target,
                        };
                    }),
                }));
            },

            claimMission: (id) => {
                const mission = get().missions.find((m) => m.id === id);
                if (!mission || !mission.completed || mission.claimed) return null;

                // Award coins
                useEconomyStore.getState().addCoins(mission.rewardCoins);
                // Award XP
                useGamificationStore.getState().addXP(mission.rewardXP);

                set((s) => ({
                    missions: s.missions.map((m) =>
                        m.id === id ? { ...m, claimed: true } : m
                    ),
                }));

                return { coins: mission.rewardCoins, xp: mission.rewardXP };
            },

            areAllClaimed: () => {
                const { missions } = get();
                return missions.length > 0 && missions.every((m) => m.claimed);
            },

            claimChest: () => {
                const state = get();
                if (state.chestClaimed) return null;
                if (!state.areAllClaimed()) return null;

                const today = getCurrentDateISO();
                const reward = generateChestReward(today);

                // Apply reward
                switch (reward.type) {
                    case 'coins':
                        useEconomyStore.getState().addCoins(reward.amount);
                        break;
                    case 'xp_boost':
                        useGamificationStore.getState().activateXPBoost(reward.amount);
                        break;
                    case 'streak_freeze':
                        useGamificationStore.getState().addFreezes(reward.amount);
                        break;
                }

                set({ chestClaimed: true, lastChestReward: reward });
                return reward;
            },
        }),
        {
            name: 'missions-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
