/**
 * Background — Performance-Optimized Ambient Background
 * ══════════════════════════════════════════════════════════
 * OPTIMIZATIONS:
 * - Replaced 12 Framer Motion particles with CSS-only animation
 * - Replaced Framer Motion gradient blurs with CSS animations
 * - Removed window.innerWidth/Height calls during render
 * - Auto-detects low-end devices and disables particles
 * - Uses will-change: transform for GPU compositing
 * ══════════════════════════════════════════════════════════
 */
import { memo, useMemo } from 'react';

// Check device performance on load
const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 3;

const Background = memo(function Background() {
    // Generate particle positions once (stable across re-renders)
    const particles = useMemo(() => {
        if (isLowEnd) return []; // Skip particles on low-end devices
        const count = 6; // Reduced from 12
        return Array.from({ length: count }, (_, i) => ({
            key: i,
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 10) % 100}%`,
            delay: `${i * 0.8}s`,
            duration: `${5 + (i % 3) * 2}s`,
        }));
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-cinematic">
            {/* Grid Texture — pure CSS, zero cost */}
            <div className="absolute inset-0 grid-texture opacity-20" />

            {/* Ambient Gradient Blurs — CSS animation, no Framer Motion */}
            {!isLowEnd && (
                <>
                    <div className="bg-ambient-1" />
                    <div className="bg-ambient-2" />
                </>
            )}

            {/* Dust Motes — CSS-only animation */}
            {particles.map((p) => (
                <div
                    key={p.key}
                    className="bg-particle"
                    style={{
                        left: p.left,
                        top: p.top,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
        </div>
    );
});

export default Background;
