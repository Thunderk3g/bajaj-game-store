/**
 * Confetti — Performance-Optimized Canvas Celebration
 * ══════════════════════════════════════════════════════════
 * OPTIMIZATIONS:
 * - Reduced particles: 150 → 60 (low-end: 30)
 * - Auto-stops after 4s (was 5s)
 * - Throttles to 30fps on low-end devices
 * - Cleans up all resources on unmount
 * ══════════════════════════════════════════════════════════
 */
import { useEffect, useRef } from 'react';

const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 3;
const PARTICLE_COUNT = isLowEnd ? 30 : 60;
const FRAME_INTERVAL = isLowEnd ? 33 : 16; // ~30fps vs ~60fps

const Confetti = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const colors = ['#0066B2', '#FF8C00', '#ffffff', '#FFD700', '#00A3E0'];
        const pieces = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pieces.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                rotation: Math.random() * 360,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 + 2,
            });
        }

        let animationId;
        let lastTime = 0;
        let running = true;

        const animate = (timestamp) => {
            if (!running) return;

            // Throttle frame rate on low-end
            if (timestamp - lastTime < FRAME_INTERVAL) {
                animationId = requestAnimationFrame(animate);
                return;
            }
            lastTime = timestamp;

            ctx.clearRect(0, 0, width, height);
            for (const p of pieces) {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += 2;
                if (p.y > height) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        // Auto-stop after 4s
        const timer = setTimeout(() => {
            running = false;
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, width, height);
        }, 4000);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            running = false;
            cancelAnimationFrame(animationId);
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100]"
        />
    );
};

export default Confetti;
