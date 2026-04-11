import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Segment from './Segment';

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FF9FF3', '#54A0FF'];

const ConfettiParticle = ({ color, delay, angle, distance, rotation }) => (
    <motion.div
        className="absolute w-2 h-2 z-50 pointer-events-none"
        style={{
            backgroundColor: color,
            top: '50%',
            left: '50%',
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
        }}
        initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
        animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.5],
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            rotate: rotation,
        }}
        transition={{ duration: 1.5, delay, ease: [0.1, 0.6, 0.3, 1] }}
    />
);

const Tube = ({
    segments,
    capacity,
    isSelected,
    isValidTarget,
    isSorted,
    isNewlySorted,
    onClick,
    index
}) => {
    // Generate confetti particles for more "pop"
    const confettiParticles = useMemo(() => {
        if (!isNewlySorted) return [];
        return Array.from({ length: 24 }, (_, i) => ({
            id: i,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            delay: Math.random() * 0.1,
            angle: (i / 24) * Math.PI * 2 + (Math.random() * 0.4 - 0.2),
            distance: 60 + Math.random() * 60,
            rotation: Math.random() * 720 - 360
        }));
    }, [isNewlySorted]);

    return (
        <motion.div
            animate={{
                y: 0,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => onClick(index)}
            className={`
                relative w-[3.8rem] h-[12.5rem] sh:w-[2.8rem] sh:h-[9rem] sm:w-[4.5rem] sm:h-[14rem] flex flex-col-reverse
                glass-tube cursor-pointer transition-colors duration-300
                ${isSelected ? 'ring-2 ring-gold shadow-[0_0_30px_rgba(245,200,66,0.6)] z-50' : 'border border-white/10 z-0'}
                ${isValidTarget ? 'ring-2 ring-teal-400/50 animate-pulse-border shadow-[0_0_15px_rgba(45,212,191,0.3)] z-40' : 'z-0'}
                ${isSorted ? 'sorted-tube ring-2 ring-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] z-20' : 'z-0'}
            `}
        >
            {/* Inner Liquid Container */}
            <div className="h-full w-full flex flex-col-reverse overflow-hidden" style={{ borderRadius: '0 0 41px 41px' }}>
                <AnimatePresence mode="popLayout">
                    {segments.map((segment, idx) => (
                        <Segment
                            key={segment.instanceId}
                            element={segment}
                            isTop={idx === segments.length - 1}
                            isBottom={idx === 0}
                            heightPct={100 / capacity}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Sorted "Graffiti" Seal */}
            <AnimatePresence>
                {isSorted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 3, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: -15 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                        <div className="relative">
                            {/* Glow Backing */}
                            <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full scale-150" />

                            {/* The Seal */}
                            <div className="bg-white/10 backdrop-blur-md border-2 border-green-400/40 w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                                >
                                    <Check className="text-green-400 w-9 h-9 stroke-[4]" />
                                </motion.div>

                                <span className="absolute -bottom-2 bg-green-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg transform rotate-6 scale-110">
                                    SORTED
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confetti Burst for Newly Sorted */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                {isNewlySorted && confettiParticles.map(p => (
                    <ConfettiParticle key={p.id} {...p} />
                ))}
            </div>

            {/* Perspective Shadow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-3 bg-black/15 blur-lg rounded-full pointer-events-none" />
        </motion.div>
    );
};

export default Tube;
