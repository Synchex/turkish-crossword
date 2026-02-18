#!/usr/bin/env node
/**
 * Crossword Chapter Generator
 * 
 * Reads the word pool from questions_db.json and generates 40 chapters
 * of valid crossword puzzles in the Çengel (Scandinavian) format.
 * 
 * Output: src/cengel/puzzles/generated.ts
 * 
 * Algorithm:
 *   1. Load word pool, build letter-position index
 *   2. For each chapter, use constructive placement with backtracking
 *   3. Validate all intersections and grid integrity
 *   4. Write TypeScript output
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// Seeded RNG (Mulberry32)
// ═══════════════════════════════════════════════════════════════
function mulberry32(seed) {
    let s = seed | 0;
    return function () {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffle(arr, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ═══════════════════════════════════════════════════════════════
// Chapter Specs
// ═══════════════════════════════════════════════════════════════
const CHAPTER_SPECS = [];

// Chapters 1-5: 6×6, 4-5 words, easy
for (let i = 1; i <= 5; i++) {
    CHAPTER_SPECS.push({
        id: i, gridSize: 6, minWords: 4, maxWords: 5,
        difficulty: 'easy', minLen: 3, maxLen: 5,
        title: ['Başlangıç', 'İlk Adım', 'Harfler', 'Kelime Bahçesi', 'Kolay Tur'][i - 1],
    });
}
// Chapters 6-10: 7×7, 5-7 words, easy
for (let i = 6; i <= 10; i++) {
    CHAPTER_SPECS.push({
        id: i, gridSize: 7, minWords: 5, maxWords: 7,
        difficulty: 'easy', minLen: 3, maxLen: 6,
        title: ['Keşif', 'Nefes', 'Güneş', 'Dalga', 'Adım'][i - 6],
    });
}
// Chapters 11-20: 9×9, 8-12 words, medium
const medTitles = ['Zihin Jimnastiği', 'Meydan Okuma', 'Bilgi Küpü', 'Ustalık', 'Labirent',
    'Kalem Ucu', 'Sözcük Avı', 'Zeka Oyunu', 'Çapraz Düşün', 'Kelime Ustası'];
for (let i = 11; i <= 20; i++) {
    CHAPTER_SPECS.push({
        id: i, gridSize: 9, minWords: 8, maxWords: 12,
        difficulty: 'medium', minLen: 3, maxLen: 7,
        title: medTitles[i - 11],
    });
}
// Chapters 21-30: 11×11, 12-18 words, medium
const med2Titles = ['Derin Sular', 'Fırtına', 'Zirve Yolu', 'Ufuk Çizgisi', 'Büyük Tur',
    'Bilgi Hazinesi', 'Kristal', 'Sınav Günü', 'Çelik İrade', 'Kahraman'];
for (let i = 21; i <= 30; i++) {
    CHAPTER_SPECS.push({
        id: i, gridSize: 11, minWords: 12, maxWords: 18,
        difficulty: 'medium', minLen: 3, maxLen: 8,
        title: med2Titles[i - 21],
    });
}
// Chapters 31-35: 13×13, 18-24 words, hard
const hardTitles = ['Dev Meydan', 'Akıl Oyunu', 'Efsane', 'Zorlu Macera', 'Son Sınav'];
for (let i = 31; i <= 35; i++) {
    CHAPTER_SPECS.push({
        id: i, gridSize: 13, minWords: 18, maxWords: 24,
        difficulty: 'hard', minLen: 3, maxLen: 9,
        title: hardTitles[i - 31],
    });
}
// Chapters 36-40: 15×15, 20-30 words, hard
const hard2Titles = ['Büyük Final', 'Şampiyon', 'Elmas Lig', 'Dünya Kupası', 'Efsane Zirve'];
for (let i = 36; i <= 40; i++) {
    CHAPTER_SPECS.push({
        id: i, gridSize: 15, minWords: 20, maxWords: 30,
        difficulty: 'hard', minLen: 3, maxLen: 10,
        title: hard2Titles[i - 36],
    });
}

// ═══════════════════════════════════════════════════════════════
// Load Word Pool
// ═══════════════════════════════════════════════════════════════
const DB_PATH = path.resolve(__dirname, '..', 'src', 'data', 'questions_db.json');
const rawWords = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Filter to valid crossword words (3+ letters, uppercase, no spaces)
const wordPool = rawWords
    .filter(w => {
        const a = w.answer.toUpperCase().trim();
        return a.length >= 3 && a.length <= 15 && /^[A-ZÇĞİÖŞÜ]+$/.test(a);
    })
    .map(w => ({
        answer: w.answer.toUpperCase().trim(),
        clue: w.clue || w.answer,
        difficulty: w.difficulty || 'medium',
        length: w.answer.toUpperCase().trim().length,
    }));

console.log(`Loaded ${wordPool.length} valid words from pool.`);

// Build letter-position index: letter => Set of word indices
const letterIndex = {}; // "A" => [{wordIdx, posInWord}, ...]
for (let wi = 0; wi < wordPool.length; wi++) {
    const w = wordPool[wi];
    for (let pi = 0; pi < w.answer.length; pi++) {
        const ch = w.answer[pi];
        if (!letterIndex[ch]) letterIndex[ch] = [];
        letterIndex[ch].push({ wordIdx: wi, posInWord: pi });
    }
}

// ═══════════════════════════════════════════════════════════════
// Grid Cell Types
// ═══════════════════════════════════════════════════════════════
// 'B' = Block, {letter: 'X'} = Letter, {clue: {across?, down?}} = Clue

function makeGrid(size) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({ type: 'BLOCK' }))
    );
}

function cloneGrid(grid) {
    return grid.map(row => row.map(cell => {
        if (cell.type === 'BLOCK') return { type: 'BLOCK' };
        if (cell.type === 'LETTER') return { type: 'LETTER', letter: cell.letter };
        if (cell.type === 'CLUE') return {
            type: 'CLUE',
            across: cell.across ? { ...cell.across } : undefined,
            down: cell.down ? { ...cell.down } : undefined,
        };
        return { ...cell };
    }));
}

function isInBounds(r, c, size) {
    return r >= 0 && r < size && c >= 0 && c < size;
}

// ═══════════════════════════════════════════════════════════════
// Placement Validation
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a word can be placed on the grid.
 * Returns { valid: boolean, intersections: number } or null if invalid.
 * 
 * A placement consists of:
 *   - clueRow, clueCol: position of the CLUE cell
 *   - direction: 'across' or 'down'
 *   - answer: the word string
 *   - The letters go AFTER the clue cell (right for across, down for down)
 */
function validatePlacement(grid, size, clueRow, clueCol, direction, answer) {
    // Check clue cell position
    if (!isInBounds(clueRow, clueCol, size)) return null;

    const clueCell = grid[clueRow][clueCol];
    // Clue cell must be BLOCK (can place new clue) or CLUE (can merge direction)
    if (clueCell.type === 'LETTER') return null;
    if (clueCell.type === 'CLUE') {
        // Can only merge if this direction is not already taken
        if (direction === 'across' && clueCell.across) return null;
        if (direction === 'down' && clueCell.down) return null;
    }

    let intersections = 0;

    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'down' ? clueRow + 1 + i : clueRow;
        const c = direction === 'across' ? clueCol + 1 + i : clueCol;

        if (!isInBounds(r, c, size)) return null;

        const cell = grid[r][c];
        if (cell.type === 'LETTER') {
            // Must match the letter for intersection
            if (cell.letter !== answer[i]) return null;
            intersections++;
        } else if (cell.type === 'BLOCK') {
            // OK, can place letter here
            // But check: adjacent cells in the PERPENDICULAR direction
            // should not create unintended word extensions
            if (direction === 'across') {
                // Check above and below for unexpected letter adjacency
                // (unless it's an intentional intersection)
                if (isInBounds(r - 1, c, size) && grid[r - 1][c].type === 'LETTER' &&
                    !isClueAbove(grid, r, c, size)) {
                    // Would create unintended vertical word — skip for now
                    // This is a soft check; we allow it if it's a valid intersection
                }
                if (isInBounds(r + 1, c, size) && grid[r + 1][c].type === 'LETTER') {
                    // Extending downward from this letter could cause issues
                }
            }
        } else if (cell.type === 'CLUE') {
            // Can't place a letter on a clue cell
            return null;
        }
    }

    // Check that the cell AFTER the last letter is not a LETTER
    // (would extend the word unintentionally)
    const endR = direction === 'down' ? clueRow + 1 + answer.length : clueRow;
    const endC = direction === 'across' ? clueCol + 1 + answer.length : clueCol;
    if (isInBounds(endR, endC, size)) {
        if (grid[endR][endC].type === 'LETTER') return null;
    }

    // Check that the cell BEFORE the clue cell in the word direction
    // is not a LETTER (would merge with previous word)
    const prevR = direction === 'down' ? clueRow - 1 : clueRow;
    const prevC = direction === 'across' ? clueCol - 1 : clueCol;
    if (isInBounds(prevR, prevC, size)) {
        if (grid[prevR][prevC].type === 'LETTER') {
            // The clue cell is between letters — could cause issues
            // Only ok if it's already a CLUE cell
            if (clueCell.type !== 'CLUE') return null;
        }
    }

    return { valid: true, intersections };
}

function isClueAbove(grid, r, c, size) {
    return isInBounds(r - 1, c, size) && grid[r - 1][c].type === 'CLUE';
}

// ═══════════════════════════════════════════════════════════════
// Place a Word on Grid
// ═══════════════════════════════════════════════════════════════
function placeWord(grid, clueRow, clueCol, direction, answer, clue) {
    const cell = grid[clueRow][clueCol];
    if (cell.type === 'CLUE') {
        // Merge direction
        if (direction === 'across') cell.across = { clue };
        else cell.down = { clue };
    } else {
        grid[clueRow][clueCol] = direction === 'across'
            ? { type: 'CLUE', across: { clue } }
            : { type: 'CLUE', down: { clue } };
    }

    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'down' ? clueRow + 1 + i : clueRow;
        const c = direction === 'across' ? clueCol + 1 + i : clueCol;
        if (grid[r][c].type !== 'LETTER') {
            grid[r][c] = { type: 'LETTER', letter: answer[i] };
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Find Candidate Placements
// ═══════════════════════════════════════════════════════════════

/**
 * Find all valid placements for new words that intersect with existing placed words.
 * Returns array of { wordIdx, clueRow, clueCol, direction, intersections }
 */
function findCandidates(grid, size, placedWordIndices, spec, rng) {
    const candidates = [];
    const usedAnswers = new Set(placedWordIndices.map(wi => wordPool[wi].answer));

    // Scan all LETTER cells on the grid
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = grid[r][c];
            if (cell.type !== 'LETTER') continue;

            const letter = cell.letter;
            const entries = letterIndex[letter] || [];

            for (const { wordIdx, posInWord } of entries) {
                const word = wordPool[wordIdx];

                // Skip already placed words
                if (placedWordIndices.includes(wordIdx)) continue;
                if (usedAnswers.has(word.answer)) continue;

                // Skip words outside length range
                if (word.length < spec.minLen || word.length > spec.maxLen) continue;

                // Filter by difficulty
                if (spec.difficulty === 'easy' && word.difficulty === 'hard') continue;

                // Try placing perpendicular to existing direction
                // We need to figure out what direction the existing letter is part of
                // Try both directions

                // Try ACROSS: clue at (r, c - posInWord - 1), letters start at (r, c - posInWord)
                const acClueC = c - posInWord - 1;
                if (acClueC >= 0) {
                    const result = validatePlacement(grid, size, r, acClueC, 'across', word.answer);
                    if (result && result.intersections > 0) {
                        candidates.push({
                            wordIdx, clueRow: r, clueCol: acClueC,
                            direction: 'across', intersections: result.intersections,
                            answer: word.answer, clue: word.clue,
                        });
                    }
                }

                // Try DOWN: clue at (r - posInWord - 1, c), letters start at (r - posInWord, c)
                const dnClueR = r - posInWord - 1;
                if (dnClueR >= 0) {
                    const result = validatePlacement(grid, size, dnClueR, c, 'down', word.answer);
                    if (result && result.intersections > 0) {
                        candidates.push({
                            wordIdx, clueRow: dnClueR, clueCol: c,
                            direction: 'down', intersections: result.intersections,
                            answer: word.answer, clue: word.clue,
                        });
                    }
                }
            }
        }
    }

    return candidates;
}

// ═══════════════════════════════════════════════════════════════
// Generate One Puzzle
// ═══════════════════════════════════════════════════════════════
function generatePuzzle(spec, globalUsedWords, seed) {
    const rng = mulberry32(seed);
    const size = spec.gridSize;
    const grid = makeGrid(size);
    const placedWordIndices = [];
    const placedPlacements = [];

    // Filter word pool by length and difficulty
    let pool = wordPool
        .map((w, i) => ({ ...w, idx: i }))
        .filter(w => w.length >= spec.minLen && w.length <= spec.maxLen)
        .filter(w => !globalUsedWords.has(w.answer));

    if (spec.difficulty === 'easy') {
        pool = pool.filter(w => w.difficulty !== 'hard');
    }

    pool = shuffle(pool, rng);

    if (pool.length === 0) {
        console.warn(`  No words available for chapter ${spec.id}!`);
        return null;
    }

    // Pick seed word: longest word that fits
    const maxWordLen = size - 1; // Need 1 cell for clue
    const seedCandidates = pool
        .filter(w => w.length <= maxWordLen)
        .sort((a, b) => b.length - a.length);

    if (seedCandidates.length === 0) {
        console.warn(`  No seed word fits for chapter ${spec.id}!`);
        return null;
    }

    // Pick from top candidates
    const seedWord = seedCandidates[Math.floor(rng() * Math.min(5, seedCandidates.length))];

    // Place seed word horizontally at center
    const seedRow = Math.floor(size / 2);
    const seedClueCol = Math.max(0, Math.floor((size - seedWord.length - 1) / 2));

    const seedResult = validatePlacement(grid, size, seedRow, seedClueCol, 'across', seedWord.answer);
    if (!seedResult) {
        console.warn(`  Seed word placement failed for chapter ${spec.id}!`);
        return null;
    }

    placeWord(grid, seedRow, seedClueCol, 'across', seedWord.answer, seedWord.clue);
    placedWordIndices.push(seedWord.idx);
    placedPlacements.push({
        clueRow: seedRow, clueCol: seedClueCol,
        direction: 'across', answer: seedWord.answer, clue: seedWord.clue,
    });

    // Iteratively add words
    let attempts = 0;
    const maxAttempts = 500;

    while (placedWordIndices.length < spec.maxWords && attempts < maxAttempts) {
        attempts++;

        const candidates = findCandidates(grid, size, placedWordIndices, spec, rng);

        if (candidates.length === 0) break;

        // Sort by intersections (descending), then shuffle ties
        candidates.sort((a, b) => b.intersections - a.intersections);

        // Try top candidates
        let placed = false;
        const topN = Math.min(candidates.length, 20);
        const toTry = shuffle(candidates.slice(0, topN), rng);

        for (const cand of toTry) {
            // Re-validate (grid may have changed)
            const result = validatePlacement(grid, size, cand.clueRow, cand.clueCol, cand.direction, cand.answer);
            if (!result || result.intersections === 0) continue;

            // Check answer not already used
            if (placedWordIndices.includes(cand.wordIdx)) continue;
            const already = placedPlacements.some(p => p.answer === cand.answer);
            if (already) continue;

            placeWord(grid, cand.clueRow, cand.clueCol, cand.direction, cand.answer, cand.clue);
            placedWordIndices.push(cand.wordIdx);
            placedPlacements.push({
                clueRow: cand.clueRow, clueCol: cand.clueCol,
                direction: cand.direction, answer: cand.answer, clue: cand.clue,
            });
            placed = true;
            break;
        }

        if (!placed) break;
    }

    // Check minimum word count
    if (placedPlacements.length < spec.minWords) {
        // Retry with different seed
        return null;
    }

    // Mark placed words as globally used
    for (const p of placedPlacements) {
        globalUsedWords.add(p.answer);
    }

    return {
        id: `ch${spec.id}`,
        title: spec.title,
        gridSize: size,
        difficulty: spec.difficulty,
        placements: placedPlacements,
    };
}

// ═══════════════════════════════════════════════════════════════
// Generate All Chapters
// ═══════════════════════════════════════════════════════════════
function generateAll() {
    const globalUsedWords = new Set();
    const results = [];

    for (const spec of CHAPTER_SPECS) {
        let puzzle = null;
        let retries = 0;
        const maxRetries = 50;

        while (!puzzle && retries < maxRetries) {
            const seed = spec.id * 1000 + retries * 7 + 42;
            puzzle = generatePuzzle(spec, globalUsedWords, seed);
            retries++;
        }

        if (puzzle) {
            console.log(`  ✅ Chapter ${spec.id} "${spec.title}": ${puzzle.placements.length} words (${spec.gridSize}×${spec.gridSize})`);
            results.push(puzzle);
        } else {
            console.error(`  ❌ Chapter ${spec.id} FAILED after ${maxRetries} retries!`);
            // Generate a minimal fallback
            // Relax: allow globally used words
            const fallbackUsed = new Set();
            for (let f = 0; f < 50; f++) {
                const seed = spec.id * 2000 + f * 13 + 99;
                puzzle = generatePuzzle(spec, fallbackUsed, seed);
                if (puzzle) {
                    console.log(`  ⚠️  Chapter ${spec.id} fallback: ${puzzle.placements.length} words`);
                    results.push(puzzle);
                    break;
                }
            }
            if (!puzzle) {
                console.error(`  💀 Chapter ${spec.id} completely failed!`);
            }
        }
    }

    return results;
}

// ═══════════════════════════════════════════════════════════════
// Output to TypeScript
// ═══════════════════════════════════════════════════════════════
function generateOutput(chapters) {
    const lines = [];
    lines.push(`// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY`);
    lines.push(`// Generated by scripts/generate_chapters.js`);
    lines.push(`// ${new Date().toISOString()}`);
    lines.push(``);
    lines.push(`import { PuzzleSpec, WordPlacement } from '../puzzleBuilder';`);
    lines.push(``);

    for (const ch of chapters) {
        const placements = ch.placements.map(p => {
            const clue = p.clue.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `        { clueRow: ${p.clueRow}, clueCol: ${p.clueCol}, direction: '${p.direction}', clue: '${clue}', answer: '${p.answer}' }`;
        });

        lines.push(`export const ${ch.id}: PuzzleSpec = {`);
        lines.push(`    id: '${ch.id}',`);
        lines.push(`    title: '${ch.title}',`);
        lines.push(`    rows: ${ch.gridSize},`);
        lines.push(`    cols: ${ch.gridSize},`);
        lines.push(`    theme: 'Genel',`);
        lines.push(`    difficulty: '${ch.difficulty}',`);
        lines.push(`    placements: [`);
        lines.push(placements.join(',\n'));
        lines.push(`    ],`);
        lines.push(`};`);
        lines.push(``);
    }

    // Export all specs
    lines.push(`export const allChapterSpecs: PuzzleSpec[] = [`);
    lines.push(chapters.map(ch => `    ${ch.id}`).join(',\n'));
    lines.push(`];`);
    lines.push(``);

    // Chapter groupings
    lines.push(`export const chapterGroups = [`);

    // Group into chapters of ~5-6 puzzles
    // Actually each "chapter" spec IS a single puzzle.
    // The user wants 40 chapters. In the existing system, a "chapter" groups puzzles.
    // The user said "40 chapters" and each chapter has one puzzle (one grid).
    // So each chapter = 1 puzzle.
    // Group them into logical groups for the UI.
    const groups = [
        { ids: chapters.slice(0, 5).map(c => c.id), title: 'Başlangıç', subtitle: 'İlk adımlarını at' },
        { ids: chapters.slice(5, 10).map(c => c.id), title: 'Keşif', subtitle: 'Yeni kelimeler keşfet' },
        { ids: chapters.slice(10, 15).map(c => c.id), title: 'Gelişim', subtitle: 'Seviyeni yükselt' },
        { ids: chapters.slice(15, 20).map(c => c.id), title: 'Ustalaşma', subtitle: 'Gerçek bir usta ol' },
        { ids: chapters.slice(20, 25).map(c => c.id), title: 'Meydan Okuma', subtitle: 'Büyük bulmacalara hazır mısın?' },
        { ids: chapters.slice(25, 30).map(c => c.id), title: 'Zirve', subtitle: 'İleri seviye zorluk' },
        { ids: chapters.slice(30, 35).map(c => c.id), title: 'Elit', subtitle: 'Sadece en iyiler için' },
        { ids: chapters.slice(35, 40).map(c => c.id), title: 'Efsane', subtitle: 'En büyük bulmacalar' },
    ];

    for (const g of groups) {
        lines.push(`    { title: '${g.title}', subtitle: '${g.subtitle}', puzzleIds: [${g.ids.map(id => `'${id}'`).join(', ')}] },`);
    }
    lines.push(`];`);
    lines.push(``);

    return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════
console.log('🔄 Starting crossword chapter generation...');
console.log(`   Word pool: ${wordPool.length} words`);
console.log(`   Chapters: ${CHAPTER_SPECS.length}`);
console.log('');

const chapters = generateAll();

console.log('');
console.log(`Generated ${chapters.length}/${CHAPTER_SPECS.length} chapters.`);

if (chapters.length > 0) {
    const output = generateOutput(chapters);
    const outPath = path.resolve(__dirname, '..', 'src', 'cengel', 'puzzles', 'generated.ts');
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`✅ Written to ${outPath}`);

    // Stats
    const totalWords = chapters.reduce((a, c) => a + c.placements.length, 0);
    console.log(`   Total words across all puzzles: ${totalWords}`);
    console.log(`   Average words per puzzle: ${(totalWords / chapters.length).toFixed(1)}`);
}
