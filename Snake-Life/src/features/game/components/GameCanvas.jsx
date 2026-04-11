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

        // ========== LAYER 0: Board Improvements ==========
        // Draw a subtle checkered pattern for a better board look
        const boardBg = '#B9F84D';
        const boardPattern = '#A4F231';
        ctx.fillStyle = boardBg;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = boardPattern;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }

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

        // Build the path points
        const pathPoints = positions.map(p => ({
            cx: p.x * cellSize + cellSize / 2,
            cy: p.y * cellSize + cellSize / 2
        }));

        // Helper: build a smooth path using arcTo for rounded corners
        const buildSnakePath = (radius = cellSize / 2) => {
            if (pathPoints.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(pathPoints[0].cx, pathPoints[0].cy);

            for (let i = 1; i < pathPoints.length - 1; i++) {
                ctx.arcTo(
                    pathPoints[i].cx, pathPoints[i].cy,
                    pathPoints[i + 1].cx, pathPoints[i + 1].cy,
                    radius
                );
            }
            ctx.lineTo(
                pathPoints[pathPoints.length - 1].cx,
                pathPoints[pathPoints.length - 1].cy
            );
        };

        // ========== LAYER 1: Snake Shadow & Body ==========
        const outlineColor = '#2A4BBC';
        const fillColor = '#4674E9';
        const patternColor = '#355FC7';
        const outlineWidth = cellSize * 1.05;
        const fillWidth = cellSize * 0.85;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (pathPoints.length > 0) {
            ctx.save();
            // Subtle shadow for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;

            if (pathPoints.length > 1) {
                // Draw outline
                ctx.strokeStyle = outlineColor;
                ctx.lineWidth = outlineWidth;
                buildSnakePath();
                ctx.stroke();

                // Draw main fill
                ctx.shadowColor = 'transparent'; // No shadow for fill layer
                ctx.strokeStyle = fillColor;
                ctx.lineWidth = fillWidth;
                buildSnakePath();
                ctx.stroke();

                // ========== LAYER 1.5: Body Pattern (Scales/Spots) ==========
                ctx.strokeStyle = patternColor;
                ctx.lineWidth = fillWidth * 0.4;
                ctx.setLineDash([2, cellSize * 0.8]); // Dash pattern for spots/scales
                buildSnakePath();
                ctx.stroke();
                ctx.setLineDash([]); // Reset
            } else {
                // Single segment
                ctx.fillStyle = outlineColor;
                ctx.beginPath();
                ctx.arc(pathPoints[0].cx, pathPoints[0].cy, outlineWidth / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = fillColor;
                ctx.beginPath();
                ctx.arc(pathPoints[0].cx, pathPoints[0].cy, fillWidth / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // ========== LAYER 2: Pellet (Food) ==========
        const pX = state.pellet.x * cellSize + cellSize / 2;
        const pY = state.pellet.y * cellSize + cellSize / 2;

        // Pulse animation for food
        const foodScale = 1 + Math.sin(t / 200) * 0.1;
        ctx.save();
        ctx.translate(pX, pY);
        ctx.scale(foodScale, foodScale);
        ctx.font = `${cellSize * 1.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.nextMilestone.icon, 0, 0);
        ctx.restore();

        // ========== LAYER 3: Head Details (Eyes, Tongue, Mouth) ==========
        if (state.snake.length > 0) {
            const headSegment = state.snake[0];
            const { x: hx, y: hy } = positions[0];
            const cx = hx * cellSize + cellSize / 2;
            const cy = hy * cellSize + cellSize / 2;

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

            // --- Tongue ---
            const tongueColor = '#FF4D4D';
            const tongueLen = cellSize * 0.4 * (0.8 + Math.sin(t / 80) * 0.5); // Flicking animation
            const isNearFood = Math.abs(headSegment.x - state.pellet.x) <= 1 && Math.abs(headSegment.y - state.pellet.y) <= 1;

            if (tongueLen > cellSize * 0.2 || isNearFood) {
                ctx.beginPath();
                ctx.strokeStyle = tongueColor;
                ctx.lineWidth = 3;
                let tx = cx, ty = cy;
                const offset = fillWidth / 2;

                if (dir === 'UP') { ty -= offset; ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - tongueLen); }
                else if (dir === 'DOWN') { ty += offset; ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + tongueLen); }
                else if (dir === 'LEFT') { tx -= offset; ctx.moveTo(tx, ty); ctx.lineTo(tx - tongueLen, ty); }
                else if (dir === 'RIGHT') { tx += offset; ctx.moveTo(tx, ty); ctx.lineTo(tx + tongueLen, ty); }

                ctx.stroke();

                // Forked tongue tip
                const forkLen = 4;
                if (dir === 'UP' || dir === 'DOWN') {
                    const tipY = dir === 'UP' ? ty - tongueLen : ty + tongueLen;
                    ctx.moveTo(tx, tipY); ctx.lineTo(tx - forkLen, tipY + (dir === 'UP' ? -forkLen : forkLen));
                    ctx.moveTo(tx, tipY); ctx.lineTo(tx + forkLen, tipY + (dir === 'UP' ? -forkLen : forkLen));
                } else {
                    const tipX = dir === 'LEFT' ? tx - tongueLen : tx + tongueLen;
                    ctx.moveTo(tipX, ty); ctx.lineTo(tipX + (dir === 'LEFT' ? -forkLen : forkLen), ty - forkLen);
                    ctx.moveTo(tipX, ty); ctx.lineTo(tipX + (dir === 'LEFT' ? -forkLen : forkLen), ty + forkLen);
                }
                ctx.stroke();
            }

            // --- Eyes ---
            const eyeRadius = cellSize * 0.16;
            const pupilRadius = cellSize * 0.07;
            const eyeSep = cellSize * 0.24;
            const eyeFwd = cellSize * 0.18;

            // Mouth opening (eating animation)
            const mouthOpen = isNearFood ? Math.sin(t / 100) * 0.15 : 0;
            const eyeScale = 1 + mouthOpen;

            let eye1, eye2;
            if (dir === 'UP') {
                eye1 = { x: cx - eyeSep, y: cy - eyeFwd };
                eye2 = { x: cx + eyeSep, y: cy - eyeFwd };
            } else if (dir === 'DOWN') {
                eye1 = { x: cx - eyeSep, y: cy + eyeFwd };
                eye2 = { x: cx + eyeSep, y: cy + eyeFwd };
            } else if (dir === 'LEFT') {
                eye1 = { x: cx - eyeFwd, y: cy - eyeSep };
                eye2 = { x: cx - eyeFwd, y: cy + eyeSep };
            } else {
                eye1 = { x: cx + eyeFwd, y: cy - eyeSep };
                eye2 = { x: cx + eyeFwd, y: cy + eyeSep };
            }

            // White eye backgrounds
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eye1.x, eye1.y, eyeRadius * eyeScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2.x, eye2.y, eyeRadius * eyeScale, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#1D3B9C';
            const pupilOffset = cellSize * 0.06;
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

            // Milestone floating label
            const anim = milestoneAnimRef.current;
            if (anim.milestone && t - anim.startTime < 1500) {
                const animElapsed = t - anim.startTime;
                const animProgress = animElapsed / 1500;
                const floatY = (hy * cellSize) - cellSize - (animProgress * cellSize * 2);
                const opacity = 1 - animProgress;

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = '#000000';
                ctx.font = `bold ${cellSize * 0.6}px Outfit`;
                ctx.textAlign = 'center';
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
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center bg-[#0B1221] overflow-hidden relative"
        >
            <canvas
                ref={canvasRef}
                className="relative z-10 block rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                style={{
                    imageRendering: 'auto',
                    width: 'min(95%, 95%)',
                    height: 'auto'
                }}
            />
        </div>
    );
};

export default GameCanvas;
