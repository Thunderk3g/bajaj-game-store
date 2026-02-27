import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const MilestoneOverlay = ({ isVisible, message, onDismiss }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onDismiss, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onDismiss]);

    const getIcon = () => {
        if (message?.toLowerCase().includes('insurance')) return <ShieldCheck className="w-12 h-12 text-blue-300" />;
        if (message?.toLowerCase().includes('investment') || message?.toLowerCase().includes('grow')) return <TrendingUp className="w-12 h-12 text-green-300" />;
        if (message?.toLowerCase().includes('quick') || message?.toLowerCase().includes('fast')) return <Zap className="w-12 h-12 text-yellow-300" />;
        return <Sparkles className="w-12 h-12 text-blue-200" />;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.5, y: 100, opacity: 0, rotateX: 45 }}
                        animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ scale: 1.2, opacity: 0, y: -50 }}
                        transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        className="relative w-full max-w-sm bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-1 rounded-[2rem] shadow-[0_0_50px_rgba(30,64,175,0.5)] border border-white/10 overflow-hidden"
                    >
                        {/* Animated Border Glow */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 pointer-events-none"
                        />

                        <div className="relative bg-[#020617]/90 backdrop-blur-xl p-8 rounded-[1.9rem] flex flex-col items-center text-center">
                            {/* Progress Timer Line */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4, ease: "linear" }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_10px_#60a5fa]"
                                />
                            </div>

                            {/* Icon Container */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                transition={{
                                    scale: { delay: 0.2, type: "spring" },
                                    rotate: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                                }}
                                className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner"
                            >
                                {getIcon()}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-2"
                            >
                                <h2 className="text-white text-3xl font-black mb-4 leading-tight tracking-tight">
                                    Milestone <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Reached!</span>
                                </h2>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/5 border border-white/10 p-5 rounded-2xl w-full"
                            >
                                <p className="text-blue-50/90 font-medium text-lg leading-relaxed italic">
                                    "{message}"
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-6 flex items-center gap-2 text-blue-400/60 text-xs uppercase font-bold tracking-widest"
                            >
                                <span className="w-8 h-[1px] bg-blue-400/20" />
                                Resuming Game
                                <span className="w-8 h-[1px] bg-blue-400/20" />
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MilestoneOverlay;
