import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgressStore } from '../src/store/gameStore';
import { levels } from '../src/levels/levels';

export default function HomeScreen() {
  const router = useRouter();
  const progress = useProgressStore((s) => s.progress);
  const coins = useProgressStore((s) => s.coins);
  const loaded = useProgressStore((s) => s.loaded);

  const currentLevel =
    progress.find((p) => !p.completed)?.levelId ?? levels.length;
  const completedCount = progress.filter((p) => p.completed).length;
  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kare Bulmaca</Text>
          <Text style={styles.subtitle}>Türkçe Çengel Bulmaca</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedCount}/{levels.length}</Text>
            <Text style={styles.statLabel}>Bölüm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{'⭐'} {totalStars}</Text>
            <Text style={styles.statLabel}>Yıldız</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🪙 {coins}</Text>
            <Text style={styles.statLabel}>Jeton</Text>
          </View>
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => router.push(`/game/${currentLevel}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.playBtnText}>
            Bölüm {currentLevel}  Oyna
          </Text>
        </TouchableOpacity>

        {/* Level List */}
        <Text style={styles.sectionTitle}>Bölümler</Text>
        {levels.map((level) => {
          const p = progress.find((pr) => pr.levelId === level.id);
          const unlocked = p?.unlocked ?? false;
          const completed = p?.completed ?? false;
          const stars = p?.stars ?? 0;

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelRow,
                !unlocked && styles.lockedRow,
                completed && styles.completedRow,
              ]}
              disabled={!unlocked}
              onPress={() => router.push(`/game/${level.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.levelLeft}>
                <View
                  style={[
                    styles.levelBadge,
                    completed && styles.completedBadge,
                    !unlocked && styles.lockedBadge,
                  ]}
                >
                  <Text style={styles.levelBadgeText}>
                    {unlocked ? level.id : '🔒'}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[styles.levelTitle, !unlocked && styles.lockedText]}
                  >
                    {level.title}
                  </Text>
                  <Text style={styles.levelDiff}>
                    {level.difficulty} · {level.gridSize}x{level.gridSize}
                  </Text>
                </View>
              </View>
              <View style={styles.levelRight}>
                {completed && (
                  <Text style={styles.stars}>
                    {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1565C0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#757575' },
  container: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#1565C0',
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#BBDEFB',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#212121' },
  statLabel: { fontSize: 11, color: '#757575', marginTop: 2 },
  playBtn: {
    backgroundColor: '#FF6F00',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  lockedRow: {
    backgroundColor: '#EEEEEE',
    opacity: 0.6,
  },
  completedRow: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: { backgroundColor: '#4CAF50' },
  lockedBadge: { backgroundColor: '#BDBDBD' },
  levelBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  levelTitle: { fontSize: 15, fontWeight: '600', color: '#212121' },
  lockedText: { color: '#9E9E9E' },
  levelDiff: { fontSize: 12, color: '#757575', marginTop: 2 },
  levelRight: {},
  stars: { fontSize: 14 },
});
