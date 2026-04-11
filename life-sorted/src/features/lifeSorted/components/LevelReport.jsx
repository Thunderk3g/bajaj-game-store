import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { CATEGORY_CONFIG } from '../constants/categoryConfig';
import { isTubeSorted } from '../utils/tubeHelpers';

const LevelReport = ({ tubes, isWin, onNext, capacity, isVisible }) => {
    const categoryMapping = ['growth', 'safety', 'resp', 'risk', 'asset'];

    // Only count sorted among the first 5 category tubes
    const sortedTubesCount = tubes
        .slice(0, 5)
        .filter(t => t.length === capacity && isTubeSorted(t, capacity)).length;

    // Auto-transition after 6 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onNext();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onNext]);

    const sortedCountText = `${sortedTubesCount} of 5`;
    let icon = <CheckCircle2 className="text-green-500 w-10 h-10" />;
    let title = sortedTubesCount === 5 ? "Perfectly Sorted!" : "Level Complete!";
    let iconBg = "bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]";

    if (!isWin) {
        icon = <AlertCircle className="text-red-500 w-10 h-10" />;
        iconBg = "bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]";
        title = "Time's Up!";
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="bg-[#0B1221] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.15 }}
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg}`}
                            >
                                {icon}
                            </motion.div>
                            <h2 className="text-2xl font-black text-white mb-1">{title}</h2>
                            <p className="text-white/40 text-xs font-bold">
                                {isWin
                                    ? `You sorted ${sortedCountText} tubes correctly.`
                                    : sortedTubesCount === 0
                                        ? "No tubes fully sorted."
                                        : `You sorted ${sortedCountText} tubes.`
                                }
                            </p>
                        </div>

                        {/* Category summary - compact */}
                        <div className="space-y-2 mb-5 max-h-[35dvh] overflow-y-auto pr-1">
                            {categoryMapping.map((cat, idx) => {
                                const config = CATEGORY_CONFIG[cat];
                                const segments = tubes[idx] || [];
                                const sorted = segments.length === capacity && isTubeSorted(segments, capacity);
                                const isEmpty = segments.length === 0;

                                return (
                                    <div
                                        key={cat}
                                        className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/5"
                                        style={{ backgroundColor: sorted ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.02)' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{config.icon}</span>
                                            <span className="text-xs font-black tracking-wider" style={{ color: config.color }}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <span
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10"
                                            style={{
                                                color: sorted ? '#22C55E' : isEmpty ? 'rgba(255,255,255,0.3)' : '#EF4444'
                                            }}
                                        >
                                            {sorted ? '✓ Sorted' : isEmpty ? 'Empty' : '✗ Mixed'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Auto-progress bar */}
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 6, ease: 'linear' }}
                                className="h-full bg-gold rounded-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelReport;
