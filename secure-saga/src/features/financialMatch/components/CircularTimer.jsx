/**
 * CircularTimer — Mechanical brass gear ring timer with sapphire blue inner ring.
 * Pixel-perfect: Bronze gear teeth outer ring → sapphire blue gemstone ring → dark navy clock face → bold white time.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';

const GEAR_TEETH = 24;
const OUTER_R = 45; // Outer radius of gear
const INNER_R = 37; // Inner radius of gear (to base of teeth)
const TOOTH_H = 8;  // Tooth height
const SAPPHIRE_R = 34;
const SAPPHIRE_W = 8;
const CLOCK_R = 26;
const TICK_COUNT = 12;

function generateGearPath(cx, cy, teeth, outerR, innerR) {
    const points = [];
    const step = (2 * Math.PI) / teeth;
    const halfStep = step / 2;
    const toothWidth = step * 0.35;

    for (let i = 0; i < teeth; i++) {
        const angle = i * step - Math.PI / 2;
        // Inner left
        points.push({
            x: cx + innerR * Math.cos(angle - halfStep + toothWidth * 0.5),
            y: cy + innerR * Math.sin(angle - halfStep + toothWidth * 0.5),
        });
        // Outer left
        points.push({
            x: cx + outerR * Math.cos(angle - toothWidth * 0.5),
            y: cy + outerR * Math.sin(angle - toothWidth * 0.5),
        });
        // Outer right
        points.push({
            x: cx + outerR * Math.cos(angle + toothWidth * 0.5),
            y: cy + outerR * Math.sin(angle + toothWidth * 0.5),
        });
        // Inner right
        points.push({
            x: cx + innerR * Math.cos(angle + halfStep - toothWidth * 0.5),
            y: cy + innerR * Math.sin(angle + halfStep - toothWidth * 0.5),
        });
    }

    return 'M' + points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L') + ' Z';
}

const CircularTimer = memo(function CircularTimer({ timeLeft, totalTime }) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const fraction = timeLeft / totalTime;
    const isWarning = timeLeft <= 30;

    const cx = 50;
    const cy = 50;
    const gearPath = generateGearPath(cx, cy, GEAR_TEETH, OUTER_R, INNER_R);

    // Tick marks
    const ticks = [];
    for (let i = 0; i < TICK_COUNT; i++) {
        const angle = (i * 360) / TICK_COUNT - 90;
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + (CLOCK_R - 2) * Math.cos(rad);
        const y1 = cy + (CLOCK_R - 2) * Math.sin(rad);
        const x2 = cx + (CLOCK_R - 5) * Math.cos(rad);
        const y2 = cy + (CLOCK_R - 5) * Math.sin(rad);
        ticks.push(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        );
    }

    // Progress arc for countdown
    const progressR = CLOCK_R - 1;
    const circumference = 2 * Math.PI * progressR;
    const offset = circumference * (1 - fraction);

    return (
        <div className="relative" style={{ width: '90px', height: '90px' }}>
            <svg viewBox="0 0 100 100" width="90" height="90">
                <defs>
                    {/* Brass gradient */}
                    <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4A017" />
                        <stop offset="30%" stopColor="#B8860B" />
                        <stop offset="60%" stopColor="#D4A017" />
                        <stop offset="100%" stopColor="#8B6914" />
                    </linearGradient>
                    {/* Sapphire gradient */}
                    <radialGradient id="sapphireGrad" cx="40%" cy="35%">
                        <stop offset="0%" stopColor="#2855B8" />
                        <stop offset="50%" stopColor="#1A3A8F" />
                        <stop offset="100%" stopColor="#0F2566" />
                    </radialGradient>
                    <filter id="gearShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                    </filter>
                </defs>

                {/* Gear teeth ring */}
                <path d={gearPath} fill="url(#brassGrad)" stroke="#8B6914" strokeWidth="0.5"
                    filter="url(#gearShadow)" />

                {/* Sapphire blue gemstone ring */}
                <circle cx={cx} cy={cy} r={SAPPHIRE_R} fill="url(#sapphireGrad)"
                    stroke="#0F2566" strokeWidth="0.5" />

                {/* Sapphire gem facet highlights */}
                <circle cx={cx - 6} cy={cy - 6} r={SAPPHIRE_R - 2}
                    fill="none" stroke="rgba(100,160,255,0.15)" strokeWidth="1" />

                {/* Dark navy clock face */}
                <circle cx={cx} cy={cy} r={CLOCK_R}
                    fill="#05101F" stroke="#1A3A8F" strokeWidth="0.5" />

                {/* Tick marks */}
                {ticks}

                {/* Progress ring */}
                <circle
                    cx={cx} cy={cy} r={progressR}
                    fill="none"
                    stroke={isWarning ? '#EF4444' : 'rgba(59,130,246,0.3)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
            </svg>

            {/* Center time text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="font-bold text-white tracking-wider"
                    style={{
                        fontSize: '22px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        fontFamily: "'Outfit', sans-serif",
                    }}
                >
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
