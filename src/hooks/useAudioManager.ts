/**
 * useAudioManager — React hook to manage AudioManager lifecycle.
 *
 * Preloads sounds on mount, starts music, stops/unloads on unmount.
 * Also watches music setting changes at runtime.
 */

import { useEffect, useRef, useCallback } from 'react';
import { audioManager, SfxName } from '../audio/AudioManager';
import { useSettingsStore } from '../store/useSettingsStore';

export function useAudioManager() {
    const musicEnabled = useSettingsStore((s) => s.music);
    const soundEnabled = useSettingsStore((s) => s.sound);
    const hasPreloaded = useRef(false);

    // Preload on mount, unload on unmount
    useEffect(() => {
        let mounted = true;

        (async () => {
            await audioManager.preloadSounds();
            if (mounted) {
                hasPreloaded.current = true;
                await audioManager.playMusic();
            }
        })();

        return () => {
            mounted = false;
            audioManager.stopMusic();
            audioManager.unloadSounds();
        };
    }, []);

    // React to music toggle change at runtime
    useEffect(() => {
        if (hasPreloaded.current) {
            audioManager.onMusicSettingChanged(musicEnabled);
        }
    }, [musicEnabled]);

    // Convenience SFX function that checks setting internally
    const playSfx = useCallback((name: SfxName) => {
        audioManager.playSfx(name);
    }, []);

    return { playSfx };
}
