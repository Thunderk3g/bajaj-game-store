import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Trophy } from 'lucide-react';

const GameOverScreen = ({ score, onNext }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-md z-[200] p-6 text-center"
        >
            <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full max-w-sm relative"
            >
                {/* Subtle Background Glow */}
                <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full" />

                <div className="relative bg-white/10 p-8 rounded-[3rem] border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl">
                    {/* Top Decorative Element */}
                    <div className="flex justify-center mb-8">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="bg-white/10 p-5 rounded-[2rem] border border-white/10 shadow-inner"
                        >
                            <AlertCircle className="w-12 h-12 text-white" />
                        </motion.div>
                    </div>

                    <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">
                        Game Over
                    </h2>

                    <div className="space-y-6 mb-10">
                        <p className="text-white font-medium text-lg leading-snug tracking-tight">
                            "No worries — this is just a game"
                        </p>
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-blue-300 font-bold text-sm uppercase tracking-[0.15em] leading-relaxed">
                                "Real life doesn’t give many chances. Planning ahead matters"
                            </p>
                        </div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default GameOverScreen;
