/**
 * BucketBar — Performance-Optimized Bucket Display
 * ══════════════════════════════════════════════════════════
 * OPTIMIZATIONS:
 * - Removed Framer Motion (liquid fill uses CSS transition)
 * - Removed continuous wave animation (only animates on change)
 * - Removed backdrop-filter: blur (expensive on mobile)
 * - Liquid fill uses CSS transform: scaleY() instead of height animation
 * - Custom memo comparator to only re-render when buckets change
 * ══════════════════════════════════════════════════════════
 */
import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TILE_META, BUCKET_MAX } from '../config/gameConfig.js';

const BUCKET_ORDER = ['GREEN', 'BLUE', 'YELLOW', 'RED'];

const BucketBar = memo(function BucketBar({ buckets }) {
    return (
        <div className="w-full shrink-0 px-4 py-3 pb-safe z-10">
            <div className="flex items-end justify-between gap-3 h-32 sm:h-36">
                {BUCKET_ORDER.map((type) => (
                    <BucketCapsule key={type} type={type} value={buckets[type] || 0} />
                ))}
            </div>
        </div>
    );
});

// Individual bucket — memoized, only re-renders when its value changes
const BucketCapsule = memo(function BucketCapsule({ type, value }) {
    const meta = TILE_META[type];
    const clampedValue = Math.min(value, BUCKET_MAX);
    const pct = Math.round((clampedValue / BUCKET_MAX) * 100);
    const isFull = pct >= 100;
    const prevPctRef = useRef(0);
    const fillRef = useRef(null);

    // Animate fill only when percentage actually changes
    useEffect(() => {
        if (prevPctRef.current !== pct && fillRef.current) {
            fillRef.current.style.transform = `scaleY(${pct / 100})`;
            prevPctRef.current = pct;
        }
    }, [pct]);

    return (
        <div className="flex flex-col items-center gap-2 flex-1 h-full relative">
            {/* Label */}
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider text-center leading-tight ${isFull ? 'text-bb-gold' : 'text-blue-200/60'}`}>
                {meta.label.split(' ')[0]}
            </span>

            {/* Capsule */}
            <div className={`bucket-capsule-perf w-full flex-1 relative flex items-end justify-center ${isFull ? 'bucket-full' : ''}`}>
                {/* Background tint */}
                <div className="absolute inset-0 bg-white/5 rounded-[inherit]" />

                {/* Liquid Fill — CSS transform: scaleY for GPU acceleration */}
                <div
                    ref={fillRef}
                    className="bucket-fill"
                    style={{
                        background: meta.bucketBg,
                        transform: `scaleY(${pct / 100})`,
                    }}
                />

                {/* Top line accent */}
                {pct > 0 && (
                    <div
                        className="absolute left-0 right-0 h-[2px] bg-white/30 z-[2]"
                        style={{
                            bottom: `${pct}%`,
                            transition: 'bottom 0.4s ease-out',
                        }}
                    />
                )}

                {/* Percentage Text */}
                <div className="absolute bottom-2 inset-x-0 text-center z-10">
                    <span className="font-game text-sm sm:text-base text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {pct}%
                    </span>
                </div>

                {/* Secured Badge */}
                {isFull && (
                    <div className="bucket-secured-badge">
                        <span className="bg-bb-gold text-bb-navy text-[0.5rem] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            ✓ Secured
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}, (prev, next) => prev.value === next.value && prev.type === next.type);

BucketBar.propTypes = {
    buckets: PropTypes.object.isRequired,
};

export default BucketBar;
