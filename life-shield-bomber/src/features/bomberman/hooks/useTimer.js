/**
 * useTimer — Countdown timer hook for Bomberman.
 * Clean interval cleanup, returns timeLeft and control functions.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialTime, onExpire) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const onExpireRef = useRef(onExpire);

    onExpireRef.current = onExpire;

    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsRunning(false);
                    if (onExpireRef.current) onExpireRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning]);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const stop = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        stop();
        setTimeLeft(initialTime);
    }, [initialTime, stop]);

    return { timeLeft, isRunning, start, stop, reset };
}
