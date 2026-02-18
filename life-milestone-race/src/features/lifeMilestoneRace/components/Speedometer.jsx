import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * High-performance Canvas-based Speedometer.
 * Ported from Life Goals with enhanced aesthetics.
 */
const Speedometer = memo(function Speedometer({ score }) {
    const canvasRef = useRef(null);
    const [displayScore, setDisplayScore] = useState(0);

    // Clamped score logic - ensure it's a number
    const safeScore = isNaN(score) ? 0 : score;
    const clampedScore = Math.min(Math.max(Number(safeScore), 0), 100);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const startAngle = 0.75 * Math.PI;
        const totalRotationRange = 1.5 * Math.PI; // 270 degree gauge

        let currentScore = 0;
        const targetScore = clampedScore;

        const render = () => {
            // Smooth interpolation
            const diff = targetScore - currentScore;
            if (Math.abs(diff) > 0.1) {
                currentScore += diff * 0.05; // ease out
            } else {
                currentScore = targetScore;
            }

            const nextDisplayScore = Math.round(currentScore);
            if (!isNaN(nextDisplayScore)) {
                setDisplayScore(nextDisplayScore);
            }

            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 100;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // --- 1. Draw Background Track ---
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + totalRotationRange);
            ctx.lineWidth = 12;
            ctx.strokeStyle = 'rgba(0, 102, 178, 0.1)';
            ctx.lineCap = 'round';
            ctx.stroke();

            // --- 2. Draw Colored Arc (Gradient) ---
            const gradient = ctx.createLinearGradient(centerX - radius, 0, centerX + radius, 0);
            gradient.addColorStop(0, '#004A80'); // Deep Blue (start)
            gradient.addColorStop(0.5, '#0066B2'); // Bajaj Blue (mid)
            gradient.addColorStop(1, '#3B82F6'); // Lighter Blue (end)

            const currentAngle = startAngle + (currentScore / 100) * totalRotationRange;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
            ctx.lineWidth = 12;
            ctx.strokeStyle = gradient;
            ctx.lineCap = 'round';
            ctx.stroke();

            // --- 3. Draw Decorative Ticks ---
            ctx.save();
            ctx.translate(centerX, centerY);
            const tickCount = 40;
            const step = totalRotationRange / tickCount;
            for (let i = 0; i <= tickCount; i++) {
                const theta = startAngle + i * step;
                const isActive = theta <= currentAngle;

                const tickRadiusInner = radius - 20;
                const tickRadiusOuter = radius - 15;

                const x1 = Math.cos(theta) * tickRadiusInner;
                const y1 = Math.sin(theta) * tickRadiusInner;
                const x2 = Math.cos(theta) * tickRadiusOuter;
                const y2 = Math.sin(theta) * tickRadiusOuter;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = isActive ? 'rgba(0, 102, 178, 0.6)' : 'rgba(0, 102, 178, 0.1)';
                ctx.stroke();
            }
            ctx.restore();

            // --- 4. Draw Needle ---
            const needleLength = radius - 8;
            const needleX = centerX + Math.cos(currentAngle) * needleLength;
            const needleY = centerY + Math.sin(currentAngle) * needleLength;

            // Needle glow — Orange highlight
            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(255, 140, 0, 0.6)';

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(needleX, needleY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FF8C00';
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.shadowBlur = 0; // Reset

            // Center pivot
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF8C00';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#0B1120';
            ctx.fill();

            if (Math.abs(diff) > 0.1) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [clampedScore]);

    return (
        <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[280px] mx-auto">
            <canvas
                ref={canvasRef}
                width={280}
                height={240}
                className="w-full h-auto drop-shadow-2xl"
            />
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="flex flex-col items-center">
                    <span className="text-[2.5rem] font-black text-blue-950 leading-none tracking-tight" style={{ textShadow: '0 0 20px rgba(0, 102, 178, 0.2)' }}>
                        {displayScore}
                    </span>
                    <span className="text-[0.75rem] font-bold text-blue-900/60 uppercase tracking-widest mt-1">
                        Score / 100
                    </span>
                </div>
            </div>
        </div>
    );
});

Speedometer.displayName = 'Speedometer';

Speedometer.propTypes = {
    score: PropTypes.number.isRequired,
};

export default Speedometer;
