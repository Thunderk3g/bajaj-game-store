import React, { useRef, useEffect } from 'react';
import { GRID_SIZE } from '../constants/constants';

const GameCanvas = ({ snake, previousSnake, pellet, nextMilestone, lastEatenMilestone, speed, lastMoveTime }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const currentSizeRef = useRef({ width: 0, height: 0, cellSize: 0 });
    const milestoneAnimRef = useRef({ startTime: 0, milestone: null });

    // Store latest state in a ref for the continuous animation loop
    const stateRef = useRef({ snake, previousSnake, pellet, nextMilestone, lastEatenMilestone, speed, lastMoveTime });
    stateRef.current = { snake, previousSnake, pellet, nextMilestone, lastEatenMilestone, speed, lastMoveTime };

    // Trigger milestone animation when a new milestone is eaten
    useEffect(() => {
        if (lastEatenMilestone) {
            milestoneAnimRef.current = {
                startTime: performance.now(),
                milestone: lastEatenMilestone
            };
        }
    }, [lastEatenMilestone]);

    const draw = (t) => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        const state = stateRef.current;

        // Dynamic Resize Check
        const parentWidth = container.clientWidth;
        const parentHeight = container.clientHeight;
        const size = Math.floor(Math.min(parentWidth, parentHeight));
        const cellSize = size / GRID_SIZE;

        if (size !== currentSizeRef.current.width) {
            canvas.width = size;
            canvas.height = size;
            currentSizeRef.current = { width: size, height: size, cellSize };
            container.style.setProperty('--cell-size', `${cellSize}px`);
        }

        if (size === 0) return;

        // Calculate interpolation progress
        const elapsed = t - state.lastMoveTime;
        const progress = Math.min(1, Math.max(0, elapsed / state.speed));

        // Clear Canvas
        ctx.clearRect(0, 0, size, size);

        // Draw Pellet as Milestone Icon
        const pX = state.pellet.x * cellSize + cellSize / 2;
        const pY = state.pellet.y * cellSize + cellSize / 2;

        ctx.font = `${cellSize * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.nextMilestone.icon, pX, pY);

        // Draw Snake Segments
        state.snake.forEach((segment, index) => {
            const prev = state.previousSnake && state.previousSnake[index] ? state.previousSnake[index] : segment;

            let x, y;
            const dx = segment.x - prev.x;
            const dy = segment.y - prev.y;

            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                x = segment.x;
                y = segment.y;
            } else {
                x = prev.x + (segment.x - prev.x) * progress;
                y = prev.y + (segment.y - prev.y) * progress;
            }

            const isHead = index === 0;
            const s = cellSize - 0.5;
            const px = x * cellSize;
            const py = y * cellSize;

            ctx.fillStyle = '#3FB65E'; // Always standard green now

            if (isHead) {
                ctx.beginPath();
                ctx.roundRect(px, py, s, s, cellSize / 2);
                ctx.fill();

                // Eyes
                const eyeOffset = cellSize / 4;
                const eyeSize = cellSize / 8;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(px + eyeOffset, py + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(px + s - eyeOffset, py + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(px + eyeOffset, py + eyeOffset, eyeSize / 2, 0, Math.PI * 2);
                ctx.arc(px + s - eyeOffset, py + eyeOffset, eyeSize / 2, 0, Math.PI * 2);
                ctx.fill();

                // Milestone Floating Label Animation
                const anim = milestoneAnimRef.current;
                if (anim.milestone && t - anim.startTime < 1500) {
                    const animElapsed = t - anim.startTime;
                    const animProgress = animElapsed / 1500;
                    const floatY = py - cellSize - (animProgress * cellSize * 2);
                    const opacity = 1 - animProgress;

                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = 'black';
                    ctx.font = `bold ${cellSize * 0.5}px Outfit`;
                    ctx.fillText(`${anim.milestone.icon} ${anim.milestone.name}`, px + s / 2, floatY);
                    ctx.restore();
                }

                // Tongue
                ctx.strokeStyle = '#FF80AB';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(px + s / 2, py);
                ctx.lineTo(px + s / 2, py - cellSize / 4);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.roundRect(px, py, s, s, cellSize / 4);
                ctx.fill();
            }
        });
    };

    // Continuous Stable Animation Loop
    useEffect(() => {
        const loop = (t) => {
            draw(t);
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Loop never restarts

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center bg-[#0B1221] overflow-hidden relative"
        >
            <canvas
                ref={canvasRef}
                className="relative z-10 block shadow-2xl"
                style={{
                    imageRendering: 'auto',
                    backgroundColor: '#B9F84D',
                    backgroundImage: `
                        linear-gradient(45deg, #A4F231 25%, transparent 25%),
                        linear-gradient(-45deg, #A4F231 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #A4F231 75%),
                        linear-gradient(-45deg, transparent 75%, #A4F231 75%)
                    `,
                    backgroundSize: `calc(var(--cell-size, 20px) * 2) calc(var(--cell-size, 20px) * 2)`,
                    backgroundPosition: `0 0, 0 var(--cell-size, 20px), var(--cell-size, 20px) var(--cell-size, 20px), var(--cell-size, 20px) 0`,
                    width: 'min(100%, 100%)',
                    height: 'auto'
                }}
            />
        </div>
    );
};

export default GameCanvas;
