import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';

const ThankYouScreen = () => {
    const { setStatus, resetGame } = useGameStore();

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 bg-[#0B1221] text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
            >
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"
                    />
                    <CheckCircle size={100} className="text-green-500 relative z-10" />
                </div>
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-white mb-4 tracking-tighter"
            >
                THANK YOU!
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 font-bold mb-12 max-w-[280px]"
            >
                We have received your details. Our financial expert will connect with you shortly to help plan your future climb.
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 w-full max-w-xs"
            >
                <button
                    onClick={() => {
                        resetGame();
                        setStatus(GAME_STATUS.START);
                    }}
                    className="btn-secondary w-full flex items-center justify-center gap-2 group"
                >
                    PLAY AGAIN
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-[10px] text-gray-600 font-black tracking-widest uppercase">
                    Bajaj Allianz Life Insurance
                </p>
            </motion.div>
        </div>
    );
};

export default ThankYouScreen;
