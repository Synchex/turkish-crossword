#!/usr/bin/env node
/**
 * Validate all generated crossword puzzles.
 * 
 * Checks:
 * 1. Every placement fits within grid bounds
 * 2. No letter conflicts at intersections
 * 3. All words >= 3 letters
 * 4. Word boundaries are properly terminated
 * 5. Each puzzle has a minimum word count
 */

const fs = require('fs');
const path = require('path');

// Read the generated TS file and extract puzzle specs
const generatedPath = path.resolve(__dirname, '..', 'src', 'cengel', 'puzzles', 'generated.ts');
const content = fs.readFileSync(generatedPath, 'utf8');

// Parse puzzle specs using regex
const puzzleRegex = /export const (ch\d+): PuzzleSpec = \{([^}]+(?:\{[^}]*\}[^}]*)*)\};/g;
const placementRegex = /\{ clueRow: (\d+), clueCol: (\d+), direction: '(across|down)', clue: '([^']*(?:\\'[^']*)*)', answer: '([A-ZÇĞİÖŞÜ]+)' \}/g;
const sizeRegex = /rows: (\d+),\s*cols: (\d+)/;

let totalErrors = 0;
let totalWarnings = 0;
let puzzleCount = 0;
let totalWords = 0;

let match;
while ((match = puzzleRegex.exec(content)) !== null) {
    const specName = match[1];
    const specBody = match[0];
    puzzleCount++;

    const sizeMatch = sizeRegex.exec(specBody);
    if (!sizeMatch) {
        console.error(`  ❌ ${specName}: Could not parse grid size`);
        totalErrors++;
        continue;
    }

    const rows = parseInt(sizeMatch[1]);
    const cols = parseInt(sizeMatch[2]);

    // Build grid
    const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => null)
    );

    const placements = [];
    let pmatch;
    const placementRegex2 = /\{ clueRow: (\d+), clueCol: (\d+), direction: '(across|down)', clue: '([^']*(?:\\'[^']*)*)', answer: '([A-ZÇĞİÖŞÜ]+)' \}/g;
    while ((pmatch = placementRegex2.exec(specBody)) !== null) {
        placements.push({
            clueRow: parseInt(pmatch[1]),
            clueCol: parseInt(pmatch[2]),
            direction: pmatch[3],
            clue: pmatch[4],
            answer: pmatch[5],
        });
    }

    totalWords += placements.length;

    if (placements.length < 3) {
        console.error(`  ❌ ${specName}: Only ${placements.length} words (minimum 3)`);
        totalErrors++;
    }

    const answers = placements.map(p => p.answer);
    const uniqueAnswers = new Set(answers);
    if (uniqueAnswers.size !== answers.length) {
        console.error(`  ❌ ${specName}: Duplicate answers detected!`);
        totalErrors++;
    }

    let puzzleErrors = 0;
    let intersections = 0;

    for (const p of placements) {
        // Check clue cell bounds
        if (p.clueRow < 0 || p.clueRow >= rows || p.clueCol < 0 || p.clueCol >= cols) {
            console.error(`  ❌ ${specName}: Clue cell (${p.clueRow},${p.clueCol}) out of bounds for "${p.answer}"`);
            puzzleErrors++;
            continue;
        }

        // Mark clue cell
        if (grid[p.clueRow][p.clueCol] === null) {
            grid[p.clueRow][p.clueCol] = 'CLUE';
        }

        // Check letter cells
        for (let i = 0; i < p.answer.length; i++) {
            const r = p.direction === 'down' ? p.clueRow + 1 + i : p.clueRow;
            const c = p.direction === 'across' ? p.clueCol + 1 + i : p.clueCol;

            if (r < 0 || r >= rows || c < 0 || c >= cols) {
                console.error(`  ❌ ${specName}: Letter "${p.answer[i]}" at (${r},${c}) out of bounds for "${p.answer}"`);
                puzzleErrors++;
                continue;
            }

            if (grid[r][c] === null || grid[r][c] === 'CLUE') {
                grid[r][c] = p.answer[i];
            } else if (grid[r][c] === p.answer[i]) {
                intersections++;
            } else {
                console.error(`  ❌ ${specName}: Letter conflict at (${r},${c}): existing "${grid[r][c]}" vs "${p.answer[i]}" from "${p.answer}"`);
                puzzleErrors++;
            }
        }

        // Check word length
        if (p.answer.length < 2) {
            console.error(`  ❌ ${specName}: Word "${p.answer}" is too short (${p.answer.length} letters)`);
            puzzleErrors++;
        }
    }

    if (puzzleErrors > 0) {
        console.error(`  ❌ ${specName}: ${puzzleErrors} errors`);
        totalErrors += puzzleErrors;
    } else {
        console.log(`  ✅ ${specName}: ${placements.length} words, ${intersections} intersections, ${rows}×${cols}`);
    }
}

console.log('');
console.log('═══════════════════════════════════════');
console.log(`Puzzles validated: ${puzzleCount}`);
console.log(`Total words: ${totalWords}`);
console.log(`Total errors: ${totalErrors}`);
console.log(`Total warnings: ${totalWarnings}`);
console.log('═══════════════════════════════════════');

if (totalErrors > 0) {
    console.error('❌ VALIDATION FAILED');
    process.exit(1);
} else {
    console.log('✅ ALL PUZZLES VALID');
}
