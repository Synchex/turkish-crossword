import { LevelData } from '../game/types';

export const levels: LevelData[] = [
  // ─── LEVEL 1 (7x7, Easy) ───
  {
    id: 1,
    gridSize: 7,
    difficulty: 'Kolay',
    title: 'Başlangıç',
    words: [
      // Across
      { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'ALAN', clue: 'Geniş düz yer, saha', num: 1 },
      { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'RÜYA', clue: 'Uykuda görülen', num: 2 },
      { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'BALIK', clue: 'Suda yaşayan hayvan', num: 3 },
      { id: '4a', direction: 'across', startRow: 4, startCol: 0, answer: 'AKIL', clue: 'Düşünme yetisi, zihin', num: 4 },
      // Down
      { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'ARABA', clue: 'Dört tekerlekli taşıt', num: 1 },
      { id: '5d', direction: 'down', startRow: 0, startCol: 3, answer: 'NASIL', clue: 'Ne şekilde? sorusu', num: 5 },
    ],
  },

  // ─── LEVEL 2 (7x7, Easy) ───
  {
    id: 2,
    gridSize: 7,
    difficulty: 'Kolay',
    title: 'Keşif',
    words: [
      // Across
      { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'DÜNYA', clue: 'Üzerinde yaşadığımız gezegen', num: 1 },
      { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ORMAN', clue: 'Ağaçlarla kaplı alan', num: 2 },
      { id: '3a', direction: 'across', startRow: 2, startCol: 0, answer: 'SANAT', clue: 'Yaratıcı ifade biçimi', num: 3 },
      { id: '4a', direction: 'across', startRow: 3, startCol: 0, answer: 'TAŞ', clue: 'Sert doğal madde', num: 4 },
      // Down
      { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'DOST', clue: 'Yakın arkadaş', num: 1 },
      { id: '5d', direction: 'down', startRow: 0, startCol: 4, answer: 'ANT', clue: 'Yemin, söz verme', num: 5 },
    ],
  },

  // ─── LEVEL 3 (7x7, Easy) ───
  {
    id: 3,
    gridSize: 7,
    difficulty: 'Kolay',
    title: 'Renkler',
    words: [
      // Across
      { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'PEMBE', clue: 'Açık kırmızı renk', num: 1 },
      { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'AYAK', clue: 'Yürümek için kullanılan uzuv', num: 2 },
      { id: '3a', direction: 'across', startRow: 2, startCol: 0, answer: 'RENK', clue: 'Kırmızı, mavi, yeşil...', num: 3 },
      { id: '4a', direction: 'across', startRow: 3, startCol: 0, answer: 'ANA', clue: 'Anne, valide', num: 4 },
      // Down
      { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'PARA', clue: 'Alışverişte kullanılan', num: 1 },
      { id: '5d', direction: 'down', startRow: 0, startCol: 2, answer: 'MANA', clue: 'Anlam, kavram', num: 5 },
    ],
  },

  // ─── LEVEL 4 (9x9, Medium) ───
  {
    id: 4,
    gridSize: 9,
    difficulty: 'Orta',
    title: 'Şehirler',
    words: [
      // Across
      { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'İSTANBUL', clue: 'Boğazın iki yakasındaki şehir', num: 1 },
      { id: '6a', direction: 'across', startRow: 1, startCol: 5, answer: 'ARA', clue: 'İki şey arasındaki mesafe', num: 6 },
      { id: '7a', direction: 'across', startRow: 2, startCol: 5, answer: 'ŞAL', clue: 'Omuzlara atılan örtü', num: 7 },
      { id: '8a', direction: 'across', startRow: 3, startCol: 0, answer: 'KOL', clue: 'Omuzdan ele kadar uzuv', num: 8 },
      // Down
      { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'İPEK', clue: 'İpek böceğinden elde edilen kumaş', num: 1 },
      { id: '3d', direction: 'down', startRow: 0, startCol: 2, answer: 'TATLI', clue: 'Şekerli yiyecek', num: 3 },
      { id: '5d', direction: 'down', startRow: 0, startCol: 5, answer: 'BAŞ', clue: 'Vücudun en üst kısmı', num: 5 },
      { id: '9d', direction: 'down', startRow: 0, startCol: 7, answer: 'LALE', clue: 'İstanbul\'un simgesi çiçek', num: 9 },
    ],
  },

  // ─── LEVEL 5 (9x9, Medium) ───
  {
    id: 5,
    gridSize: 9,
    difficulty: 'Orta',
    title: 'Müzik',
    words: [
      // Across
      { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'MERAK', clue: 'Bilme isteği, curiosity', num: 1 },
      { id: '2a', direction: 'across', startRow: 2, startCol: 0, answer: 'ZAMAN', clue: 'Geçen dakikalar ve saatler', num: 2 },
      { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'İMZA', clue: 'El yazısıyla atılan onay', num: 3 },
      { id: '4a', direction: 'across', startRow: 4, startCol: 0, answer: 'KAYAK', clue: 'Kar üstünde yapılan spor', num: 4 },
      // Down
      { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'MÜZİK', clue: 'Notalarla yapılan sanat', num: 1 },
      { id: '5d', direction: 'down', startRow: 0, startCol: 4, answer: 'KONAK', clue: 'Büyük tarihi ev', num: 5 },
    ],
  },

  // ─── LEVEL 6 (11x11, Hard) ───
  // Cluster 1:  col 0-4, rows 0-4
  //   r0: Ç A Y . .     ÇAY across
  //   r1: İ . Ü . .
  //   r2: Ç E K İ Ç     ÇEKİÇ across
  //   r3: E . Ü . .
  //   r4: K Ö Z . .     KÖZ across
  //   ÇİÇEK down col0, YÜKÜZ... no: Y-Ü-K-Ü-Z down col2
  // Cluster 2: col 5-10, rows 5-9
  //   r5: . . . . . Ş İ İ R . .   ŞİİR across
  //   r6: . . . . . E . . . . .
  //   r7: . . . . . H İ R S . .   HİRS across  (wait no: HIRS)
  //   r8: . . . . . İ . . . . .
  //   r9: . . . . . R . . . . .
  //   ŞEHİR down col5
  {
    id: 6,
    gridSize: 11,
    difficulty: 'Zor',
    title: 'Kültür',
    words: [
      // Cluster 1 (top-left)
      { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'ÇAY', clue: 'Sıcak içecek, demli', num: 1 },
      { id: '2a', direction: 'across', startRow: 2, startCol: 0, answer: 'ÇEKİÇ', clue: 'Çivi çakmak için alet', num: 2 },
      { id: '3a', direction: 'across', startRow: 4, startCol: 0, answer: 'KÖZ', clue: 'Ateşin kor hâli', num: 3 },
      { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'ÇİÇEK', clue: 'Bahçede açan renkli bitki', num: 1 },
      // Cluster 2 (bottom-right)
      { id: '4a', direction: 'across', startRow: 5, startCol: 5, answer: 'ŞİİR', clue: 'Manzume, nazım ile yazılan', num: 4 },
      { id: '5a', direction: 'across', startRow: 7, startCol: 5, answer: 'HİRS', clue: 'Aşırı tutku, istek', num: 5 },
      { id: '4d', direction: 'down', startRow: 5, startCol: 5, answer: 'ŞEHİR', clue: 'Büyük yerleşim yeri', num: 4 },
      { id: '6d', direction: 'down', startRow: 0, startCol: 2, answer: 'YÜKÜ', clue: 'Taşıdığı ağırlığı (iyelik)', num: 6 },
    ],
  },
];
