import { useRef, useCallback } from 'react';

/**
 * Custom hook for sound effects
 */
export const useSound = () => {
    const soundEnabled = useRef(true);

    const playSound = useCallback((soundType, options = {}) => {
        if (!soundEnabled.current) return;

        try {
            // Use absolute-looking path from project root and add cache-buster
            const soundPath = `./sounds/${soundType}.wav?v=${Date.now()}`;
            const audio = new Audio(soundPath);
            audio.volume = 0.5;

            if (options.startTime) {
                audio.currentTime = options.startTime;
            }

            audio.play().catch(err => {
                // Silently fail if sound doesn't exist or can't play
                console.warn(`Sound play failed for ${soundPath}:`, err);
            });
        } catch (error) {
            // Sound not available
            console.error('Error in useSound:', error);
        }
    }, []);

    const toggleSound = useCallback(() => {
        soundEnabled.current = !soundEnabled.current;
        return soundEnabled.current;
    }, []);

    return { playSound, toggleSound, soundEnabled: soundEnabled.current };
};
