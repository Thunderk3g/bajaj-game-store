/**
 * BucketBar — Redesigned with icon + label above vertical glass capsules.
 * Shows bucket type icon and name, with liquid fill and percentage.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { TILE_META, BUCKET_MAX } from '../config/gameConfig.js';
import { CheckCircle2 } from 'lucide-react';

const BUCKET_ORDER = ['GREEN', 'BLUE', 'YELLOW', 'RED'];

/* Inline SVG Icons matching the tile icons */
const BucketIcon = ({ type }) => {
    const stroke = 'rgba(255,255,255,0.9)';
    const fill = 'rgba(255,255,255,0.15)';
    const cls = 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm';

    if (type === 'GREEN') return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill={fill} />
            <circle cx="9" cy="7" r="4" fill={fill} />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
    if (type === 'BLUE') return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill={fill} />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
    if (type === 'YELLOW') return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
            <circle cx="12" cy="12" r="10" fill={fill} />
            <path d="M12 6v6l4 2" />
        </svg>
    );
    if (type === 'RED') return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" fill={fill} />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
    return null;
};

const BucketBar = memo(function BucketBar({ buckets }) {
    return (
        <div className="w-full shrink-0 px-3 py-2 pb-safe z-10">
            <div className="flex items-stretch justify-between gap-2">
                {BUCKET_ORDER.map((type) => {
                    const meta = TILE_META[type];
                    const value = Math.min(buckets[type] || 0, BUCKET_MAX);
                    const pct = Math.round((value / BUCKET_MAX) * 100);
                    const isFull = pct >= 100;
                    const color = meta.color;

                    return (
                        <div key={type} className="flex flex-col items-center flex-1 gap-1">

                            {/* Icon & Label Header Container */}
                            <div className="w-full flex flex-col items-center gap-1.5 mb-1">
                                {/* Icon */}
                                <div
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        background: meta.bg,
                                        boxShadow: `0 2px 8px ${meta.glow}`,
                                    }}
                                >
                                    <BucketIcon type={type} />
                                </div>

                                {/* Label Container with Fixed Height to handle 1 vs 2 lines */}
                                <div className="h-6 sm:h-7 w-full flex items-center justify-center">
                                    <span
                                        className={`text-[0.52rem] sm:text-[0.58rem] font-bold uppercase tracking-widest text-center leading-[1.1] transition-colors ${isFull ? 'text-bb-gold drop-shadow-md' : 'text-blue-100/70'}`}
                                    >
                                        {meta.label}
                                    </span>
                                </div>
                            </div>

                            {/* Capsule Container */}
                            <div
                                className={`bucket-capsule w-full relative flex items-end justify-center ${isFull ? 'full' : ''}`}
                                style={{
                                    height: '4.5rem',
                                    borderRadius: '0.6rem',
                                    boxShadow: isFull ? `0 0 20px ${color}66` : undefined,
                                }}
                            >
                                {/* Background Tint */}
                                <div className="absolute inset-0 bg-white/5 rounded-[0.6rem]" />

                                {/* Liquid Fill */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 z-0 overflow-hidden rounded-b-[0.6rem]"
                                    initial={{ height: '0%' }}
                                    animate={{ height: `${pct}%` }}
                                    transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                                >
                                    <div
                                        className="absolute inset-0 opacity-80"
                                        style={{ background: meta.bucketBg }}
                                    />
                                    {/* Wave Overlay */}
                                    <div
                                        className="absolute top-[-10px] left-[-50%] w-[200%] h-6 opacity-40 animate-wave"
                                        style={{ background: `linear-gradient(90deg, transparent, #fff, transparent)` }}
                                    />
                                    {/* Top Gloss Line */}
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40" />
                                </motion.div>

                                {/* Percentage Text */}
                                <div className="absolute bottom-1.5 inset-x-0 text-center z-10">
                                    <span className="font-game text-xs sm:text-sm drop-shadow-md text-white">
                                        {pct}%
                                    </span>
                                </div>

                                {/* Secured Badge */}
                                <AnimatePresence>
                                    {isFull && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5, y: 5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="absolute top-[-8px] inset-x-0 flex justify-center z-20"
                                        >
                                            <div className="bg-[#FFD700] text-[#002147] text-[0.55rem] sm:text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-1 border border-white/40">
                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                Secured
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Full Pulse Effect */}
                                {isFull && (
                                    <motion.div
                                        className="absolute inset-0 rounded-[0.6rem] border-2 border-bb-gold/50"
                                        animate={{ opacity: [0, 1, 0], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
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
