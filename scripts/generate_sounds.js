/**
 * generate_sounds.js — Synthesize premium, calm puzzle-style audio
 *
 * Generates WAV files with sine-wave synthesis:
 *   • key_press:       Soft muted tap (very short)
 *   • button_tap:      Subtle click
 *   • correct_word:    Gentle ascending two-note chime
 *   • wrong_word:      Soft low muted hum
 *   • puzzle_complete: Elegant ascending arpeggio (4 notes)
 *   • bg_music:        Calm ambient pad loop (~25s)
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

    // RIFF header
    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
    buffer.write('WAVE', offset); offset += 4;

    // fmt chunk
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4;
    buffer.writeUInt16LE(1, offset); offset += 2; // PCM
    buffer.writeUInt16LE(numChannels, offset); offset += 2;
    buffer.writeUInt32LE(sampleRate, offset); offset += 4;
    buffer.writeUInt32LE(byteRate, offset); offset += 4;
    buffer.writeUInt16LE(blockAlign, offset); offset += 2;
    buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

    // data chunk
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;

    for (let i = 0; i < numSamples; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(Math.round(s * 32767), offset);
        offset += 2;
    }

    fs.writeFileSync(filePath, buffer);
    console.log(`✓ ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(1)} KB, ${(numSamples / sampleRate).toFixed(2)}s)`);
}

// ── Audio helpers ──

function sine(freq, t) {
    return Math.sin(2 * Math.PI * freq * t);
}

// Soft envelope with attack/decay
function envelope(t, duration, attack = 0.01, decay = 0.1) {
    if (t < attack) return t / attack;
    if (t > duration - decay) return Math.max(0, (duration - t) / decay);
    return 1;
}

// Soft fade envelope for ambient pads
function padEnvelope(t, duration, fadeIn = 2, fadeOut = 3) {
    if (t < fadeIn) return t / fadeIn;
    if (t > duration - fadeOut) return Math.max(0, (duration - t) / fadeOut);
    return 1;
}

function generateSamples(duration, fn) {
    const numSamples = Math.floor(SAMPLE_RATE * duration);
    const samples = new Float64Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        samples[i] = fn(t, duration);
    }
    return samples;
}

// ── Sound generators ──

function genKeyPress() {
    // Very short, soft muted click — like touching glass
    const duration = 0.06;
    return generateSamples(duration, (t, d) => {
        const env = envelope(t, d, 0.002, 0.04);
        // High-frequency soft tap with quick decay
        const tap = sine(3200, t) * 0.15 + sine(4800, t) * 0.08;
        return tap * env * Math.exp(-t * 80);
    });
}

function genButtonTap() {
    // Subtle wooden tap — slightly deeper than key press
    const duration = 0.08;
    return generateSamples(duration, (t, d) => {
        const env = envelope(t, d, 0.002, 0.05);
        const tap = sine(1800, t) * 0.12 + sine(2400, t) * 0.06;
        return tap * env * Math.exp(-t * 50);
    });
}

function genCorrectWord() {
    // Gentle two-note ascending chime: C5 → E5
    // Like wind chimes — soft, resonant
    const duration = 0.5;
    const note1 = 523.25; // C5
    const note2 = 659.25; // E5

    return generateSamples(duration, (t, d) => {
        let out = 0;

        // Note 1: starts at t=0, gentle bell
        if (t < 0.35) {
            const e = Math.exp(-t * 8) * 0.3;
            out += sine(note1, t) * e;
            out += sine(note1 * 2, t) * e * 0.15; // harmonic
        }

        // Note 2: starts at t=0.12, gentle bell
        if (t > 0.12) {
            const t2 = t - 0.12;
            const e = Math.exp(-t2 * 6) * 0.35;
            out += sine(note2, t) * e;
            out += sine(note2 * 2, t) * e * 0.12;
        }

        return out;
    });
}

function genWrongWord() {
    // Soft, low muted tone — not harsh, just a gentle "hmm"
    const duration = 0.3;
    const freq = 220; // A3

    return generateSamples(duration, (t, d) => {
        const env = envelope(t, d, 0.02, 0.15);
        // Muted low tone with slight detuning for warmth
        const out = sine(freq, t) * 0.2 + sine(freq * 0.998, t) * 0.15;
        return out * env * Math.exp(-t * 5);
    });
}

function genPuzzleComplete() {
    // Elegant ascending arpeggio: C5 → E5 → G5 → C6
    // Like a music box — delicate and rewarding
    const duration = 1.4;
    const notes = [
        { freq: 523.25, start: 0.0 },   // C5
        { freq: 659.25, start: 0.18 },   // E5
        { freq: 783.99, start: 0.36 },   // G5
        { freq: 1046.50, start: 0.54 },  // C6
    ];

    return generateSamples(duration, (t, d) => {
        let out = 0;

        for (const note of notes) {
            if (t >= note.start) {
                const tn = t - note.start;
                const decay = Math.exp(-tn * 3);
                // Bell-like tone with soft harmonics
                out += sine(note.freq, t) * decay * 0.22;
                out += sine(note.freq * 2, t) * decay * 0.06;
                out += sine(note.freq * 3, t) * decay * 0.02;
            }
        }

        // Gentle tail fade
        if (t > d - 0.4) {
            out *= (d - t) / 0.4;
        }

        return out;
    });
}

function genBgMusic() {
    // Calm ambient pad — evolving warm chords
    // ~25 seconds, designed to loop seamlessly
    const duration = 25;

    // Chord tones (Cmaj7 → Am7 → Fmaj7 → G7sus4 cycle)
    const chords = [
        { notes: [130.81, 164.81, 196.00, 246.94], start: 0, end: 6.25 },     // C E G B
        { notes: [110.00, 130.81, 164.81, 196.00], start: 6.25, end: 12.5 },  // A C E G
        { notes: [174.61, 220.00, 261.63, 329.63], start: 12.5, end: 18.75 }, // F A C E
        { notes: [196.00, 261.63, 293.66, 349.23], start: 18.75, end: 25 },   // G C D F
    ];

    return generateSamples(duration, (t, d) => {
        let out = 0;

        for (const chord of chords) {
            if (t >= chord.start && t < chord.end) {
                const chordDur = chord.end - chord.start;
                const tc = t - chord.start;
                // Smooth crossfade between chords
                const crossfade = 0.8;
                let env = 1;
                if (tc < crossfade) env = tc / crossfade;
                if (tc > chordDur - crossfade) env = Math.max(0, (chordDur - tc) / crossfade);

                for (const freq of chord.notes) {
                    // Soft pad with slow vibrato
                    const vibrato = 1 + Math.sin(2 * Math.PI * 0.3 * t) * 0.002;
                    out += sine(freq * vibrato, t) * 0.04 * env;
                    // Add gentle detuned layer for warmth
                    out += sine(freq * 1.003 * vibrato, t) * 0.025 * env;
                }
            }
        }

        // Loop crossfade: fade out last 1s, fade in first 1s
        const loopFade = 1.5;
        if (t < loopFade) out *= t / loopFade;
        if (t > d - loopFade) out *= (d - t) / loopFade;

        // Very low overall volume — ambient background
        return out * 0.7;
    });
}

// ── Main ──

fs.mkdirSync(OUT_DIR, { recursive: true });

writeWav(path.join(OUT_DIR, 'key_press.wav'), genKeyPress());
writeWav(path.join(OUT_DIR, 'button_tap.wav'), genButtonTap());
writeWav(path.join(OUT_DIR, 'correct_word.wav'), genCorrectWord());
writeWav(path.join(OUT_DIR, 'wrong_word.wav'), genWrongWord());
writeWav(path.join(OUT_DIR, 'puzzle_complete.wav'), genPuzzleComplete());
writeWav(path.join(OUT_DIR, 'bg_music.wav'), genBgMusic());

console.log('\n✅ All sounds generated!');
