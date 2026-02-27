import React, { useRef, useEffect } from 'react';
import { GRID_SIZE } from '../constants/constants';

// Snake Assets
import headUp from '../../../assets/snake/head_up.png';
import headDown from '../../../assets/snake/head_down.png';
import headLeft from '../../../assets/snake/head_left.png';
import headRight from '../../../assets/snake/head_right.png';
import bodyVertical from '../../../assets/snake/body_vertical.png';
import bodyHorizontal from '../../../assets/snake/body_horizontal.png';
import bodyTopLeft from '../../../assets/snake/body_topleft.png';
import bodyTopRight from '../../../assets/snake/body_topright.png';
import bodyBottomLeft from '../../../assets/snake/body_bottomleft.png';
import bodyBottomRight from '../../../assets/snake/body_bottomright.png';
import tailUp from '../../../assets/snake/tail_up.png';
import tailDown from '../../../assets/snake/tail_down.png';
import tailLeft from '../../../assets/snake/tail_left.png';
import tailRight from '../../../assets/snake/tail_right.png';

const GameCanvas = ({ snake, previousSnake, pellet, nextMilestone, lastEatenMilestone, speed, lastMoveTime }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const currentSizeRef = useRef({ width: 0, height: 0, cellSize: 0 });
    const milestoneAnimRef = useRef({ startTime: 0, milestone: null });

    // Store latest state in a ref for the continuous animation loop
    const stateRef = useRef({ snake, previousSnake, pellet, nextMilestone, lastEatenMilestone, speed, lastMoveTime });
    stateRef.current = { snake, previousSnake, pellet, nextMilestone, lastEatenMilestone, speed, lastMoveTime };

    const snakeImages = useRef({});

    useEffect(() => {
        const assets = {
            head_up: headUp,
            head_down: headDown,
            head_left: headLeft,
            head_right: headRight,
            body_vertical: bodyVertical,
            body_horizontal: bodyHorizontal,
            body_topleft: bodyTopLeft,
            body_topright: bodyTopRight,
            body_bottomleft: bodyBottomLeft,
            body_bottomright: bodyBottomRight,
            tail_up: tailUp,
            tail_down: tailDown,
            tail_left: tailLeft,
            tail_right: tailRight
        };

        Object.entries(assets).forEach(([name, src]) => {
            const img = new Image();
            img.src = src;
            snakeImages.current[name] = img;
        });
    }, []);

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

        // Enable high-quality image smoothing for crisp sprites
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

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

        // Linear interpolation for constant-speed, smooth movement
        const elapsed = t - state.lastMoveTime;
        const progress = Math.min(1, Math.max(0, elapsed / state.speed));

        // Clear Canvas
        ctx.clearRect(0, 0, size, size);

        // Draw Pellet as Milestone Icon
        const pX = state.pellet.x * cellSize + cellSize / 2;
        const pY = state.pellet.y * cellSize + cellSize / 2;

        ctx.font = `${cellSize * 1.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.nextMilestone.icon, pX, pY);

        // Pre-calculate all interpolated positions
        const positions = state.snake.map((segment, index) => {
            const prev = state.previousSnake && state.previousSnake[index] ? state.previousSnake[index] : segment;
            const dx = segment.x - prev.x;
            const dy = segment.y - prev.y;

            let x, y;
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                x = segment.x;
                y = segment.y;
            } else {
                x = prev.x + dx * progress;
                y = prev.y + dy * progress;
            }
            return { x, y };
        });

        // Build the path points once for reuse
        const pathPoints = positions.map(p => ({
            cx: p.x * cellSize + cellSize / 2,
            cy: p.y * cellSize + cellSize / 2
        }));

        // Helper: build a smooth path using arcTo for rounded corners
        const buildSnakePath = () => {
            if (pathPoints.length < 2) return;
            const arcRadius = cellSize / 2;

            ctx.beginPath();
            ctx.moveTo(pathPoints[0].cx, pathPoints[0].cy);

            for (let i = 1; i < pathPoints.length - 1; i++) {
                // Use arcTo: the corner point is the control, next point is the target
                ctx.arcTo(
                    pathPoints[i].cx, pathPoints[i].cy,
                    pathPoints[i + 1].cx, pathPoints[i + 1].cy,
                    arcRadius
                );
            }
            // Final line to the last point
            ctx.lineTo(
                pathPoints[pathPoints.length - 1].cx,
                pathPoints[pathPoints.length - 1].cy
            );
        };

        // ========== LAYER 1: Dark blue OUTLINE (wider) ==========
        const outlineColor = '#2A4BBC';
        const fillColor = '#4674E9';
        const outlineWidth = cellSize * 1.05;
        const fillWidth = cellSize * 0.82;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (pathPoints.length > 1) {
            // Draw outline
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = outlineWidth;
            buildSnakePath();
            ctx.stroke();

            // ========== LAYER 2: Lighter blue FILL (narrower) ==========
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = fillWidth;
            buildSnakePath();
            ctx.stroke();
        } else if (pathPoints.length === 1) {
            // Single segment
            ctx.fillStyle = outlineColor;
            ctx.beginPath();
            ctx.arc(pathPoints[0].cx, pathPoints[0].cy, outlineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(pathPoints[0].cx, pathPoints[0].cy, fillWidth / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // ========== LAYER 3: Eyes on Head ==========
        if (state.snake.length > 0) {
            const headSegment = state.snake[0];
            const { x, y } = positions[0];
            const px = x * cellSize;
            const py = y * cellSize;

            // Determine direction
            const prev = state.previousSnake && state.previousSnake[0] ? state.previousSnake[0] : headSegment;
            const hdx = headSegment.x - prev.x;
            const hdy = headSegment.y - prev.y;

            let dir = 'RIGHT';
            if (hdy < 0) dir = 'UP';
            else if (hdy > 0) dir = 'DOWN';
            else if (hdx < 0) dir = 'LEFT';
            else if (hdx > 0) dir = 'RIGHT';
            else {
                const next = state.snake[1];
                if (next) {
                    if (headSegment.y < next.y) dir = 'UP';
                    else if (headSegment.y > next.y) dir = 'DOWN';
                    else if (headSegment.x < next.x) dir = 'LEFT';
                    else dir = 'RIGHT';
                }
            }

            // Draw Eyes natively
            const cx = px + cellSize / 2;
            const cy = py + cellSize / 2;
            const eyeRadius = cellSize * 0.15;
            const pupilRadius = cellSize * 0.06;
            const eyeSep = cellSize * 0.22;
            const eyeFwd = cellSize * 0.15;

            let eye1 = { x: cx, y: cy };
            let eye2 = { x: cx, y: cy };

            if (dir === 'UP') {
                eye1 = { x: cx - eyeSep, y: cy - eyeFwd };
                eye2 = { x: cx + eyeSep, y: cy - eyeFwd };
            } else if (dir === 'DOWN') {
                eye1 = { x: cx - eyeSep, y: cy + eyeFwd };
                eye2 = { x: cx + eyeSep, y: cy + eyeFwd };
            } else if (dir === 'LEFT') {
                eye1 = { x: cx - eyeFwd, y: cy - eyeSep };
                eye2 = { x: cx - eyeFwd, y: cy + eyeSep };
            } else if (dir === 'RIGHT') {
                eye1 = { x: cx + eyeFwd, y: cy - eyeSep };
                eye2 = { x: cx + eyeFwd, y: cy + eyeSep };
            }

            // White eye backgrounds
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Dark blue pupils looking forward
            ctx.fillStyle = '#1D3B9C';
            const pupilOffset = cellSize * 0.05;
            const p1x = dir === 'LEFT' ? eye1.x - pupilOffset : dir === 'RIGHT' ? eye1.x + pupilOffset : eye1.x;
            const p1y = dir === 'UP' ? eye1.y - pupilOffset : dir === 'DOWN' ? eye1.y + pupilOffset : eye1.y;
            const p2x = dir === 'LEFT' ? eye2.x - pupilOffset : dir === 'RIGHT' ? eye2.x + pupilOffset : eye2.x;
            const p2y = dir === 'UP' ? eye2.y - pupilOffset : dir === 'DOWN' ? eye2.y + pupilOffset : eye2.y;

            ctx.beginPath();
            ctx.arc(p1x, p1y, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p2x, p2y, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            // Milestone floating label on head
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
                ctx.fillText(`${anim.milestone.icon} ${anim.milestone.name}`, cx, floatY);
                ctx.restore();
            }
        }
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
                        radial-gradient(#A4F231 1.5px, transparent 0),
                        radial-gradient(#A4F231 1.5px, transparent 0)
                    `,
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 6px 6px',
                    width: 'min(100%, 100%)',
                    height: 'auto'
                }}
            />
        </div>
    );
};

export default GameCanvas;
