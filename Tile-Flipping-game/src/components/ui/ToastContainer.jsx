/**
 * ToastContainer — renders all active toasts from the useToast hook
 */
export default function ToastContainer({ toasts }) {
    if (!toasts.length) return null;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    return (
        <div className="toast-container" aria-live="polite" aria-atomic="true">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`toast toast--${t.type} ${t.exiting ? 'toast--exit' : ''}`}
                    role="status"
                >
                    <span>{icons[t.type] ?? 'ℹ️'}</span>
                    {t.message}
                </div>
            ))}
        </div>
    );
}
