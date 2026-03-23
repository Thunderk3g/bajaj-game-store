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
            particles: [], // For feathers
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

        // Restore individual feather particles
        for (let i = 0; i < 3; i++) {
            stateRef.current.particles.push({
                x: stateRef.current.bird.x - 10,
                y: stateRef.current.bird.y,
                vx: -rand(1, 4),
                vy: rand(-2, 2),
                size: rand(4, 7),
                life: 1.0,
                rotation: rand(0, Math.PI * 2),
                spin: rand(-0.1, 0.1)
            });
        }
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
        const baseColor = '#2C3E50';
        const accentColor = color;
        const capColor = baseColor;

        // ── Top pipe ─
        const grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        grad.addColorStop(0, '#34495E');
        grad.addColorStop(0.4, baseColor);
        grad.addColorStop(1, '#1A252F');
        ctx.fillStyle = grad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topH);

        ctx.fillStyle = capColor;
        ctx.fillRect(pipe.x - 4, pipe.topH - 22, PIPE_WIDTH + 8, 22);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x - 4, pipe.topH - 22, PIPE_WIDTH + 8, 22);

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = accentColor;
        ctx.fillRect(pipe.x - 4, pipe.topH - 4, PIPE_WIDTH + 8, 4);
        ctx.globalAlpha = 1;

        // ── Bottom pipe ─
        const bGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        bGrad.addColorStop(0, '#34495E');
        bGrad.addColorStop(0.4, baseColor);
        bGrad.addColorStop(1, '#1A252F');
        ctx.fillStyle = bGrad;
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, CANVAS_H - pipe.bottomY - GROUND_HEIGHT);

        ctx.fillStyle = capColor;
        ctx.fillRect(pipe.x - 4, pipe.bottomY, PIPE_WIDTH + 8, 22);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x - 4, pipe.bottomY, PIPE_WIDTH + 8, 22);

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = accentColor;
        ctx.fillRect(pipe.x - 4, pipe.bottomY, PIPE_WIDTH + 8, 4);
        ctx.globalAlpha = 1;

        // ── Hurdle labels (Centered & Scaled) ─
        ctx.save();
        ctx.font = '900 13px "Inter", sans-serif'; // Reduced from 16px to 13px
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Top Pipe Text
        ctx.save();
        ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.topH / 2);
        ctx.rotate(-Math.PI / 2);
        // Max width set to pipe height minus padding, scaling if needed
        ctx.fillText(pipe.hurdle.name, 0, 0, pipe.topH - 40);
        ctx.restore();

        // Bottom Pipe Text
        ctx.save();
        const bottomContentHeight = CANVAS_H - pipe.bottomY - GROUND_HEIGHT;
        ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.bottomY + bottomContentHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(pipe.hurdle.name, 0, 0, bottomContentHeight - 40);
        ctx.restore();

        ctx.restore();
    };

    const drawBird = (ctx, bird) => {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation);

        // Body - Bright Yellow
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#F7DB5E';
        ctx.fill();
        ctx.strokeStyle = '#3C2218'; // Darker brown/black for outline
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Eye - Big White Eye
        ctx.beginPath();
        ctx.ellipse(8, -5, 7, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#3C2218';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pupil
        ctx.beginPath();
        ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Beak - Big Orange Beak (Flat/Rounded like image)
        ctx.beginPath();
        ctx.moveTo(12, -2);
        ctx.quadraticCurveTo(30, -2, 30, 4);
        ctx.quadraticCurveTo(30, 10, 12, 10);
        ctx.closePath();
        ctx.fillStyle = '#E65D39'; // Reddish-orange beak
        ctx.fill();
        ctx.strokeStyle = '#3C2218';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Beak Line
        ctx.beginPath();
        ctx.moveTo(12, 4);
        ctx.lineTo(30, 4);
        ctx.stroke();

        // Wing - On Side (Like image)
        const flap = Math.sin(Date.now() / 60);
        ctx.save();
        ctx.translate(-10, 2 + (flap * 2));
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#3C2218';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    };

    const drawFeather = (ctx, p) => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
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

            // Update particles (Feathers)
            s.particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // Gravity on feathers
                p.vx *= 0.96; // Friction
                p.life -= 0.02;
                p.rotation += p.spin;
            });
            s.particles = s.particles.filter(p => p.life > 0);

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
                    const hitType = hitPipe ? hitPipe.hurdle : (s.bird.y - 17 < 0 ? { isBoundary: true, type: 'top' } : { isBoundary: true, type: 'ground' });
                    onHitRef.current(hitType);
                    return;
                }
            }

            drawBackground(ctx);
            s.clouds.forEach((c) => drawCloud(ctx, c));
            s.pipes.forEach((p) => drawPipe(ctx, p));
            drawGround(ctx);
            s.particles.forEach((p) => drawFeather(ctx, p));
            drawBird(ctx, s.bird);

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isActive, gameStarted, initState]);

    return { canvasRef, handleFlap, currentHurdle, microMsg };
}
