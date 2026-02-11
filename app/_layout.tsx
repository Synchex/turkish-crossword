import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useProgressStore } from '../src/store/gameStore';

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
          contentStyle: { backgroundColor: '#F5F5F5' },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
