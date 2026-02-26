import React from 'react';
import { SNAKES, LADDERS, getSVGCoords } from '../features/GameLogic';

const BoardOverlay: React.FC = () => {
    const renderSnakes = () => {
        return Object.entries(SNAKES).map(([fromStr, data]) => {
            const from = parseInt(fromStr);
            const to = data.target!;
            const start = getSVGCoords(from);
            const end = getSVGCoords(to);

            // Control point logic for curves
            const midX = (start.cx + end.cx) / 2;
            const midY = (start.cy + end.cy) / 2;
            const dx = end.cx - start.cx;
            const dy = end.cy - start.cy;

            // Calculate curve bias based on snake height/distance
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offset = dist * 0.15;
            const qx = midX - dy * (offset / dist);
            const qy = midY + dx * (offset / dist);

            const pathData = `M ${start.cx} ${start.cy} Q ${qx} ${qy} ${end.cx} ${end.cy}`;

            // Calculate head angle
            const headAngle = Math.atan2(qy - start.cy, qx - start.cx) * (180 / Math.PI);

            return (
                <g key={`snake-${from}`} className="lsl-snake-group">
                    {/* Shadow path */}
                    <path
                        d={pathData}
                        stroke="black"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.3"
                        transform="translate(0.5, 0.5)"
                    />
                    {/* Main Tapered Body */}
                    <path
                        d={pathData}
                        stroke="rgba(185, 28, 28, 0.8)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d={pathData}
                        stroke="rgba(239, 68, 68, 0.9)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* Segment details */}
                    <path
                        d={pathData}
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="0.8"
                        strokeDasharray="1, 4"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Head */}
                    <g transform={`translate(${start.cx}, ${start.cy}) rotate(${headAngle})`}>
                        {/* Tongue */}
                        <path
                            d="M 2 0 L 5 -1 M 2 0 L 5 1"
                            stroke="#ef4444"
                            strokeWidth="0.5"
                            fill="none"
                            className="lsl-animate-pulse"
                        />
                        {/* Head Shape */}
                        <ellipse cx="0" cy="0" rx="2.5" ry="1.8" fill="#991b1b" />
                        <ellipse cx="-0.5" cy="0" rx="2" ry="1.5" fill="#ef4444" />
                        {/* Eyes */}
                        <circle cx="0.8" cy="-0.8" r="0.4" fill="white" />
                        <circle cx="0.8" cy="0.8" r="0.4" fill="white" />
                        <circle cx="1" cy="-0.8" r="0.2" fill="black" />
                        <circle cx="1" cy="0.8" r="0.2" fill="black" />
                    </g>

                    {/* Tail */}
                    <circle cx={end.cx} cy={end.cy} r="0.8" fill="#991b1b" />
                </g>
            );
        });
    };

    const renderLadders = () => {
        return Object.entries(LADDERS).map(([fromStr, data]) => {
            const from = parseInt(fromStr);
            const to = data.target!;
            const start = getSVGCoords(from);
            const end = getSVGCoords(to);

            const dx = end.cx - start.cx;
            const dy = end.cy - start.cy;
            const angle = Math.atan2(dy, dx);

            const gap = 2.2;

            // Rail offsets
            const rail1 = {
                x1: start.cx - Math.sin(angle) * gap,
                y1: start.cy + Math.cos(angle) * gap,
                x2: end.cx - Math.sin(angle) * gap,
                y2: end.cy + Math.cos(angle) * gap
            };

            const rail2 = {
                x1: start.cx + Math.sin(angle) * gap,
                y1: start.cy - Math.cos(angle) * gap,
                x2: end.cx + Math.sin(angle) * gap,
                y2: end.cy - Math.cos(angle) * gap
            };

            return (
                <g key={`ladder-${from}`} className="lsl-ladder-group">
                    <defs>
                        <linearGradient id={`grad-ladder-${from}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#92400e" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#92400e" />
                        </linearGradient>
                    </defs>

                    {/* Shadow */}
                    <g opacity="0.4" transform="translate(0.6, 0.6)">
                        <line x1={rail1.x1} y1={rail1.y1} x2={rail1.x2} y2={rail1.y2} stroke="black" strokeWidth="1.5" />
                        <line x1={rail2.x1} y1={rail2.y1} x2={rail2.x2} y2={rail2.y2} stroke="black" strokeWidth="1.5" />
                    </g>

                    {/* Main Rails */}
                    <line x1={rail1.x1} y1={rail1.y1} x2={rail1.x2} y2={rail1.y2} stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1={rail1.x1} y1={rail1.y1} x2={rail1.x2} y2={rail1.y2} stroke="#fcd34d" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />

                    <line x1={rail2.x1} y1={rail2.y1} x2={rail2.x2} y2={rail2.y2} stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1={rail2.x1} y1={rail2.y1} x2={rail2.x2} y2={rail2.y2} stroke="#fcd34d" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />

                    {/* Rungs */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((rungId) => {
                        // Calculate positions for 8 rungs along the ladder
                        const stepCount = 9;
                        const t = rungId / stepCount;

                        // Check if rung is within a reasonable distance
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 15 && rungId > 3) return null; // Fewer rungs for short ladders

                        const rx1 = rail1.x1 + (rail1.x2 - rail1.x1) * t;
                        const ry1 = rail1.y1 + (rail1.y2 - rail1.y1) * t;
                        const rx2 = rail2.x1 + (rail2.x2 - rail2.x1) * t;
                        const ry2 = rail2.y1 + (rail2.y2 - rail2.y1) * t;

                        return (
                            <g key={`rung-${from}-${rungId}`}>
                                <line
                                    x1={rx1} y1={ry1} x2={rx2} y2={ry2}
                                    stroke="#92400e" strokeWidth="1.8" strokeLinecap="round"
                                />
                                <line
                                    x1={rx1} y1={ry1} x2={rx2} y2={ry2}
                                    stroke="#fbbf24" strokeWidth="0.5" strokeLinecap="round" opacity="0.6"
                                    transform="translate(0, -0.2)"
                                />
                            </g>
                        );
                    })}
                </g>
            );
        });
    };

    return (
        <svg
            className="lsl-absolute lsl-inset-0 lsl-pointer-events-none lsl-z-[5]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <filter id="dropshadow" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
                <feOffset dx="0.2" dy="0.2" result="offsetblur" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            {renderLadders()}
            {renderSnakes()}
        </svg>
    );
};

export default BoardOverlay;
