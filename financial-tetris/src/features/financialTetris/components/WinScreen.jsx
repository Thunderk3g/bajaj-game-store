import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

const WinScreen = ({ onNext }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md z-[100] p-6 text-center"
        >
            {/* Background Particles/Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-1/4 -right-1/4 w-full h-full bg-blue-500 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1],
                        rotate: [0, -90, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-purple-600 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="relative w-full max-w-sm"
            >
                {/* Shine Animation Container */}
                <div className="relative bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(30,64,175,0.3)] overflow-hidden">

                    {/* Animated Shine Effect */}
                    <motion.div
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none"
                    />

                    <div className="flex justify-center mb-8 relative">
                        {/* Trophy Halo */}
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"
                        />
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="relative z-10 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl"
                        >
                            <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        </motion.div>

                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-2 -right-2 text-yellow-300"
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-black mb-6 leading-tight tracking-tight">
                            <span className="text-white">You </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
                                Survived!
                            </span>
                        </h2>
                    </motion.div>

                    <div className="space-y-6 mb-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="text-blue-100/90 font-medium text-lg leading-relaxed italic">
                                "You successfully built your financial health in this game."
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-6 border-t border-white/10"
                        >
                            <p className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-sm leading-relaxed">
                                Build your financial health in real life too.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Celebration Particles can be added here if needed */}
            </motion.div>
        </motion.div>
    );
};

export default WinScreen;
