import { useEffect } from 'react';

/**
 * Modal bottom-sheet component
 * Renders an overlay + slide-up panel; closes on overlay click (optional)
 */
export default function Modal({ children, onClose, closeOnOverlay = false }) {
    // Prevent background scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={closeOnOverlay ? onClose : undefined}
        >
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-handle" />
                {children}
            </div>
        </div>
    );
}
