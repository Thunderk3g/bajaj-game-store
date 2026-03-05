import { useState, useCallback, useRef } from 'react';

export const useToastSystem = (duration = 2600) => {
    const [toast, setToast] = useState(null);
    const timeoutRef = useRef(null);

    const showToast = useCallback((message, type = 'info') => {
        // Dismiss existing
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setToast({ message, type });

        timeoutRef.current = setTimeout(() => {
            setToast(null);
            timeoutRef.current = null;
        }, duration);
    }, [duration]);

    const dismissToast = useCallback(() => {
        setToast(null);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    return { toast, showToast, dismissToast };
};
