import React from 'react';

/**
 * SVG score ring with animated stroke.
 * pct: 0–100
 */
export default function ScoreRing({ score, pct, zoneColor }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: 140, height: 140 }}>
                {/* Background circle */}
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="70" cy="70" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="12"
                    />
                    <circle
                        cx="70" cy="70" r={radius}
                        fill="none"
                        stroke={zoneColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
                            filter: `drop-shadow(0 0 6px ${zoneColor})`,
                        }}
                    />
                </svg>
                {/* Score label */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ top: 0 }}
                >
                    <span className="font-black" style={{ fontSize: 38, color: '#ffffff', lineHeight: 1 }}>
                        {pct}%
                    </span>
                    <span style={{ fontSize: 11, color: '#90E0EF', fontWeight: 600, letterSpacing: '0.05em', marginTop: 4 }}>
                        PREPARED
                    </span>
                </div>
            </div>
        </div>
    );
}
