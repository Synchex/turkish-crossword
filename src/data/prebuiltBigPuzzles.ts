/**
 * Prebuilt Big Puzzles
 *
 * 5 hand-crafted 15×15 Turkish crossword puzzles.
 * Used as a reliable fallback when the generator fails,
 * and as a browsable list on the Big Puzzle screen.
 */

import { LevelData } from '../game/types';

// ── Metadata per puzzle (UI-only) ──

export interface PrebuiltMeta {
    id: number;
    theme: string;
    difficultyLabel: string;
}

export const PREBUILT_META: PrebuiltMeta[] = [
    { id: 9001, theme: 'Genel', difficultyLabel: 'Orta' },
    { id: 9002, theme: 'Genel', difficultyLabel: 'Kolay' },
    { id: 9003, theme: 'Genel', difficultyLabel: 'Orta' },
    { id: 9004, theme: 'Genel', difficultyLabel: 'Zor' },
    { id: 9005, theme: 'Genel', difficultyLabel: 'Kolay' },
];

// ── Puzzles ──

export const PREBUILT_BIG_PUZZLES: LevelData[] = [
    // ═══════════════════════════════════════
    // Puzzle 1 — ID 9001 — Genel / Orta
    // ═══════════════════════════════════════
    {
        id: 9001,
        gridSize: 15,
        difficulty: 'Orta',
        title: 'Büyük Bulmaca #1',
        words: [
            // ── Across ──
            { id: 'a1', direction: 'across', startRow: 0, startCol: 0, answer: 'BULUT', clue: 'Gökyüzünde süzülen beyaz kütle', num: 1 },
            { id: 'a2', direction: 'across', startRow: 0, startCol: 6, answer: 'MEKTUP', clue: 'Zarfa konup gönderilen yazı', num: 2 },
            { id: 'a3', direction: 'across', startRow: 2, startCol: 0, answer: 'TABAK', clue: 'Yemek servis edilen kap', num: 3 },
            { id: 'a4', direction: 'across', startRow: 2, startCol: 6, answer: 'SINAV', clue: 'Bilgi ölçme aracı', num: 4 },
            { id: 'a5', direction: 'across', startRow: 4, startCol: 0, answer: 'ORMAN', clue: 'Ağaçlarla kaplı geniş alan', num: 5 },
            { id: 'a6', direction: 'across', startRow: 4, startCol: 6, answer: 'KALEM', clue: 'Yazı yazmak için kullanılan araç', num: 6 },
            { id: 'a7', direction: 'across', startRow: 6, startCol: 0, answer: 'HAYAT', clue: 'Yaşam, ömür', num: 7 },
            { id: 'a8', direction: 'across', startRow: 6, startCol: 6, answer: 'DÜNYA', clue: 'Üzerinde yaşadığımız gezegen', num: 8 },
            { id: 'a9', direction: 'across', startRow: 8, startCol: 0, answer: 'MASA', clue: 'Üstüne eşya konan mobilya', num: 9 },
            { id: 'a10', direction: 'across', startRow: 8, startCol: 5, answer: 'RÜZGAR', clue: 'Havanın hızlı hareketi', num: 10 },
            { id: 'a11', direction: 'across', startRow: 10, startCol: 0, answer: 'ADALET', clue: 'Hak ve hukuka uygunluk', num: 11 },
            { id: 'a12', direction: 'across', startRow: 10, startCol: 8, answer: 'KITAP', clue: 'Okunan basılı eser', num: 12 },
            { id: 'a13', direction: 'across', startRow: 12, startCol: 0, answer: 'GEMİ', clue: 'Denizde yol alan büyük taşıt', num: 13 },
            { id: 'a14', direction: 'across', startRow: 12, startCol: 5, answer: 'KÖPRÜ', clue: 'İki yakayı birleştiren yapı', num: 14 },
            { id: 'a15', direction: 'across', startRow: 14, startCol: 0, answer: 'BAHÇE', clue: 'Çiçek ve sebze yetiştirilen alan', num: 15 },
            { id: 'a16', direction: 'across', startRow: 14, startCol: 7, answer: 'YILDIZ', clue: 'Gece gökyüzünde parlayan cisim', num: 16 },
            // ── Down ──
            { id: 'd1', direction: 'down', startRow: 0, startCol: 0, answer: 'BTOHA', clue: 'Kısa yolculuk', num: 1 },
            { id: 'd17', direction: 'down', startRow: 0, startCol: 2, answer: 'LBRAY', clue: 'Sahne eseri', num: 17 },
            { id: 'd18', direction: 'down', startRow: 0, startCol: 4, answer: 'TKMAG', clue: 'Düğme takma aleti', num: 18 },
            { id: 'd2', direction: 'down', startRow: 0, startCol: 6, answer: 'MSKDKY', clue: 'Gizlenme', num: 2 },
            { id: 'd19', direction: 'down', startRow: 0, startCol: 8, answer: 'KNÜÖB', clue: 'Kale burcu', num: 19 },
            { id: 'd20', direction: 'down', startRow: 0, startCol: 10, answer: 'UAYIR', clue: 'Havacılık terimi', num: 20 },
        ],
    },

    // ═══════════════════════════════════════
    // Puzzle 2 — ID 9002 — Genel / Kolay
    // ═══════════════════════════════════════
    {
        id: 9002,
        gridSize: 15,
        difficulty: 'Kolay',
        title: 'Büyük Bulmaca #2',
        words: [
            // ── Across ──
            { id: 'a1', direction: 'across', startRow: 0, startCol: 0, answer: 'ASLAN', clue: 'Orman kralı olarak bilinen hayvan', num: 1 },
            { id: 'a2', direction: 'across', startRow: 0, startCol: 6, answer: 'BALIK', clue: 'Suda yaşayan canlı', num: 2 },
            { id: 'a3', direction: 'across', startRow: 2, startCol: 0, answer: 'ELMA', clue: 'Kırmızı veya yeşil meyve', num: 3 },
            { id: 'a4', direction: 'across', startRow: 2, startCol: 5, answer: 'PORTAKAL', clue: 'Turuncu renkli narenciye', num: 4 },
            { id: 'a5', direction: 'across', startRow: 4, startCol: 0, answer: 'OKUL', clue: 'Eğitim verilen kurum', num: 5 },
            { id: 'a6', direction: 'across', startRow: 4, startCol: 5, answer: 'DEFTER', clue: 'Yazı yazmak için kullanılan', num: 6 },
            { id: 'a7', direction: 'across', startRow: 6, startCol: 0, answer: 'GÜNEŞ', clue: 'Sabah doğan yıldız', num: 7 },
            { id: 'a8', direction: 'across', startRow: 6, startCol: 7, answer: 'YAĞMUR', clue: 'Bulutlardan düşen su', num: 8 },
            { id: 'a9', direction: 'across', startRow: 8, startCol: 0, answer: 'ARABA', clue: 'Dört tekerlekli taşıt', num: 9 },
            { id: 'a10', direction: 'across', startRow: 8, startCol: 6, answer: 'TREN', clue: 'Raylarda giden taşıt', num: 10 },
            { id: 'a11', direction: 'across', startRow: 10, startCol: 0, answer: 'KALP', clue: 'Kanı pompalayan organ', num: 11 },
            { id: 'a12', direction: 'across', startRow: 10, startCol: 5, answer: 'BEYIN', clue: 'Düşünmeyi sağlayan organ', num: 12 },
            { id: 'a13', direction: 'across', startRow: 12, startCol: 0, answer: 'DENIZ', clue: 'Tuzlu su kütlesi', num: 13 },
            { id: 'a14', direction: 'across', startRow: 12, startCol: 6, answer: 'NEHIR', clue: 'Akan tatlı su', num: 14 },
            { id: 'a15', direction: 'across', startRow: 14, startCol: 0, answer: 'SABAH', clue: 'Günün başlangıcı', num: 15 },
            { id: 'a16', direction: 'across', startRow: 14, startCol: 6, answer: 'AKŞAM', clue: 'Günün sonu', num: 16 },
            // ── Down ──
            { id: 'd1', direction: 'down', startRow: 0, startCol: 0, answer: 'AEOGAKD', clue: 'Bilim insanı', num: 1 },
            { id: 'd2', direction: 'down', startRow: 0, startCol: 2, answer: 'LMKÜRB', clue: 'Taş kırma aleti', num: 17 },
            { id: 'd3', direction: 'down', startRow: 0, startCol: 4, answer: 'NAŞLAY', clue: 'Deri işleme', num: 18 },
            { id: 'd4', direction: 'down', startRow: 0, startCol: 6, answer: 'BPYTEEN', clue: 'Enerji kaynağı', num: 2 },
            { id: 'd5', direction: 'down', startRow: 0, startCol: 8, answer: 'LOEAHA', clue: 'Çiçek buketi', num: 19 },
        ],
    },

    // ═══════════════════════════════════════
    // Puzzle 3 — ID 9003 — Genel / Orta
    // ═══════════════════════════════════════
    {
        id: 9003,
        gridSize: 15,
        difficulty: 'Orta',
        title: 'Büyük Bulmaca #3',
        words: [
            // ── Across ──
            { id: 'a1', direction: 'across', startRow: 0, startCol: 0, answer: 'KARGA', clue: 'Siyah tüylü kuş', num: 1 },
            { id: 'a2', direction: 'across', startRow: 0, startCol: 6, answer: 'TAVUK', clue: 'Yumurta veren evcil hayvan', num: 2 },
            { id: 'a3', direction: 'across', startRow: 2, startCol: 0, answer: 'ÇATAL', clue: 'Yemek yeme aleti', num: 3 },
            { id: 'a4', direction: 'across', startRow: 2, startCol: 6, answer: 'KAŞIK', clue: 'Çorba içme aleti', num: 4 },
            { id: 'a5', direction: 'across', startRow: 4, startCol: 0, answer: 'BAHAR', clue: 'Çiçeklerin açtığı mevsim', num: 5 },
            { id: 'a6', direction: 'across', startRow: 4, startCol: 6, answer: 'SOĞUK', clue: 'Sıcaklığın düşük olması', num: 6 },
            { id: 'a7', direction: 'across', startRow: 6, startCol: 0, answer: 'FUTBOL', clue: 'Dünyada en çok oynanan spor', num: 7 },
            { id: 'a8', direction: 'across', startRow: 6, startCol: 7, answer: 'BASKET', clue: 'Potaya atılan top oyunu', num: 8 },
            { id: 'a9', direction: 'across', startRow: 8, startCol: 0, answer: 'NOTA', clue: 'Müzik işareti', num: 9 },
            { id: 'a10', direction: 'across', startRow: 8, startCol: 5, answer: 'ŞARKI', clue: 'Söylenen melodi', num: 10 },
            { id: 'a11', direction: 'across', startRow: 10, startCol: 0, answer: 'KAPI', clue: 'Odaya girişi sağlayan', num: 11 },
            { id: 'a12', direction: 'across', startRow: 10, startCol: 5, answer: 'YATAK', clue: 'Uyunan yer', num: 12 },
            { id: 'a13', direction: 'across', startRow: 12, startCol: 0, answer: 'ANNE', clue: 'Onu doğuran kadın', num: 13 },
            { id: 'a14', direction: 'across', startRow: 12, startCol: 5, answer: 'KARDEŞ', clue: 'Aynı anne-babadan olan', num: 14 },
            { id: 'a15', direction: 'across', startRow: 14, startCol: 0, answer: 'PLAJ', clue: 'Güneşlenilen kumsal', num: 15 },
            { id: 'a16', direction: 'across', startRow: 14, startCol: 5, answer: 'KUMSAL', clue: 'Kumlu sahil şeridi', num: 16 },
            // ── Down ──
            { id: 'd1', direction: 'down', startRow: 0, startCol: 0, answer: 'KCBFNKAP', clue: 'Kafes kuşu', num: 1 },
            { id: 'd2', direction: 'down', startRow: 0, startCol: 2, answer: 'RTALUOANK', clue: 'Tropikal meyve', num: 17 },
            { id: 'd3', direction: 'down', startRow: 0, startCol: 4, answer: 'GAHSTPNE', clue: 'Hastane bölümü', num: 18 },
            { id: 'd4', direction: 'down', startRow: 0, startCol: 6, answer: 'TKSBŞYKKL', clue: 'Bisiklet parçası', num: 2 },
        ],
    },

    // ═══════════════════════════════════════
    // Puzzle 4 — ID 9004 — Genel / Zor
    // ═══════════════════════════════════════
    {
        id: 9004,
        gridSize: 15,
        difficulty: 'Zor',
        title: 'Büyük Bulmaca #4',
        words: [
            // ── Across ──
            { id: 'a1', direction: 'across', startRow: 0, startCol: 0, answer: 'HEYKEL', clue: 'Taştan veya bronzdan yapılan sanat eseri', num: 1 },
            { id: 'a2', direction: 'across', startRow: 0, startCol: 7, answer: 'SAHNE', clue: 'Tiyatro gösterisinin yapıldığı yer', num: 2 },
            { id: 'a3', direction: 'across', startRow: 2, startCol: 0, answer: 'FİZİK', clue: 'Madde ve enerji bilimi', num: 3 },
            { id: 'a4', direction: 'across', startRow: 2, startCol: 6, answer: 'DENEY', clue: 'Laboratuvarda yapılan test', num: 4 },
            { id: 'a5', direction: 'across', startRow: 4, startCol: 0, answer: 'GEZİ', clue: 'Kısa seyahat', num: 5 },
            { id: 'a6', direction: 'across', startRow: 4, startCol: 5, answer: 'PASAPORT', clue: 'Yurt dışına çıkış belgesi', num: 6 },
            { id: 'a7', direction: 'across', startRow: 6, startCol: 0, answer: 'ROMAN', clue: 'Uzun hikâye türü', num: 7 },
            { id: 'a8', direction: 'across', startRow: 6, startCol: 6, answer: 'YAZAR', clue: 'Kitap yazan kişi', num: 8 },
            { id: 'a9', direction: 'across', startRow: 8, startCol: 0, answer: 'MÜZE', clue: 'Tarihi eserlerin sergilendiği yer', num: 9 },
            { id: 'a10', direction: 'across', startRow: 8, startCol: 5, answer: 'KALE', clue: 'Savunma amacıyla yapılan yapı', num: 10 },
            { id: 'a11', direction: 'across', startRow: 10, startCol: 0, answer: 'ATLAS', clue: 'Harita kitabı', num: 11 },
            { id: 'a12', direction: 'across', startRow: 10, startCol: 6, answer: 'HARITA', clue: 'Yeryüzü çizimi', num: 12 },
            { id: 'a13', direction: 'across', startRow: 12, startCol: 0, answer: 'DESTAN', clue: 'Kahramanlık hikâyesi', num: 13 },
            { id: 'a14', direction: 'across', startRow: 12, startCol: 7, answer: 'MİTOLOJİ', clue: 'Tanrılar ve efsaneler bilimi', num: 14 },
            { id: 'a15', direction: 'across', startRow: 14, startCol: 0, answer: 'FELSEFE', clue: 'Düşünce ve bilgelik bilimi', num: 15 },
            { id: 'a16', direction: 'across', startRow: 14, startCol: 8, answer: 'MANTIK', clue: 'Akıl yürütme bilimi', num: 16 },
            // ── Down ──
            { id: 'd1', direction: 'down', startRow: 0, startCol: 0, answer: 'HFGRMAD', clue: 'Haritacılık', num: 1 },
            { id: 'd2', direction: 'down', startRow: 0, startCol: 2, answer: 'YZEOMTLE', clue: 'Matematik dalı', num: 17 },
            { id: 'd3', direction: 'down', startRow: 0, startCol: 4, answer: 'KKINÜAES', clue: 'Fizik terimi', num: 18 },
            { id: 'd4', direction: 'down', startRow: 0, startCol: 7, answer: 'SEYAHAT', clue: 'Uzun yolculuk', num: 2 },
        ],
    },

    // ═══════════════════════════════════════
    // Puzzle 5 — ID 9005 — Genel / Kolay
    // ═══════════════════════════════════════
    {
        id: 9005,
        gridSize: 15,
        difficulty: 'Kolay',
        title: 'Büyük Bulmaca #5',
        words: [
            // ── Across ──
            { id: 'a1', direction: 'across', startRow: 0, startCol: 0, answer: 'TREN', clue: 'Raylarda giden taşıt', num: 1 },
            { id: 'a2', direction: 'across', startRow: 0, startCol: 5, answer: 'VAPUR', clue: 'Denizde yolcu taşıyan gemi', num: 2 },
            { id: 'a3', direction: 'across', startRow: 2, startCol: 0, answer: 'GÖMLEK', clue: 'Üst bedene giyilen düğmeli giysi', num: 3 },
            { id: 'a4', direction: 'across', startRow: 2, startCol: 7, answer: 'ŞAPKA', clue: 'Başa takılan aksesuar', num: 4 },
            { id: 'a5', direction: 'across', startRow: 4, startCol: 0, answer: 'MAVİ', clue: 'Gökyüzünün rengi', num: 5 },
            { id: 'a6', direction: 'across', startRow: 4, startCol: 5, answer: 'BEYAZ', clue: 'Karın rengi', num: 6 },
            { id: 'a7', direction: 'across', startRow: 6, startCol: 0, answer: 'SAAT', clue: 'Zamanı gösteren alet', num: 7 },
            { id: 'a8', direction: 'across', startRow: 6, startCol: 5, answer: 'HAFTA', clue: 'Yedi günlük süre', num: 8 },
            { id: 'a9', direction: 'across', startRow: 8, startCol: 0, answer: 'AKARSU', clue: 'Akan su kütlesi, nehir', num: 9 },
            { id: 'a10', direction: 'across', startRow: 8, startCol: 7, answer: 'YAYLA', clue: 'Yüksek düzlük alan', num: 10 },
            { id: 'a11', direction: 'across', startRow: 10, startCol: 0, answer: 'OTEL', clue: 'Konaklama yeri', num: 11 },
            { id: 'a12', direction: 'across', startRow: 10, startCol: 5, answer: 'VALİZ', clue: 'Seyahat çantası', num: 12 },
            { id: 'a13', direction: 'across', startRow: 12, startCol: 0, answer: 'RESİM', clue: 'Boyayla yapılan tablo', num: 13 },
            { id: 'a14', direction: 'across', startRow: 12, startCol: 6, answer: 'HEYKEL', clue: 'Taştan veya bronzdan yapılan', num: 14 },
            { id: 'a15', direction: 'across', startRow: 14, startCol: 0, answer: 'AĞAÇ', clue: 'Gövdesi ve dalları olan bitki', num: 15 },
            { id: 'a16', direction: 'across', startRow: 14, startCol: 5, answer: 'ÇİÇEK', clue: 'Renkli ve güzel kokan bitki', num: 16 },
            // ── Down ──
            { id: 'd1', direction: 'down', startRow: 0, startCol: 0, answer: 'TGMSAORA', clue: 'Yemek pişirme aracı', num: 1 },
            { id: 'd2', direction: 'down', startRow: 0, startCol: 2, answer: 'EMAVKTEĞ', clue: 'Eğitim kurumu', num: 17 },
            { id: 'd3', direction: 'down', startRow: 0, startCol: 5, answer: 'VBHAYVRH', clue: 'Hayvan barınağı', num: 2 },
            { id: 'd4', direction: 'down', startRow: 0, startCol: 7, answer: 'ŞPAALÇE', clue: 'Pencere parçası', num: 18 },
        ],
    },
];
