import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { SCREENS } from '../../constants/game';
import { CONFETTI_COLORS } from '../../constants/game';
import Button from '../ui/Button';
import styles from './ThankYouScreen.module.css';

/** Creates confetti particle objects */
function createConfetti(count = 60) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: `${Math.random() * 100}vw`,
        delay: `${Math.random() * 2}s`,
        duration: `${2.5 + Math.random() * 2}s`,
        size: `${8 + Math.random() * 10}px`,
        shape: Math.random() > 0.5 ? 'circle' : 'square',
    }));
}

export default function ThankYouScreen() {
    const { state, navigate } = useGame();
    const { initGame } = useGameEngine();
    const { user, booking } = state;

    const name = user.name || 'Friend';
    const confetti = useRef(createConfetti()).current;

    const dateStr = booking.preferredDate
        ? new Date(booking.preferredDate + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
        : '—';

    function formatTime12h(t) {
        if (!t) return '—';
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    function handlePlayAgain() {
        initGame();
        navigate(SCREENS.GAME);
    }

    return (
        <div className={`screen ${styles.screen}`}>
            {/* Confetti */}
            <div className={styles.confettiLayer} aria-hidden="true">
                {confetti.map((c) => (
                    <div
                        key={c.id}
                        className={styles.confettiPiece}
                        style={{
                            left: c.left,
                            animationDelay: c.delay,
                            animationDuration: c.duration,
                            width: c.size,
                            height: c.size,
                            background: c.color,
                            borderRadius: c.shape === 'circle' ? '50%' : '2px',
                        }}
                    />
                ))}
            </div>

            <div className={`screen-inner ${styles.inner}`}>

                {/* Icon */}
                <div className={styles.iconWrap}>
                    <div className={styles.iconBg}>🎉</div>
                    <div className={styles.iconRing} />
                </div>

                {/* Title */}
                <h2 className={styles.title}>
                    Thank you,<br />
                    <span>{name}</span>!
                </h2>
                <p className={styles.subtitle}>
                    Our expert will reach out to guide you toward the perfect life insurance plan.
                </p>

                {/* Booking card */}
                <div className={styles.card}>
                    <DetailRow icon="👤" label="Name" value={name} />
                    <DetailRow icon="📅" label="Appointment Date" value={dateStr} />
                    <DetailRow icon="🕐" label="Appointment Time" value={formatTime12h(booking.preferredTime)} />
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button variant="primary" fullWidth onClick={handlePlayAgain} id="btn-play-again-ty">
                        &nbsp; Play Again
                    </Button>
                    <p className={styles.note}>We&apos;ll call you at the scheduled time. See you soon! 🛡️</p>
                </div>

            </div>
        </div>
    );
}

function DetailRow({ icon, label, value }) {
    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', borderBottom: '1px solid rgba(30,78,216,0.08)',
            }}
        >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
            </div>
        </div>
    );
}
