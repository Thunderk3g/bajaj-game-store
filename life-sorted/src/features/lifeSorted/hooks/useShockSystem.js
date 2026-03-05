import { useState, useCallback } from 'react';

export const useShockSystem = (onShockAction) => {
    const [shockFired, setShockFired] = useState(false);
    const [isShockActive, setIsShockActive] = useState(false);

    const triggerShock = useCallback(() => {
        setIsShockActive(true);
        setShockFired(true);
        onShockAction?.();
    }, [onShockAction]);

    const resolveShock = useCallback(() => {
        setIsShockActive(false);
    }, []);

    const resetShock = useCallback(() => {
        setShockFired(false);
        setIsShockActive(false);
    }, []);

    return {
        shockFired,
        isShockActive,
        triggerShock,
        resolveShock,
        resetShock,
    };
};
