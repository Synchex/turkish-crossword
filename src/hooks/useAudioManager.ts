import { useEffect, useRef, useCallback } from 'react';
import { audioManager, SfxName } from '../audio/AudioManager';
import { useSettingsStore } from '../store/useSettingsStore';

export function useAudioManager() {
    const musicEnabled = useSettingsStore((s) => s.music);
    const soundEnabled = useSettingsStore((s) => s.sound);
    const hasPreloaded = useRef(false);

    // Preload on mount, unload on unmount — NO auto-play
    useEffect(() => {
        let mounted = true;

        (async () => {
            await audioManager.preloadSounds();
            if (mounted) {
                hasPreloaded.current = true;
            }
        })();

        return () => {
            mounted = false;
            audioManager.stopMusic();
            audioManager.unloadSounds();
        };
    }, []);

    // React to music toggle change at runtime (user manually enables/disables)
    useEffect(() => {
        if (hasPreloaded.current) {
            audioManager.onMusicSettingChanged(musicEnabled);
        }
    }, [musicEnabled]);

    // Convenience SFX function
    const playSfx = useCallback((name: SfxName) => {
        audioManager.playSfx(name);
    }, []);

    return { playSfx };
}
