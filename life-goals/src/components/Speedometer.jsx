import React, { useEffect, useRef, useState } from "react";

const Speedometer = ({ score }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const [displayScore, setDisplayScore] = useState(0);

    // Clamped score logic - ensure it's a number
    const safeScore = isNaN(score) ? 0 : score;
    const clampedScore = Math.min(Math.max(Number(safeScore), 0), 100);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        // Target rotation: 0% = 0.75PI (left), 100% = 2.25PI (right) -> spanning 1.5PI (270 deg)
        // Wait, let's stick to a standard gauge. Usually 0 is at PI (9 o'clock) or roughly there.
        // The user's code had 0.75PI as a starting point.
        // Let's use: Start = 0.75 * PI (135 deg), End = 2.25 * PI (405 deg). Range = 1.5 * PI.
        // Normalized score (0-1) * 1.5 * PI + 0.75 * PI

        // User requested "0% to 100%".
        // 0% -> 135 degrees (bottom leftish)
        // 100% -> 405 degrees (bottom rightish)
        // Actually, simpler: 
        // Arc from 135deg to 405deg. 

        // Let's align with the user's snippet logic where possible but cleaned up.
        // User's snippet: rotation moves from some start to calculated totalRot.

        const startAngle = 0.75 * Math.PI;
        const totalRotationRange = 1.5 * Math.PI; // 270 degree gauge

        let currentScore = 0;
        const targetScore = clampedScore;

        // Animation loop
        const render = () => {
            // Smooth interpolation
            const diff = targetScore - currentScore;
            if (Math.abs(diff) > 0.1) {
                currentScore += diff * 0.05; // ease out
            } else {
                currentScore = targetScore;
            }

            // Ensure we don't set NaN to state
            const nextDisplayScore = Math.round(currentScore);
            if (!isNaN(nextDisplayScore)) {
                setDisplayScore(nextDisplayScore);
            }

            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 120;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // --- 1. Draw Background Track (Dotted or Solid?) ---
            // User asked for dotted lines. Let's make the main track a solid subtle arc, and the color arc solid too.
            // Actually, user's snippet had "DrawDottedLine". Let's try to mimic a techy look.
            // Let's draw a solid grey background arc first.
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + totalRotationRange);
            ctx.lineWidth = 15;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Faint white track
            ctx.lineCap = "round";
            ctx.stroke();

            // --- 2. Draw Colored Arc (Gradient) ---
            // We need a gradient that follows the arc. Canvas linear gradient is screen-space.
            // Conic gradient is better for arcs but support can vary. Linear usually looks "okay" if angled.
            // Let's try a Linear Gradient from Left to Right (Red -> Yellow -> Green)
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0.1, "#FF4B4B"); // Red
            gradient.addColorStop(0.5, "#FFB800"); // Yellow
            gradient.addColorStop(0.9, "#00E064"); // Green

            // Calculate current angle for the score
            const currentAngle = startAngle + (currentScore / 100) * totalRotationRange;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
            ctx.lineWidth = 15;
            ctx.strokeStyle = gradient;
            ctx.lineCap = "round";
            ctx.stroke();

            // --- 3. Draw Ticks / Dots ---
            // Let's add some decorative ticks inside or outside
            ctx.save();
            ctx.translate(centerX, centerY);
            const tickCount = 50;
            const step = totalRotationRange / tickCount;
            for (let i = 0; i <= tickCount; i++) {
                const theta = startAngle + i * step;
                // Only draw ticks up to current score? Or all? Let's draw all faint, and active ones bright.
                const isActive = theta <= currentAngle;

                const tickRadiusInner = radius - 25;
                const tickRadiusOuter = radius - 20;

                const x1 = Math.cos(theta) * tickRadiusInner;
                const y1 = Math.sin(theta) * tickRadiusInner;
                const x2 = Math.cos(theta) * tickRadiusOuter;
                const y2 = Math.sin(theta) * tickRadiusOuter;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = isActive ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.1)";
                ctx.stroke();
            }
            ctx.restore();

            // --- 4. Draw Needle ---
            // Needle tip
            const needleLength = radius - 10;
            const needleX = centerX + Math.cos(currentAngle) * needleLength;
            const needleY = centerY + Math.sin(currentAngle) * needleLength;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(needleX, needleY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineCap = "round";
            ctx.stroke();

            // Needle glowing tip
            ctx.beginPath();
            ctx.arc(needleX, needleY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#FFFFFF";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.shadowBlur = 0; // Reset

            // Center pivot
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();

            // Inner pivot
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = "#1E293B"; // Dark center
            ctx.fill();

            // Loop
            if (Math.abs(diff) > 0.1) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [clampedScore]);

    return (
        <div className="relative flex flex-col items-center justify-center select-none">
            <canvas
                ref={canvasRef}
                width={350}
                height={300} // Slightly cropped height since it's an arc
                className="w-full max-w-[350px] drop-shadow-2xl"
            />

            {/* Score Text centered in gauge - Enhanced with glow */}
            <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pt-24">
                <div className="text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ textShadow: '0 0 20px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.4)' }}>
                    {displayScore}<span className="text-xl">/100</span>
                </div>
            </div>
        </div>
    );
};

export default Speedometer;

