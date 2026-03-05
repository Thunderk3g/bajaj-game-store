import { useState, useEffect, useRef } from 'react';
import { TIMER_CONFIG } from '../constants/timerConfig';

export const useTimer = (initialTime = TIMER_CONFIG.INITIAL_TIME, onTimeUp, onWarning) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const start = () => setIsRunning(true);
    const stop = () => setIsRunning(false);
    const reset = (newTime = initialTime) => {
        stop();
        setTimeLeft(newTime);
    };

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1;

                    if (TIMER_CONFIG.WARNING_INTERVALS.includes(next)) {
                        onWarning?.(next);
                    }

                    if (next <= 0) {
                        clearInterval(intervalRef.current);
                        onTimeUp?.();
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft, onTimeUp, onWarning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / initialTime) * 100;

    return {
        timeLeft,
        isRunning,
        start,
        stop,
        reset,
        formatTime,
        progress,
        isUrgent: timeLeft <= TIMER_CONFIG.URGENT_THRESHOLD,
    };
};
