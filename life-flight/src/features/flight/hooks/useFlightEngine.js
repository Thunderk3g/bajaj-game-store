import { useRef, useEffect, useCallback, useState } from 'react';
import {
    CANVAS_W, CANVAS_H, BIRD_X, GRAVITY, FLAP_FORCE,
    PIPE_SPEED, PIPE_WIDTH, PIPE_GAP, GROUND_HEIGHT, BIRD_RADIUS,
    SPAWN_GAP, MAX_ROTATION_UP, MAX_ROTATION_DOWN, ROTATION_FACTOR,
    CLOUD_COUNT, CLOUD_SPEED_MIN, CLOUD_SPEED_MAX,
    HURDLES, MICRO_MESSAGES, MAX_REF_SCORE,
} from '../constants/gameConstants.js';
import bgImgSrc from '../../../assets/background-day.png';

const rand = (min, max) => Math.random() * (max - min) + min;

function createBird() {
    return { x: BIRD_X, y: CANVAS_H / 2, vy: 0, rotation: 0 };
}

function createCloud(x) {
    return {
        x: x ?? rand(0, CANVAS_W),
        y: rand(40, CANVAS_H * 0.5),
        speed: rand(CLOUD_SPEED_MIN, CLOUD_SPEED_MAX),
        w: rand(60, 110),
        h: rand(28, 48),
        opacity: rand(0.18, 0.42),
    };
}

function createPipe(hurdleIndex) {
    const topH = rand(80, CANVAS_H - PIPE_GAP - GROUND_HEIGHT - 80);
    const hurdle = HURDLES[hurdleIndex % HURDLES.length];
    return {
        x: CANVAS_W + 10,
        topH,
        bottomY: topH + PIPE_GAP,
        passed: false,
        hurdle,
        badgeVisible: false,
    };
}

export function useFlightEngine({
    isActive,
    gameStarted,
    onScorePoint,
    onHit,
}) {
    const canvasRef = useRef(null);
    const stateRef = useRef(null);
    const rafRef = useRef(null);
    const lastMicroRef = useRef(0);
    const bgImgRef = useRef(null);

    // ── Load background image ──
    useEffect(() => {
        const img = new Image();
        img.src = bgImgSrc;
        img.onload = () => { bgImgRef.current = img; };
    }, []);

    const [currentHurdle, setCurrentHurdle] = useState(null);
    const [microMsg, setMicroMsg] = useState(null);
    const scoreRef = useRef(0);
    const hurdleCountRef = useRef(0);
    const isActiveRef = useRef(isActive);

    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

    // Keep stable callbacks via refs
    const onScoreRef = useRef(onScorePoint);
    const onHitRef = useRef(onHit);
    useEffect(() => { onScoreRef.current = onScorePoint; }, [onScorePoint]);
    useEffect(() => { onHitRef.current = onHit; }, [onHit]);

    const initState = useCallback(() => {
        const clouds = Array.from({ length: CLOUD_COUNT }, (_, i) =>
            createCloud(rand(0, CANVAS_W))
        );
        stateRef.current = {
            bird: createBird(),
            pipes: [],
            clouds,
            hurdleIndex: 0,
        };
        scoreRef.current = 0;
        hurdleCountRef.current = 0;
        lastMicroRef.current = 0;
        setCurrentHurdle(null);
        setMicroMsg(null);
    }, []);

    const handleFlap = useCallback(() => {
        if (!stateRef.current) return;
        stateRef.current.bird.vy = FLAP_FORCE;
    }, []);

    // ── Draw helpers ─────────────────────────────────────────────
    const drawCloud = (ctx, c) => {
        ctx.save();
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x - c.w * 0.25, c.y + 4, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x + c.w * 0.25, c.y + 4, c.w * 0.3, c.h * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const drawPipe = (ctx, pipe) => {
        const { color } = pipe.hurdle;
        const capColor = color + 'dd';

        // ── Top pipe ─
        const grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        grad.addColorStop(0, color + 'cc');
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, color + '88');
        ctx.fillStyle = grad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topH);
        ctx.fillStyle = capColor;
        ctx.fillRect(pipe.x - 4, pipe.topH - 18, PIPE_WIDTH + 8, 18);

        // ── Bottom pipe ─
        const bGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        bGrad.addColorStop(0, color + 'cc');
        bGrad.addColorStop(0.4, color);
        bGrad.addColorStop(1, color + '88');
        ctx.fillStyle = bGrad;
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, CANVAS_H - pipe.bottomY - GROUND_HEIGHT);
        ctx.fillStyle = capColor;
        ctx.fillRect(pipe.x - 4, pipe.bottomY, PIPE_WIDTH + 8, 18);

        // ── Hurdle label on TOP pipe ─
        ctx.save();
        ctx.font = '900 16px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 1;
        ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.topH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(pipe.hurdle.name, 0, 5);
        ctx.restore();

        // ── Hurdle label on BOTTOM pipe ─
        ctx.save();
        ctx.font = '900 16px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 1;
        const bottomContentHeight = CANVAS_H - pipe.bottomY - GROUND_HEIGHT;
        ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.bottomY + bottomContentHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(pipe.hurdle.name, 0, 5);
        ctx.restore();
    };

    const drawBird = (ctx, bird) => {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation);

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD166';
        ctx.fill();
        ctx.strokeStyle = '#F4A261';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eye
        ctx.beginPath();
        ctx.arc(7, -4, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -4, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#1D3557';
        ctx.fill();

        // Beak
        ctx.beginPath();
        ctx.moveTo(16, -1);
        ctx.lineTo(22, 2);
        ctx.lineTo(16, 5);
        ctx.closePath();
        ctx.fillStyle = '#E76F51';
        ctx.fill();

        // Shield badge
        ctx.font = '10px sans-serif';
        ctx.fillText('🛡️', -6, 5);

        ctx.restore();
    };

    const drawGround = (ctx) => {
        const gGrad = ctx.createLinearGradient(0, CANVAS_H - GROUND_HEIGHT, 0, CANVAS_H);
        gGrad.addColorStop(0, '#1B4332');
        gGrad.addColorStop(1, '#081C15');
        ctx.fillStyle = gGrad;
        ctx.fillRect(0, CANVAS_H - GROUND_HEIGHT, CANVAS_W, GROUND_HEIGHT);
        ctx.fillStyle = '#2DC653';
        ctx.fillRect(0, CANVAS_H - GROUND_HEIGHT, CANVAS_W, 4);
    };

    const drawBackground = (ctx) => {
        if (bgImgRef.current) {
            ctx.drawImage(bgImgRef.current, 0, 0, CANVAS_W, CANVAS_H);
        } else {
            const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
            bg.addColorStop(0, '#0A2540');
            bg.addColorStop(0.5, '#023E8A');
            bg.addColorStop(1, '#0096C7');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
    };

    // ── Main loop ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isActive) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        initState();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });

        const loop = () => {
            if (!isActiveRef.current) return;
            const s = stateRef.current;

            // Update clouds
            s.clouds.forEach((c) => {
                c.x -= c.speed;
                if (c.x + c.w / 2 < 0) {
                    c.x = CANVAS_W + c.w / 2;
                    c.y = rand(40, CANVAS_H * 0.5);
                }
            });

            if (!gameStarted) {
                // Keep bird hovering vertically loosely for effect
                s.bird.y += Math.sin(Date.now() / 200) * 0.8;
                s.bird.rotation = 0;
            } else {
                // Update bird physics
                s.bird.vy += GRAVITY;
                s.bird.y += s.bird.vy;
                s.bird.rotation = Math.max(MAX_ROTATION_UP, Math.min(MAX_ROTATION_DOWN, s.bird.vy * ROTATION_FACTOR));

                // Spawn pipes
                const lastPipe = s.pipes[s.pipes.length - 1];
                if (!lastPipe || lastPipe.x < CANVAS_W - SPAWN_GAP) {
                    const newPipe = createPipe(s.hurdleIndex++);
                    s.pipes.push(newPipe);
                    setCurrentHurdle(newPipe.hurdle);
                }

                // Update pipes
                s.pipes.forEach((pipe) => { pipe.x -= PIPE_SPEED; });
                s.pipes = s.pipes.filter((p) => p.x + PIPE_WIDTH > -10);

                // Collision & scoring
                let hitPipe = null;
                for (const pipe of s.pipes) {
                    if (s.bird.x + BIRD_RADIUS > pipe.x && s.bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH) {
                        if (s.bird.y - BIRD_RADIUS < pipe.topH || s.bird.y + BIRD_RADIUS > pipe.bottomY) {
                            hitPipe = pipe;
                            break;
                        }
                    }
                    if (!pipe.passed && pipe.x + PIPE_WIDTH < s.bird.x - BIRD_RADIUS) {
                        pipe.passed = true;
                        scoreRef.current += 1;
                        onScoreRef.current(scoreRef.current);
                        if (MICRO_MESSAGES[scoreRef.current]) {
                            setMicroMsg(MICRO_MESSAGES[scoreRef.current]);
                            setTimeout(() => setMicroMsg(null), 2900);
                        }
                    }
                }

                if (hitPipe || s.bird.y + 17 > CANVAS_H - GROUND_HEIGHT || s.bird.y - 17 < 0) {
                    onHitRef.current(hitPipe ? hitPipe.hurdle : null);
                    return;
                }
            }

            drawBackground(ctx);
            s.clouds.forEach((c) => drawCloud(ctx, c));
            s.pipes.forEach((p) => drawPipe(ctx, p));
            drawGround(ctx);
            drawBird(ctx, s.bird);

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isActive, gameStarted, initState]);

    return { canvasRef, handleFlap, currentHurdle, microMsg };
}
