import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useProgressStore } from '../src/store/gameStore';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const loadProgress = useProgressStore((s) => s.loadProgress);

  useEffect(() => {
    loadProgress();
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
      </Stack>
    </>
  );
}
