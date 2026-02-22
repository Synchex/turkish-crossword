#!/usr/bin/env node
/**
 * generate_levels.js — Auto-generate crossword levels from questions_db.json
 *
 * Usage: node scripts/generate_levels.js
 *
 * Reads the question database, generates valid crossword grids, and appends
 * new PuzzleSpec entries to src/cengel/puzzles/generated.ts.
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ──
const START_ID = 41; // first new level ID
const TIERS = [
    { gridSize: 6, minWords: 5, maxWords: 5, difficulty: 'easy', count: 10 },
    { gridSize: 7, minWords: 6, maxWords: 7, difficulty: 'easy', count: 10 },
    { gridSize: 9, minWords: 8, maxWords: 12, difficulty: 'medium', count: 20 },
    { gridSize: 11, minWords: 12, maxWords: 18, difficulty: 'medium', count: 20 },
    { gridSize: 13, minWords: 16, maxWords: 24, difficulty: 'hard', count: 20 },
];
const MIN_ANSWER_LEN = 3;
const MAX_ATTEMPTS_PER_LEVEL = 50;
const MAX_PLACEMENT_TRIES = 200;

const TITLES = [
    'Yeni Ufuk', 'Cesaret', 'Aydınlık', 'Kıvılcım', 'Pusula',
    'Yıldız', 'Deniz Feneri', 'Rüzgar Gülü', 'Atlas', 'Meridyen',
    'Kaşif', 'Çınar', 'Güneş Batımı', 'Firtina Sonrası', 'Şafak',
    'Özgürlük', 'Ufuk', 'Sabah Yıldızı', 'Deniz Kabuğu', 'Köprü',
    'Yolculuk', 'Dönüm Noktası', 'Işık Hızı', 'Keşif Yolu', 'Basamak',
    'Zeka Harmanı', 'Sis Perdesi', 'Altın Çağ', 'Kayıp Şehir', 'Bilge',
    'Mozaik', 'Labirent', 'Zirvede', 'Derya', 'Fener',
    'Yaprak Dökümü', 'Yükselen', 'Dalga Kıran', 'Çelik Pençe', 'Ejderha',
    'Titan', 'Cennet Bahçesi', 'Hazine Avı', 'Bilgi Çeşmesi', 'Gizem',
    'Kartal Yuvası', 'Sonsuzluk', 'İlham', 'Miras', 'Dev Adım',
    'Buz Kırıcı', 'Zaman Çarkı', 'Şahi̇n', 'Yeni Sayfa', 'Kristal Küre',
    'Masal Ormanı', 'Gökkuşağı', 'Çoban Yıldızı', 'Tılsım', 'Efsane Ötesi',
    'Büyük Resim', 'Hedef', 'Zafer Yolu', 'Son Hamle', 'Destan',
    'Göçmen Kuş', 'Kıyamet', 'Doruklarda', 'Gizli Bahçe', 'Firtina Kuşu',
    'Yeni Dünya', 'İnci', 'Altın Anahtar', 'Zümrüt', 'Çığır',
    'Dalgaların Ötesi', 'Bozkır', 'Karanlık Oda', 'Işık Topu', 'Kumdaki İz',
];

// ── Load questions ──
const DB_PATH = path.join(__dirname, '..', 'src', 'data', 'questions_db.json');
const questions = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Filter: min 3 letters, all uppercase
const allQA = questions
    .filter(q => q.answer && q.clue && q.answer.length >= MIN_ANSWER_LEN)
    .map(q => ({
        answer: q.answer.toUpperCase().replace(/\s+/g, ''),
        clue: q.clue,
        len: q.answer.length,
    }));

console.log(`Loaded ${allQA.length} valid Q&A pairs`);

// ── Index by length ──
const byLength = {};
for (const q of allQA) {
    if (!byLength[q.len]) byLength[q.len] = [];
    byLength[q.len].push(q);
}

// ── Index by letter at position ──
// letterIndex[char][position] = [qa, qa, ...]
const letterIndex = {};
for (const q of allQA) {
    for (let i = 0; i < q.answer.length; i++) {
        const ch = q.answer[i];
        if (!letterIndex[ch]) letterIndex[ch] = {};
        if (!letterIndex[ch][i]) letterIndex[ch][i] = [];
        letterIndex[ch][i].push(q);
    }
}

// ── Shuffle array ──
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── Grid helper ──
function createGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
}

/**
 * Try to place a word on the grid.
 * Returns placement info or null if invalid.
 */
function tryPlace(grid, size, answer, direction, clueRow, clueCol, usedAnswers) {
    if (usedAnswers.has(answer)) return null;

    // Check clue cell is in bounds
    if (clueRow < 0 || clueRow >= size || clueCol < 0 || clueCol >= size) return null;

    // Check clue cell isn't a letter cell
    const clueCell = grid[clueRow][clueCol];
    if (clueCell !== null && clueCell !== 'CLUE') return null;

    // Check letter cells
    let hasIntersection = false;
    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'down' ? clueRow + 1 + i : clueRow;
        const c = direction === 'across' ? clueCol + 1 + i : clueCol;

        if (r < 0 || r >= size || c < 0 || c >= size) return null;

        const cell = grid[r][c];
        if (cell === 'CLUE') return null; // can't place letter on clue cell
        if (cell !== null && cell !== answer[i]) return null; // conflict
        if (cell === answer[i]) hasIntersection = true;
    }

    return { clueRow, clueCol, direction, answer, hasIntersection };
}

/**
 * Apply a placement to the grid.
 */
function applyPlacement(grid, placement) {
    const { clueRow, clueCol, direction, answer } = placement;
    grid[clueRow][clueCol] = 'CLUE';

    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'down' ? clueRow + 1 + i : clueRow;
        const c = direction === 'across' ? clueCol + 1 + i : clueCol;
        grid[r][c] = answer[i];
    }
}

/**
 * Remove a placement from the grid (for backtracking).
 */
function removePlacement(grid, size, placement, otherPlacements) {
    const { clueRow, clueCol, direction, answer } = placement;

    // Build a set of all cells used by other placements
    const protectedCells = new Set();
    for (const p of otherPlacements) {
        protectedCells.add(`${p.clueRow},${p.clueCol}`);
        for (let i = 0; i < p.answer.length; i++) {
            const r = p.direction === 'down' ? p.clueRow + 1 + i : p.clueRow;
            const c = p.direction === 'across' ? p.clueCol + 1 + i : p.clueCol;
            protectedCells.add(`${r},${c}`);
        }
    }

    // Only clear cells that aren't used by other placements
    const key0 = `${clueRow},${clueCol}`;
    if (!protectedCells.has(key0)) grid[clueRow][clueCol] = null;

    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'down' ? clueRow + 1 + i : clueRow;
        const c = direction === 'across' ? clueCol + 1 + i : clueCol;
        const key = `${r},${c}`;
        if (!protectedCells.has(key)) grid[r][c] = null;
    }
}

/**
 * Find candidate words that can intersect with existing placed words.
 */
function findCandidates(grid, size, usedAnswers, maxLen) {
    const candidates = [];

    // Scan the grid for placed letters and find intersecting candidates
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const letter = grid[r][c];
            if (!letter || letter === 'CLUE') continue;

            // Try placing across words through this letter
            const acrossEntries = letterIndex[letter] || {};
            for (const [posStr, qaList] of Object.entries(acrossEntries)) {
                const pos = parseInt(posStr);
                for (const qa of qaList) {
                    if (qa.len > maxLen || usedAnswers.has(qa.answer)) continue;
                    const clueCol = c - pos - 1;
                    const clueRow = r;
                    const p = tryPlace(grid, size, qa.answer, 'across', clueRow, clueCol, usedAnswers);
                    if (p && p.hasIntersection) {
                        candidates.push({ ...p, clue: qa.clue });
                    }
                }
            }

            // Try placing down words through this letter
            for (const [posStr, qaList] of Object.entries(acrossEntries)) {
                const pos = parseInt(posStr);
                for (const qa of qaList) {
                    if (qa.len > maxLen || usedAnswers.has(qa.answer)) continue;
                    const clueRow = r - pos - 1;
                    const clueCol = c;
                    const p = tryPlace(grid, size, qa.answer, 'down', clueRow, clueCol, usedAnswers);
                    if (p && p.hasIntersection) {
                        candidates.push({ ...p, clue: qa.clue });
                    }
                }
            }
        }
    }

    return shuffle(candidates);
}

/**
 * Generate a single crossword level.
 */
function generateLevel(gridSize, minWords, maxWords) {
    const maxLen = gridSize - 1; // max answer length (need 1 cell for clue)

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_LEVEL; attempt++) {
        const grid = createGrid(gridSize);
        const placements = [];
        const usedAnswers = new Set();

        // Pick a seed word — preferably long, placed horizontally in the middle
        const seedCandidates = shuffle(
            allQA.filter(q => q.len >= Math.min(4, maxLen) && q.len <= maxLen)
        );

        if (seedCandidates.length === 0) continue;

        const seed = seedCandidates[0];
        const seedRow = Math.floor(gridSize / 2);
        const seedClueCol = 0;
        const seedPlacement = tryPlace(grid, gridSize, seed.answer, 'across', seedRow, seedClueCol, usedAnswers);
        if (!seedPlacement) continue;

        applyPlacement(grid, seedPlacement);
        placements.push({ ...seedPlacement, clue: seed.clue });
        usedAnswers.add(seed.answer);

        // Iteratively add more words
        let stuckCount = 0;
        while (placements.length < maxWords && stuckCount < MAX_PLACEMENT_TRIES) {
            const candidates = findCandidates(grid, gridSize, usedAnswers, maxLen);

            if (candidates.length === 0) {
                stuckCount += MAX_PLACEMENT_TRIES; // can't find any more
                break;
            }

            // Try first valid candidate
            let placed = false;
            for (const cand of candidates.slice(0, 30)) {
                // Double-check placement validity
                const check = tryPlace(grid, gridSize, cand.answer, cand.direction, cand.clueRow, cand.clueCol, usedAnswers);
                if (check) {
                    applyPlacement(grid, cand);
                    placements.push({ clueRow: cand.clueRow, clueCol: cand.clueCol, direction: cand.direction, answer: cand.answer, clue: cand.clue });
                    usedAnswers.add(cand.answer);
                    placed = true;
                    stuckCount = 0;
                    break;
                }
            }

            if (!placed) {
                stuckCount++;
                // Try backtracking: remove last non-seed placement
                if (placements.length > 1 && stuckCount > 10) {
                    const removed = placements.pop();
                    usedAnswers.delete(removed.answer);
                    removePlacement(grid, gridSize, removed, placements);
                }
            }
        }

        if (placements.length >= minWords) {
            return placements.map(p => ({
                clueRow: p.clueRow,
                clueCol: p.clueCol,
                direction: p.direction,
                clue: p.clue,
                answer: p.answer,
            }));
        }
    }

    return null; // failed to generate
}

// ══════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════

console.log('Starting crossword level generation...\n');

const generatedLevels = [];
let currentId = START_ID;
let titleIdx = 0;

for (const tier of TIERS) {
    console.log(`\n── Tier: ${tier.gridSize}×${tier.gridSize} (${tier.difficulty}) ──`);
    let generated = 0;

    for (let i = 0; i < tier.count; i++) {
        const placements = generateLevel(tier.gridSize, tier.minWords, tier.maxWords);

        if (!placements) {
            console.log(`  ✗ ch${currentId} — failed to generate`);
            currentId++;
            titleIdx++;
            continue;
        }

        const levelId = `ch${currentId}`;
        const title = TITLES[titleIdx % TITLES.length];

        generatedLevels.push({
            id: levelId,
            title,
            rows: tier.gridSize,
            cols: tier.gridSize,
            theme: 'Genel',
            difficulty: tier.difficulty,
            placements,
        });

        console.log(`  ✓ ${levelId} "${title}" — ${placements.length} words (${tier.gridSize}×${tier.gridSize})`);
        generated++;
        currentId++;
        titleIdx++;
    }

    console.log(`  Generated ${generated}/${tier.count} levels for this tier`);
}

console.log(`\n═══════════════════════════════════════`);
console.log(`Total generated: ${generatedLevels.length} levels`);

if (generatedLevels.length === 0) {
    console.log('No levels generated. Exiting.');
    process.exit(1);
}

// ── Write output ──
const OUT_PATH = path.join(__dirname, '..', 'src', 'cengel', 'puzzles', 'generated_new.ts');

let output = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated by scripts/generate_levels.js
// ${new Date().toISOString()}

import { PuzzleSpec, WordPlacement } from '../puzzleBuilder';

`;

for (const level of generatedLevels) {
    const placementsStr = level.placements.map(p => {
        const clue = p.clue.replace(/'/g, "\\'");
        return `        { clueRow: ${p.clueRow}, clueCol: ${p.clueCol}, direction: '${p.direction}', clue: '${clue}', answer: '${p.answer}' }`;
    }).join(',\n');

    output += `export const ${level.id}: PuzzleSpec = {
    id: '${level.id}',
    title: '${level.title}',
    rows: ${level.rows},
    cols: ${level.cols},
    theme: '${level.theme}',
    difficulty: '${level.difficulty}',
    placements: [
${placementsStr}
    ],
};

`;
}

// allChapterSpecs array
output += `export const allNewSpecs: PuzzleSpec[] = [\n`;
output += generatedLevels.map(l => `    ${l.id}`).join(',\n');
output += `\n];\n\n`;

// Chapter groups (5 per chapter)
output += `export const newChapterGroups = [\n`;
const chunkSize = 5;
const chapterNames = [
    'Yeni Başlangıç', 'Keşif Yolu', 'Macera', 'İlerleme', 'Güçlenme',
    'Ustalık Yolu', 'Derinlik', 'Çelik İrade', 'Doruklarda', 'Zirve Ötesi',
    'Altın Çağ', 'Efsane Ötesi', 'Büyük Meydan', 'Son Sınav', 'Şampiyon',
    'Ultra Zirve', 'Mega Fırtına',
];
const chapterSubs = [
    'Yeni maceralar başlıyor', 'Keşfetmeye devam', 'Heyecan dorukta',
    'Daha da ilerle', 'Gücünü göster', 'Ustalığını kanıtla',
    'Derinlere dal', 'İradenle kazan', 'Doruklara çık', 'Zirveyi aş',
    'Altın dönem', 'Efsanelerin ötesi', 'Büyük sınav', 'Son mücadele', 'Şampiyonluk',
    'Ötesine geç', 'Fırtınayı aş',
];
let chapterIdx = 0;
for (let i = 0; i < generatedLevels.length; i += chunkSize) {
    const chunk = generatedLevels.slice(i, i + chunkSize);
    const ids = chunk.map(l => `'${l.id}'`).join(', ');
    const name = chapterNames[chapterIdx % chapterNames.length];
    const sub = chapterSubs[chapterIdx % chapterSubs.length];
    output += `    { title: '${name}', subtitle: '${sub}', puzzleIds: [${ids}] },\n`;
    chapterIdx++;
}
output += `];\n`;

fs.writeFileSync(OUT_PATH, output, 'utf-8');
console.log(`\nOutput written to: ${OUT_PATH}`);
console.log('Done!');
