import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';

// Options for Turkish output
const SPEECH_OPTIONS: Speech.SpeechOptions = {
    language: 'tr-TR',
    pitch: 1.0,
    rate: 0.95, // Slightly slower for better clarity of clues
};

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Ensure we stop speaking when component unmounts
    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    const speak = useCallback(async (text: string) => {
        try {
            // Stop any ongoing speech first
            const speaking = await Speech.isSpeakingAsync();
            if (speaking) {
                await Speech.stop();
            }

            // Small delay to let the stop command settle before starting new speech
            setTimeout(() => {
                setIsSpeaking(true);
                Speech.speak(text, {
                    ...SPEECH_OPTIONS,
                    onDone: () => setIsSpeaking(false),
                    onStopped: () => setIsSpeaking(false),
                    onError: (error) => {
                        console.warn('Speech synthesis error:', error);
                        setIsSpeaking(false);
                    },
                });
            }, 50);
        } catch (error) {
            console.warn('Speech API error:', error);
            setIsSpeaking(false);
        }
    }, []);

    const stop = useCallback(async () => {
        try {
            await Speech.stop();
            setIsSpeaking(false);
        } catch (error) {
            console.warn('Speech stop error:', error);
        }
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
    };
}
