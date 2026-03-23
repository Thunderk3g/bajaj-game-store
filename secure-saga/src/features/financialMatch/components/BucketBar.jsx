/**
 * BucketBar — Footer 4-column layout pixel-perfect to reference.
 * 4 equal columns.
 * Floating Object -> Gem Jar (with badge) -> Label -> Progress Bar -> % Text
 */
import { memo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { TILE_META, BUCKET_MAX } from '../config/gameConfig.js';
import { CheckCircle2 } from 'lucide-react';

import largeGreen from '../../assets/image/tiles/green_shield.png';
import largeBlue from '../../assets/image/tiles/blue_graduation.png';
import largeYellow from '../../assets/image/tiles/gold_coin.png';
import largeRed from '../../assets/image/tiles/red_briefcase.png';

const BUCKET_ORDER = ['GREEN', 'BLUE', 'YELLOW', 'RED'];

const FLOATING_ASSETS = {
    GREEN: largeGreen,
    BLUE: largeBlue,
    YELLOW: largeYellow,
    RED: largeRed,
};

const BADGE_COLORS = {
    GREEN: '#16A34A',
    BLUE: '#2563EB',
    YELLOW: '#EA580C',
    RED: '#DC2626',
};

const BucketBar = memo(function BucketBar({ buckets }) {
    // Isolated tracking of score jumps and accumulative counts for BucketBar natively.
    const [matchCounts, setMatchCounts] = useState({ GREEN: 0, BLUE: 0, YELLOW: 0, RED: 0 });
    // Initialize empty array for natural dynamic gameplay spawns.
    const [floaters, setFloaters] = useState([]);
    const prevBucketsRef = useRef({ ...buckets });

    // Watch for actual bucket point accumulation natively avoiding global Redux refactors.
    useEffect(() => {
        let hasChanges = false;
        const newFloaters = [];

        for (const type of BUCKET_ORDER) {
            const current = buckets[type] || 0;
            const prev = prevBucketsRef.current[type] || 0;
            const diff = current - prev;

            if (diff > 0) {
                const fId = Date.now() + Math.random();
                newFloaters.push({
                    id: fId,
                    type,
                    value: `+${diff}`,
                    offset: Math.random() * 8 - 4 // Slight random X staggering so stacks look organic
                });

                // Track accumulative matches properly!
                setMatchCounts(prevCounts => ({
                    ...prevCounts,
                    [type]: prevCounts[type] + 1
                }));
                hasChanges = true;
            }
        }

        if (hasChanges) {
            setFloaters(curr => [...curr, ...newFloaters]);
            // Schedule automated cleanup precisely per the 1.2s flight + 0.3s fade timings
            newFloaters.forEach(nf => {
                setTimeout(() => {
                    setFloaters(curr => curr.filter(item => item.id !== nf.id));
                }, 1500);
            });
        }

        prevBucketsRef.current = { ...buckets };
    }, [buckets]);

    return (
        <div className="w-full shrink-0 px-2 pt-2 mb-0 pb-0 z-10" style={{ minHeight: '28vh' }}>
            <div className="flex items-end justify-between w-full h-full gap-1">
                {BUCKET_ORDER.map((type, index) => {
                    const meta = TILE_META[type];
                    const value = Math.min(buckets[type] || 0, BUCKET_MAX);
                    const pct = Math.round((value / BUCKET_MAX) * 100);
                    const isFull = pct >= 100;

                    const floatingImg = FLOATING_ASSETS[type];
                    const isLast = index === BUCKET_ORDER.length - 1;
                    const bColor = BADGE_COLORS[type];

                    // Text labels split for 2 lines
                    const labelText = meta.label.toUpperCase();
                    const labelLines = labelText.replace(' ', '\n');

                    const count = matchCounts[type] || 0;

                    return (
                        <div key={type} className="flex flex-col items-center justify-end flex-1 h-full max-w-[97px] pb-0" style={{ minWidth: 0 }}>

                            <div className="relative w-full flex justify-center">
                                {/* [A2] FLOATING SCORE POP DISPLAYS (Dynamic array rendering mapping directly over icons) */}
                                <AnimatePresence>
                                    {floaters.filter(f => f.type === type).slice(-3).map((floater, i) => (
                                        <motion.div
                                            key={floater.id}
                                            initial={{ opacity: 0, y: -40, scale: 0.8 }}
                                            animate={{ opacity: [0, 1, 1, 0], y: 30, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1.2, ease: "easeIn", delay: i * 0.15 }}
                                            className="absolute z-50 rounded-[8px] flex items-center justify-center pointer-events-none px-2 shadow-2xl"
                                            style={{
                                                backgroundColor: 'rgba(13, 27, 62, 0.8)',
                                                border: `2px solid ${bColor}`,
                                                boxShadow: `0 0 10px ${bColor}80`,
                                                minWidth: '50px',
                                                height: '24px',
                                                top: '-20px', // Starts anchor slightly above the bucket icon
                                                marginLeft: floater.offset + 'px'
                                            }}
                                        >
                                            <span
                                                className="text-white font-bold leading-none"
                                                style={{
                                                    fontSize: '18px', // Scaled slightly down from 28px strictly so it physically fits the requested 50x24px badge safely
                                                    fontFamily: "'Inter', sans-serif",
                                                    textShadow: `
                                                      -1px -1px 0 ${bColor},  
                                                       1px -1px 0 ${bColor},
                                                      -1px  1px 0 ${bColor},
                                                       1px  1px 0 ${bColor}
                                                    `
                                                }}
                                            >
                                                {floater.value}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* [A] Floating Object ONLY - Scaled down dynamically as requested so they adjust to content without overlapping */}
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                                    className="relative z-30 flex justify-center items-end h-[50px] min-[360px]:h-[60px] sm:h-[70px] mb-1 sm:mb-2"
                                >
                                    <img src={floatingImg} alt={meta.label} className="h-full w-full object-contain filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.8)]" draggable={false} />
                                </motion.div>
                            </div>

                            {/* [D] Label Text */}
                            <div className="mt-1 min-h-[40px] flex items-center justify-center w-full px-1">
                                <span className="text-[10px] min-[360px]:text-xs sm:text-sm leading-[1.1] font-black text-white text-center whitespace-pre-line drop-shadow-lg tracking-wide uppercase">
                                    {labelLines}
                                </span>
                            </div>

                            {/* [E] Progress Bar */}
                            <div className="w-full mt-1 mb-0.5 px-2">
                                <div className="w-full h-2 rounded-full overflow-hidden bg-[#0D1B3E] shadow-inner border border-white/10">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: isFull ? '#FBBF24' : meta.color }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${pct}%`, backgroundColor: meta.color }}
                                        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                                    />
                                </div>
                            </div>

                            {/* [F] Percentage Text */}
                            <div className="w-full flex items-center mt-1 justify-center relative">
                                <span className="text-sm sm:text-base font-black tracking-wide text-white drop-shadow-md">
                                    {pct}%
                                    {isLast && (
                                        <span className="inline-block ml-0.5" style={{ color: '#D4A017' }}>✦</span>
                                    )}
                                </span>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
});

BucketBar.propTypes = {
    buckets: PropTypes.object.isRequired,
};

export default BucketBar;
