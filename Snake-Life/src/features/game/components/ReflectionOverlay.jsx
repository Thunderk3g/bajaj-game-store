import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, GAME_STATUS } from '../context/GameContext';

const ReflectionOverlay = () => {
    const { status, reflectionMessage, score, setStatus } = useGame();
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (status === GAME_STATUS.GAMEOVER) {
            // Phaser logic for Game Over Sequence
            const timers = [
                setTimeout(() => setPhase(1), 300),   // Phase 1 (0.3s)
                setTimeout(() => setPhase(2), 2500),  // Phase 2 (2.5s)
                setTimeout(() => setPhase(3), 5500),  // Phase 3 (5.5s)
                setTimeout(() => {
                    setStatus(GAME_STATUS.CTA);
                    setPhase(0);
                }, 10500) // Auto transition at 10.5s
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [status, setStatus]);

    if (status === GAME_STATUS.REFLECTION) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="glass-card p-8 text-center space-y-6 max-w-[280px] shadow-2xl border-white/30"
                >
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary text-xl font-bold leading-tight"
                    >
                        Your family's dependency just grew.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-secondary text-2xl font-black leading-tight drop-shadow-sm bg-primary py-3 px-4 rounded-xl"
                    >
                        Is your protection growing too?
                    </motion.p>
                </motion.div>
            </motion.div>
        );
    }

    if (status === GAME_STATUS.GAMEOVER) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-primary/95 backdrop-blur-md text-white text-center cursor-pointer"
                onClick={() => setStatus(GAME_STATUS.CTA)}
            >
                <div className="max-w-[300px] w-full">
                    <AnimatePresence mode="wait">
                        {phase === 1 && (
                            <motion.div
                                key="phase1"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className="sh:space-y-2"
                            >
                                <h2 className="text-xl opacity-80 mb-2">You built a life of</h2>
                                <div className="text-7xl font-black text-secondary drop-shadow-lg">{score}</div>
                                <p className="text-xl mt-2">milestones</p>
                            </motion.div>
                        )}

                        {phase === 2 && (
                            <motion.div
                                key="phase2"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className="space-y-6 sh:space-y-4"
                            >
                                <h2 className="text-3xl font-bold leading-tight">If life stopped here…</h2>
                                <p className="text-xl opacity-90">Would your family be financially okay?</p>
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <p className="text-secondary font-black text-lg">The bigger your life grows… The stronger your protection should be.</p>
                                </div>
                            </motion.div>
                        )}

                        {phase === 3 && (
                            <motion.div
                                key="phase3"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className="space-y-6 sh:space-y-4"
                            >
                                <h2 className="text-3xl font-bold italic">"Growth brings joy."</h2>
                                <p className="text-xl opacity-90">But also responsibility.</p>
                                <div className="bg-secondary text-primary p-4 rounded-2xl font-black text-lg">
                                    One wrong turn shouldn’t end everything.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
                    className="absolute bottom-12 left-0 right-0 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40"
                >
                    Tap to Skip
                </motion.div>
            </motion.div>
        );
    }

    return null;
};

export default ReflectionOverlay;
