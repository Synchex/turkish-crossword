import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useProgressStore } from '../src/store/gameStore';
import { useGamificationStore } from '../src/store/useGamificationStore';
import { useMissionsStore } from '../src/store/useMissionsStore';
import { useDailyPuzzleStore } from '../src/store/useDailyPuzzleStore';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const loadProgress = useProgressStore((s) => s.loadProgress);
  const checkDailyStreak = useGamificationStore((s) => s.checkDailyStreak);
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions);
  const hydrateDaily = useDailyPuzzleStore((s) => s.hydrate);

  useEffect(() => {
    loadProgress();
    checkDailyStreak();
    ensureDailyMissions();
    hydrateDaily();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game/[id]" />
        <Stack.Screen name="result/[id]" />
        <Stack.Screen name="daily" />
      </Stack>
    </>
  );
}
