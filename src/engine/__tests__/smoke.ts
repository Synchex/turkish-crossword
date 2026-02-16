/**
 * Smoke test for the crossword generation engine.
 * Run with: npx ts-node src/engine/__tests__/smoke.ts
 * Or: npx tsx src/engine/__tests__/smoke.ts
 */

// @ts-nocheck — relaxed for test runner compatibility

import questionsData from '../../data/questions_db.json';
import { initializeEngine, generatePuzzle, toLevelData, getAllTemplates, extractSlots, buildWordIndex } from '../index';

function assert(condition: boolean, msg: string): void {
    if (!condition) {
        console.error(`❌ FAIL: ${msg}`);
        process.exit(1);
    }
    console.log(`✅ PASS: ${msg}`);
}

function runTests() {
    console.log('\n══════════════════════════════════════');
    console.log('  Crossword Engine Smoke Tests');
    console.log('══════════════════════════════════════\n');

    // ── Test 1: Word index builds correctly ──
    const wordIndex = buildWordIndex(questionsData as any[]);
    assert(wordIndex.all.length > 0, `Word index has ${wordIndex.all.length} entries`);
    assert(wordIndex.byLength.size > 0, `Words indexed by ${wordIndex.byLength.size} different lengths`);

    // Print distribution
    console.log('\n  Word length distribution:');
    for (const [len, words] of [...wordIndex.byLength.entries()].sort((a, b) => a[0] - b[0])) {
        console.log(`    Length ${len}: ${words.length} words`);
    }

    // ── Test 2: Templates parse correctly ──
    const templates = getAllTemplates();
    assert(templates.length > 0, `Loaded ${templates.length} templates`);

    for (const t of templates) {
        assert(
            t.cells.length === t.size,
            `Template ${t.id} has correct row count (${t.cells.length})`
        );
        for (let r = 0; r < t.cells.length; r++) {
            assert(
                t.cells[r].length === t.size,
                `Template ${t.id} row ${r} has correct column count (${t.cells[r].length})`
            );
        }
    }

    // ── Test 3: Slot extraction produces valid slots ──
    for (const t of templates) {
        const slots = extractSlots(t);
        assert(
            slots.length > 0,
            `Template ${t.id} (${t.size}×${t.size}) → ${slots.length} slots`
        );

        // Verify all slots have length ≥ 2
        for (const s of slots) {
            assert(s.length >= 2, `Slot ${s.id} in ${t.id} has length ${s.length} ≥ 2`);
            assert(s.cells.length === s.length, `Slot ${s.id} cell count matches length`);
        }

        // Verify intersections are symmetric
        for (const s of slots) {
            for (const ix of s.intersections) {
                const other = slots[ix.otherSlotId];
                const reverse = other.intersections.find(x => x.otherSlotId === s.id);
                assert(
                    reverse !== undefined,
                    `Intersection ${s.id}↔${ix.otherSlotId} is symmetric`
                );
            }
        }
    }

    // ── Test 4: Engine initialization ──
    initializeEngine(questionsData as any[]);
    console.log('\n✅ Engine initialized successfully\n');

    // ── Test 5: Puzzle generation (Easy) ──
    console.log('  Generating Easy puzzle (level 1, seed 42)...');
    const start1 = Date.now();
    const puzzle1 = generatePuzzle({ level: 1, seed: 42 });
    const time1 = Date.now() - start1;

    if (puzzle1) {
        assert(puzzle1.words.length > 0, `Easy puzzle has ${puzzle1.words.length} words`);
        assert(puzzle1.gridSize >= 7, `Grid size is ${puzzle1.gridSize}`);
        console.log(`  ⏱  Generated in ${time1}ms`);
        console.log(`  📊 Difficulty score: ${puzzle1.difficultyScore}`);
        console.log(`  📐 Grid: ${puzzle1.gridSize}×${puzzle1.gridSize}`);
        console.log(`  🔤 Words: ${puzzle1.words.map(w => w.answer).join(', ')}`);

        // Verify letter consistency at intersections
        const grid: Map<string, string> = new Map();
        let intersectionConflicts = 0;
        for (const word of puzzle1.words) {
            for (let i = 0; i < word.answer.length; i++) {
                const r = word.direction === 'across' ? word.startRow : word.startRow + i;
                const c = word.direction === 'across' ? word.startCol + i : word.startCol;
                const key = `${r},${c}`;
                const existing = grid.get(key);
                if (existing && existing !== word.answer[i]) {
                    intersectionConflicts++;
                    console.error(`  ⚠️ Conflict at (${r},${c}): ${existing} vs ${word.answer[i]}`);
                }
                grid.set(key, word.answer[i]);
            }
        }
        assert(intersectionConflicts === 0, 'No intersection conflicts in Easy puzzle');

        // Test conversion to LevelData
        const levelData = toLevelData(puzzle1);
        assert(levelData.id === 1, 'LevelData has correct ID');
        assert(levelData.words.length === puzzle1.words.length, 'LevelData word count matches');
    } else {
        console.log('  ⚠️ Easy puzzle generation returned null — check word bank coverage');
    }

    // ── Test 6: Deterministic (same seed = same puzzle) ──
    const puzzleA = generatePuzzle({ level: 3, seed: 12345 });
    const puzzleB = generatePuzzle({ level: 3, seed: 12345 });
    if (puzzleA && puzzleB) {
        const wordsA = puzzleA.words.map(w => w.answer).join(',');
        const wordsB = puzzleB.words.map(w => w.answer).join(',');
        assert(wordsA === wordsB, 'Same seed produces identical puzzle');
    }

    // ── Test 7: Different seeds = different puzzles ──
    const puzzleC = generatePuzzle({ level: 3, seed: 11111 });
    const puzzleD = generatePuzzle({ level: 3, seed: 99999 });
    if (puzzleC && puzzleD) {
        const wordsC = puzzleC.words.map(w => w.answer).join(',');
        const wordsD = puzzleD.words.map(w => w.answer).join(',');
        assert(wordsC !== wordsD, 'Different seeds produce different puzzles');
    }

    // ── Test 8: Multiple difficulty levels ──
    for (const lvl of [1, 5, 10, 15]) {
        const start = Date.now();
        const p = generatePuzzle({ level: lvl, seed: 7777 + lvl });
        const elapsed = Date.now() - start;
        if (p) {
            console.log(
                `  Level ${lvl}: ${p.words.length} words, score=${p.difficultyScore}, ${p.gridSize}×${p.gridSize}, ${elapsed}ms`
            );
            assert(elapsed < 3000, `Level ${lvl} generated in under 3s (${elapsed}ms)`);
        } else {
            console.log(`  Level ${lvl}: null (word bank may lack coverage for this difficulty)`);
        }
    }

    console.log('\n══════════════════════════════════════');
    console.log('  All smoke tests completed!');
    console.log('══════════════════════════════════════\n');
}

runTests();
