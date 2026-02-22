/**
 * AudioManager — Centralized audio service for background music & SFX.
 *
 * Uses expo-av. Preloads all sounds once, keeps references in memory,
 * and provides play/stop helpers. Respects useSettingsStore toggles.
 */

import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { useSettingsStore } from '../store/useSettingsStore';

// ──────────────────────────────────
//  Sound Effect Definitions
// ──────────────────────────────────
export type SfxName =
    | 'keyPress'
    | 'correctWord'
    | 'wrongWord'
    | 'buttonTap'
    | 'puzzleComplete';

// Map SFX name → require path
// NOTE: Replace these with actual audio files when available.
// For now we use placeholder paths — the manager will silently skip
// if a file cannot be loaded.
const SFX_SOURCES: Record<SfxName, any> = {
    keyPress: require('../../assets/sounds/key_press.mp3'),
    correctWord: require('../../assets/sounds/correct_word.mp3'),
    wrongWord: require('../../assets/sounds/wrong_word.mp3'),
    buttonTap: require('../../assets/sounds/button_tap.mp3'),
    puzzleComplete: require('../../assets/sounds/puzzle_complete.mp3'),
};

const MUSIC_SOURCE = require('../../assets/sounds/bg_music.mp3');

// ──────────────────────────────────
//  Singleton AudioManager
// ──────────────────────────────────
class AudioManager {
    private sfxSounds: Partial<Record<SfxName, Audio.Sound>> = {};
    private bgMusic: Audio.Sound | null = null;
    private isPreloaded = false;
    private isMusicPlaying = false;

    /** Call once on game screen mount */
    async preloadSounds(): Promise<void> {
        if (this.isPreloaded) return;

        try {
            // Configure audio mode for low-latency playback
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Preload SFX
            const sfxNames = Object.keys(SFX_SOURCES) as SfxName[];
            await Promise.all(
                sfxNames.map(async (name) => {
                    try {
                        const { sound } = await Audio.Sound.createAsync(
                            SFX_SOURCES[name],
                            { shouldPlay: false, volume: 0.6 },
                        );
                        this.sfxSounds[name] = sound;
                    } catch (e) {
                        console.warn(`[AudioManager] Failed to preload SFX "${name}":`, e);
                    }
                }),
            );

            // Preload background music
            try {
                const { sound } = await Audio.Sound.createAsync(
                    MUSIC_SOURCE,
                    { shouldPlay: false, isLooping: true, volume: 0.3 },
                );
                this.bgMusic = sound;
            } catch (e) {
                console.warn('[AudioManager] Failed to preload background music:', e);
            }

            this.isPreloaded = true;
        } catch (e) {
            console.warn('[AudioManager] preloadSounds error:', e);
        }
    }

    /** Unload all sounds — call on game screen unmount */
    async unloadSounds(): Promise<void> {
        // Stop music first
        await this.stopMusic();

        // Unload SFX
        const names = Object.keys(this.sfxSounds) as SfxName[];
        await Promise.all(
            names.map(async (name) => {
                try {
                    await this.sfxSounds[name]?.unloadAsync();
                } catch (_) { }
            }),
        );

        // Unload music
        try {
            await this.bgMusic?.unloadAsync();
        } catch (_) { }

        this.sfxSounds = {};
        this.bgMusic = null;
        this.isPreloaded = false;
        this.isMusicPlaying = false;
    }

    // ── Background Music ──

    async playMusic(): Promise<void> {
        const musicEnabled = useSettingsStore.getState().music;
        if (!musicEnabled || !this.bgMusic || this.isMusicPlaying) return;

        try {
            await this.bgMusic.setPositionAsync(0);
            await this.bgMusic.playAsync();
            this.isMusicPlaying = true;
        } catch (e) {
            console.warn('[AudioManager] playMusic error:', e);
        }
    }

    async stopMusic(): Promise<void> {
        if (!this.bgMusic || !this.isMusicPlaying) return;

        try {
            await this.bgMusic.stopAsync();
            this.isMusicPlaying = false;
        } catch (e) {
            console.warn('[AudioManager] stopMusic error:', e);
        }
    }

    async setMusicVolume(volume: number): Promise<void> {
        try {
            await this.bgMusic?.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        } catch (_) { }
    }

    /** Call when music setting changes at runtime */
    async onMusicSettingChanged(enabled: boolean): Promise<void> {
        if (enabled) {
            await this.playMusic();
        } else {
            await this.stopMusic();
        }
    }

    // ── Sound Effects ──

    async playSfx(name: SfxName): Promise<void> {
        const soundEnabled = useSettingsStore.getState().sound;
        if (!soundEnabled) return;

        const sound = this.sfxSounds[name];
        if (!sound) return;

        try {
            // Replay from the beginning (low latency)
            await sound.setPositionAsync(0);
            await sound.playAsync();
        } catch (e) {
            console.warn(`[AudioManager] playSfx "${name}" error:`, e);
        }
    }

    get musicPlaying(): boolean {
        return this.isMusicPlaying;
    }
}

// Export singleton
export const audioManager = new AudioManager();
