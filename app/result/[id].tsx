import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { levels } from '../../src/levels/levels';

export default function ResultScreen() {
  const { id, stars, time, score, hearts } = useLocalSearchParams<{
    id: string;
    stars: string;
    time: string;
    score: string;
    hearts: string;
  }>();
  const router = useRouter();
  const levelId = parseInt(id ?? '1', 10);
  const starCount = parseInt(stars ?? '0', 10);
  const timeVal = parseInt(time ?? '0', 10);
  const scoreVal = parseInt(score ?? '0', 10);
  const heartsVal = parseInt(hearts ?? '0', 10);
  const hasNextLevel = levelId < levels.length;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const minutes = Math.floor(timeVal / 60);
  const seconds = timeVal % 60;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Tebrikler!</Text>
          <Text style={styles.subtitle}>Bölüm {levelId} Tamamlandı</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={styles.star}>
                {i <= starCount ? '⭐' : '☆'}
              </Text>
            ))}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{scoreVal}</Text>
              <Text style={styles.statLabel}>Puan</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Süre</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{'❤️'.repeat(heartsVal)}</Text>
              <Text style={styles.statLabel}>Kalan Can</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          {hasNextLevel && (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => router.replace(`/game/${levelId + 1}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>
                Sonraki Bölüm →
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>Ana Menü</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.replayBtn}
            onPress={() => router.replace(`/game/${levelId}`)}
            activeOpacity={0.8}
          >
            <Text style={styles.replayBtnText}>Tekrar Oyna</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1565C0' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#212121' },
  subtitle: { fontSize: 16, color: '#757575', marginTop: 4 },
  starsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  star: { fontSize: 36 },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 20,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1565C0' },
  statLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  buttonsContainer: {
    marginTop: 24,
    width: '100%',
    gap: 10,
  },
  nextBtn: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  homeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  homeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  replayBtn: {
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replayBtnText: { color: '#BBDEFB', fontSize: 14, fontWeight: '600' },
});
