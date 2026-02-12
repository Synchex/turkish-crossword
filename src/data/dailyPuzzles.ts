import { LevelData } from '../game/types';

/**
 * Pool of daily puzzles. One is deterministically picked per calendar day.
 * Format is identical to the main levels: gridSize, words[], etc.
 */
export const dailyPuzzles: LevelData[] = [
    // ─── Daily 1 (7x7) ───
    {
        id: 101,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Doğa',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'BULUT', clue: 'Gökyüzünde süzülen beyaz yığın', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'AĞAÇ', clue: 'Gövdesi ve dalları olan bitki', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'YAĞMUR', clue: 'Bulutlardan düşen su', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'BAĞ', clue: 'Üzüm yetiştirilen yer', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'UZAY', clue: 'Dünya dışındaki boşluk', num: 4 },
        ],
    },
    // ─── Daily 2 (7x7) ───
    {
        id: 102,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Hayvanlar',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'KARGA', clue: 'Siyah tüylü kuş', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ASLAN', clue: 'Orman kralı', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'TAVUK', clue: 'Yumurta veren evcil hayvan', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'KAST', clue: 'Niyet, amaç', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 4, answer: 'ANI', clue: 'Hatıra, anı', num: 4 },
        ],
    },
    // ─── Daily 3 (7x7) ───
    {
        id: 103,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Mutfak',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'TABAK', clue: 'Yemek servis edilen kap', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ÇATAL', clue: 'Yemek yeme aleti', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'KAŞIK', clue: 'Çorba içme aleti', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'TAVA', clue: 'Yemek pişirme kabı', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 4, answer: 'KASE', clue: 'Derin çanak', num: 4 },
        ],
    },
    // ─── Daily 4 (7x7) ───
    {
        id: 104,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Okul',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'KİTAP', clue: 'Okunan basılı eser', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'DEFTER', clue: 'Yazı yazmak için kullanılan', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'KALEM', clue: 'Yazı aracı', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'KOVA', clue: 'Su taşıma kabı', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 2, answer: 'TARLA', clue: 'Ekin ekilen alan', num: 4 },
        ],
    },
    // ─── Daily 5 (7x7) ───
    {
        id: 105,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Vücut',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'KALP', clue: 'Kanı pompalayan organ', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'OMUZ', clue: 'Kolun gövdeye bağlandığı yer', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'DİZİ', clue: 'Bacaktaki eklem', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'KOL', clue: 'Omuzdan ele kadar', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'PAZU', clue: 'Kolun üst kısmı', num: 4 },
        ],
    },
    // ─── Daily 6 (7x7) ───
    {
        id: 106,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Mevsimler',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'BAHAR', clue: 'Çiçeklerin açtığı mevsim', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'YAZIN', clue: 'Sıcak mevsimde', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'SOĞUK', clue: 'Sıcaklığın düşük olması', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'BUZUL', clue: 'Büyük buz kütlesi', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 4, answer: 'RÜZGÂR', clue: 'Havanın hareketi', num: 4 },
        ],
    },
    // ─── Daily 7 (7x7) ───
    {
        id: 107,
        gridSize: 7,
        difficulty: 'Orta',
        title: 'Günlük: Spor',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'FUTBOL', clue: 'Dünyada en çok oynanan spor', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'BASKET', clue: 'Potaya atılan top oyunu', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'KOŞU', clue: 'Hızlı yürüyüş', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'FARE', clue: 'Küçük kemirgen', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 5, answer: 'LİG', clue: 'Takımların yarıştığı turnuva', num: 4 },
        ],
    },
    // ─── Daily 8 (7x7) ───
    {
        id: 108,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Evde',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'MASA', clue: 'Üstüne eşya konan mobilya', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'KAPI', clue: 'Odaya girişi sağlayan', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'YATAK', clue: 'Uyunan yer', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'MALA', clue: 'Sıva aracı', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'AYAK', clue: 'Yürümek için kullanılan', num: 4 },
        ],
    },
    // ─── Daily 9 (7x7) ───
    {
        id: 109,
        gridSize: 7,
        difficulty: 'Orta',
        title: 'Günlük: Deniz',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'GEMİ', clue: 'Denizde yol alan büyük taşıt', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'DALGA', clue: 'Deniz yüzeyindeki hareket', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'KUMSAL', clue: 'Kumlu sahil şeridi', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'GÖLET', clue: 'Küçük yapay göl', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'İPLİK', clue: 'İnce uzun lif', num: 4 },
        ],
    },
    // ─── Daily 10 (7x7) ───
    {
        id: 110,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Aile',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'ANNE', clue: 'Onu doğuran kadın', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'BABA', clue: 'Ata, peder', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'KARDEŞ', clue: 'Ayni anne-babadan olan', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'ABİ', clue: 'Büyük erkek kardeş', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'EVLAT', clue: 'Çocuk, oğul veya kız', num: 4 },
        ],
    },
    // ─── Daily 11 (7x7) ───
    {
        id: 111,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Ulaşım',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'TREN', clue: 'Raylarda giden taşıt', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'OTOBÜS', clue: 'Toplu taşıma aracı', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'VAPUR', clue: 'Denizde yolcu taşıyan gemi', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'TAKSI', clue: 'Sarı renkli kiralık otomobil', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'NİSAN', clue: 'Yılın dördüncü ayı', num: 4 },
        ],
    },
    // ─── Daily 12 (7x7) ───
    {
        id: 112,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Giyim',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'GÖMLEK', clue: 'Üst bedene giyilen, düğmeli', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ŞAPKA', clue: 'Başa takılan akseuar', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'ETEK', clue: 'Belden aşağı giyilen', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'GÜNEŞ', clue: 'Sabah doğan yıldız', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'LİMAN', clue: 'Gemilerin yanaştığı yer', num: 4 },
        ],
    },
    // ─── Daily 13 (7x7) ───
    {
        id: 113,
        gridSize: 7,
        difficulty: 'Orta',
        title: 'Günlük: Bilim',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'FİZİK', clue: 'Madde ve enerji bilimi', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ATOM', clue: 'Maddenin en küçük yapı taşı', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'DENEY', clue: 'Laboratuvarda yapılan test', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'FOTON', clue: 'Işık parçacığı', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 4, answer: 'KÜTLE', clue: 'Cismin madde miktarı', num: 4 },
        ],
    },
    // ─── Daily 14 (7x7) ───
    {
        id: 114,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Meyve',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'ELMA', clue: 'Kırmızı veya yeşil meyve', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ÜZÜM', clue: 'Salkım halinde yetişen', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'ARMUT', clue: 'Alt tarafı geniş meyve', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'ERIK', clue: 'Küçük yuvarlak meyve', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'ASMA', clue: 'Üzüm veren bitki', num: 4 },
        ],
    },
    // ─── Daily 15 (7x7) ───
    {
        id: 115,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Renk',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'MAVİ', clue: 'Gökyüzünün rengi', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'TURUNCU', clue: 'Portakalın rengi', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'BEYAZ', clue: 'Karın rengi', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'MENEKŞE', clue: 'Mor renkli çiçek', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'İLAN', clue: 'Duyuru, reklam', num: 4 },
        ],
    },
    // ─── Daily 16 (7x7) ───
    {
        id: 116,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Müzik',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'NOTA', clue: 'Müzik işareti', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'ŞARKI', clue: 'Söylenen melodi', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'RİTİM', clue: 'Müzikte tempo düzeni', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'NEFES', clue: 'Soluk, solunum', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'AKORT', clue: 'Enstrüman ayarlama', num: 4 },
        ],
    },
    // ─── Daily 17 (7x7) ───
    {
        id: 117,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Zaman',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'SAAT', clue: 'Zamanı gösteren alet', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'HAFTA', clue: '7 günlük süre', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'YÜZYIL', clue: '100 yıllık dönem', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'SİNEMA', clue: 'Film izlenen yer', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'TAKVIM', clue: 'Günleri gösteren araç', num: 4 },
        ],
    },
    // ─── Daily 18 (7x7) ───
    {
        id: 118,
        gridSize: 7,
        difficulty: 'Orta',
        title: 'Günlük: Coğrafya',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'AKARSU', clue: 'Akan su kütlesi, nehir', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'YAYLA', clue: 'Yüksek düzlük alan', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'VADI', clue: 'İki dağ arasındaki çukur', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'ADA', clue: 'Suyla çevrili kara parçası', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'RİZE', clue: 'Çay diyarı il', num: 4 },
        ],
    },
    // ─── Daily 19 (7x7) ───
    {
        id: 119,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Tatil',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'PLAJ', clue: 'Güneşlenilen kumsal', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'OTEL', clue: 'Konaklama yeri', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'VALİZ', clue: 'Seyahat çantası', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'PAS', clue: 'Demir pası', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'JEST', clue: 'El hareketi, mimik', num: 4 },
        ],
    },
    // ─── Daily 20 (7x7) ───
    {
        id: 120,
        gridSize: 7,
        difficulty: 'Kolay',
        title: 'Günlük: Sanat',
        words: [
            { id: '1a', direction: 'across', startRow: 0, startCol: 0, answer: 'HEYKEL', clue: 'Taştan veya bronzdan yapılan', num: 1 },
            { id: '2a', direction: 'across', startRow: 1, startCol: 0, answer: 'RESİM', clue: 'Boyayla yapılan tablo', num: 2 },
            { id: '3a', direction: 'across', startRow: 3, startCol: 0, answer: 'SAHNE', clue: 'Tiyatro gösterisinin yapıldığı yer', num: 3 },
            { id: '1d', direction: 'down', startRow: 0, startCol: 0, answer: 'HÜZÜN', clue: 'Derin üzüntü', num: 1 },
            { id: '4d', direction: 'down', startRow: 0, startCol: 3, answer: 'KİL', clue: 'Çamur, seramik yapılan toprak', num: 4 },
        ],
    },
];

// Daily reward constants
export const DAILY_COIN_REWARD = 30;
export const DAILY_XP_REWARD = 40;
