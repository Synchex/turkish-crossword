/**
 * generate_sounds.js — Synthesize premium, minimal puzzle SFX
 *
 * Design philosophy: NO sine beeps, NO arcade tones.
 * Use filtered noise bursts for clicks, shaped noise for thuds,
 * and very subtle harmonics for chimes.
 *
 * All sounds are extremely short and soft.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// ── WAV writer ──

function writeWav(filePath, samples, sampleRate = SAMPLE_RATE) {
    const numSamples = samples.length;
    const bitsPerSample = 16;
    const numChannels = 1;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = numSamples * (bitsPerSample / 8);
    const headerSize = 44;

    const buffer = Buffer.alloc(headerSize + dataSize);
    let offset = 0;

    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
    buffer.write('WAVE', offset); offset += 4;
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4;
    buffer.writeUInt16LE(1, offset); offset += 2;
    buffer.writeUInt16LE(numChannels, offset); offset += 2;
    buffer.writeUInt32LE(sampleRate, offset); offset += 4;
    buffer.writeUInt32LE(byteRate, offset); offset += 4;
    buffer.writeUInt16LE(blockAlign, offset); offset += 2;
    buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;

    for (let i = 0; i < numSamples; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(Math.round(s * 32767), offset);
        offset += 2;
    }

    fs.writeFileSync(filePath, buffer);
    const ms = (numSamples / sampleRate * 1000).toFixed(0);
    console.log(`  ✓ ${path.basename(filePath).padEnd(22)} ${ms}ms  ${(buffer.length / 1024).toFixed(1)} KB`);
}

function generateSamples(duration, fn) {
    const n = Math.floor(SAMPLE_RATE * duration);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        out[i] = fn(i / SAMPLE_RATE, duration);
    }
    return out;
}

// ── Noise source (seeded for consistency) ──
let noiseSeed = 42;
function noise() {
    noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff;
    return (noiseSeed / 0x7fffffff) * 2 - 1;
}

// Simple one-pole lowpass
function lpFilter(samples, cutoff) {
    const rc = 1 / (2 * Math.PI * cutoff);
    const dt = 1 / SAMPLE_RATE;
    const alpha = dt / (rc + dt);
    const out = new Float64Array(samples.length);
    out[0] = samples[0] * alpha;
    for (let i = 1; i < samples.length; i++) {
        out[i] = out[i - 1] + alpha * (samples[i] - out[i - 1]);
    }
    return out;
}

// ── Sound generators ──

function genKeyPress() {
    // Ultra-short filtered noise burst — like tapping a wooden surface
    // Duration: ~55ms
    const duration = 0.055;
    const raw = generateSamples(duration, (t, d) => {
        // Sharp attack, very fast exponential decay
        const env = Math.exp(-t * 120) * 0.5;
        return noise() * env;
    });
    // Lowpass to remove harshness → soft click
    return lpFilter(raw, 3500);
}

function genButtonTap() {
    // Slightly deeper, slightly longer click — like pressing a soft rubber button
    // Duration: ~80ms
    const duration = 0.08;
    const raw = generateSamples(duration, (t, d) => {
        const env = Math.exp(-t * 70) * 0.5;
        return noise() * env;
    });
    return lpFilter(raw, 2200);
}

function genCorrectWord() {
    // Soft, short "ding" — two very quiet overlapping harmonics
    // NOT a celebratory chime. More like a gentle notification.
    // Duration: ~200ms
    const duration = 0.2;
    return generateSamples(duration, (t, d) => {
        const env = Math.exp(-t * 18) * 0.35;
        // Soft bell: fundamental + quiet overtone, both decaying fast
        const f1 = Math.sin(2 * Math.PI * 880 * t);   // A5
        const f2 = Math.sin(2 * Math.PI * 1320 * t);  // E6 (soft fifth)
        return (f1 * 0.7 + f2 * 0.3) * env;
    });
}

function genWrongWord() {
    // Soft muted thud — NO buzzer, just a gentle low "bump"
    // Filtered noise with low cutoff
    // Duration: ~130ms
    const duration = 0.13;
    const raw = generateSamples(duration, (t, d) => {
        const env = Math.exp(-t * 35) * 0.4;
        return noise() * env;
    });
    return lpFilter(raw, 800);  // Very low cutoff → muted thud
}

function genPuzzleComplete() {
    // Elegant short sparkle — two quick ascending notes, NOT loud
    // Like a gentle music box playing two notes
    // Duration: ~350ms
    const duration = 0.35;
    return generateSamples(duration, (t, d) => {
        let out = 0;

        // Note 1: C6 (1046 Hz) — starts immediately
        if (t < 0.2) {
            const e1 = Math.exp(-t * 15) * 0.3;
            out += Math.sin(2 * Math.PI * 1046.5 * t) * e1;
        }

        // Note 2: E6 (1318 Hz) — starts at 100ms
        if (t > 0.1 && t < 0.35) {
            const t2 = t - 0.1;
            const e2 = Math.exp(-t2 * 12) * 0.3;
            out += Math.sin(2 * Math.PI * 1318.5 * t) * e2;
        }

        // Gentle final fade
        if (t > d - 0.08) {
            out *= (d - t) / 0.08;
        }

        return out;
    });
}

function genBgMusic() {
    // Keep the ambient pad for optional use, but make it even quieter
    const duration = 25;
    const chords = [
        { notes: [130.81, 164.81, 196.00, 246.94], start: 0, end: 6.25 },
        { notes: [110.00, 130.81, 164.81, 196.00], start: 6.25, end: 12.5 },
        { notes: [174.61, 220.00, 261.63, 329.63], start: 12.5, end: 18.75 },
        { notes: [196.00, 261.63, 293.66, 349.23], start: 18.75, end: 25 },
    ];

    return generateSamples(duration, (t, d) => {
        let out = 0;
        for (const chord of chords) {
            if (t >= chord.start && t < chord.end) {
                const cd = chord.end - chord.start;
                const tc = t - chord.start;
                const cf = 0.8;
                let env = 1;
                if (tc < cf) env = tc / cf;
                if (tc > cd - cf) env = Math.max(0, (cd - tc) / cf);
                for (const freq of chord.notes) {
                    const vib = 1 + Math.sin(2 * Math.PI * 0.3 * t) * 0.002;
                    out += Math.sin(2 * Math.PI * freq * vib * t) * 0.03 * env;
                    out += Math.sin(2 * Math.PI * freq * 1.003 * vib * t) * 0.018 * env;
                }
            }
        }
        const lf = 1.5;
        if (t < lf) out *= t / lf;
        if (t > d - lf) out *= (d - t) / lf;
        return out * 0.5;
    });
}

// ── Main ──

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('\n  Generating premium SFX...\n');
writeWav(path.join(OUT_DIR, 'key_press.wav'), genKeyPress());
writeWav(path.join(OUT_DIR, 'button_tap.wav'), genButtonTap());
writeWav(path.join(OUT_DIR, 'correct_word.wav'), genCorrectWord());
writeWav(path.join(OUT_DIR, 'wrong_word.wav'), genWrongWord());
writeWav(path.join(OUT_DIR, 'puzzle_complete.wav'), genPuzzleComplete());
writeWav(path.join(OUT_DIR, 'bg_music.wav'), genBgMusic());

console.log('\n  ✅ All sounds regenerated!\n');
