import { useState, useCallback } from 'react';

let id = 0;

/**
 * Provides a toast queue.
 * Returns { toasts, showToast } where showToast(message, type) fires a self-dismissing notification.
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const toastId = ++id;
        setToasts((prev) => [...prev, { id: toastId, message, type, exiting: false }]);

        // Mark as exiting so the CSS exit animation plays
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === toastId ? { ...t, exiting: true } : t))
            );
            // Remove from DOM after animation
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 350);
        }, duration);
    }, []);

    return { toasts, showToast };
}
