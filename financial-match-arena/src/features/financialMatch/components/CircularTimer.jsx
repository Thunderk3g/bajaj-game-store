/**
 * CircularTimer — Performance-Optimized Countdown Ring
 * ══════════════════════════════════════════════════════════
 * OPTIMIZATIONS:
 * - Replaced motion.circle with standard SVG + CSS transition
 * - Removed drop-shadow filter from SVG (expensive on mobile)
 * - Uses CSS transition instead of Framer spring for dashoffset
 * ══════════════════════════════════════════════════════════
 */
import { memo } from 'react';
import PropTypes from 'prop-types';

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CircularTimer = memo(function CircularTimer({ timeLeft, totalTime }) {
    const fraction = timeLeft / totalTime;
    const offset = CIRCUMFERENCE * (1 - fraction);
    const isWarning = timeLeft <= 30;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const strokeColor = isWarning ? '#EF4444' : '#3B82F6';

    return (
        <div className={`relative flex items-center justify-center w-16 h-16 ${isWarning ? 'timer-warning' : ''}`}>
            {/* Warning glow — lightweight radial gradient instead of blur */}
            {isWarning && (
                <div className="absolute inset-0 rounded-full timer-glow" />
            )}

            <svg width={60} height={60} viewBox="0 0 60 60" className="transform -rotate-90">
                {/* Track */}
                <circle
                    cx="30"
                    cy="30"
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                />
                {/* Progress — CSS transition instead of Framer spring */}
                <circle
                    cx="30"
                    cy="30"
                    r={RADIUS}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 1s linear',
                    }}
                />
            </svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-game text-sm text-white tracking-wider leading-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {display}
                </span>
            </div>
        </div>
    );
});

CircularTimer.propTypes = {
    timeLeft: PropTypes.number.isRequired,
    totalTime: PropTypes.number.isRequired,
};

export default CircularTimer;
