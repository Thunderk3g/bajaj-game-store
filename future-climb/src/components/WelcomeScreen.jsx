import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Play } from 'lucide-react';

const WelcomeScreen = () => {
    const { setStatus } = useGameStore();

    return (
        <div className="relative w-full h-full flex flex-col justify-end items-center bg-[#090d16] overflow-hidden p-6">
            {/* Background Image (Shifted up with pb-24, and blended edges) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none pb-24">
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src="./assets/ui/Thumbnail Future Climb.webp"
                        alt="Future Climb Background"
                        className="w-full h-full object-contain"
                    />

                    {/* Edge-Blending Gradient Overlays */}
                    {/* Top Edge Fade */}
                    <div className="absolute top-0 left-0 right-0 h-1/5 bg-gradient-to-b from-[#090d16] to-transparent z-10" />
                    {/* Bottom Edge Fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#090d16] to-transparent z-10" />
                    {/* Left Edge Fade */}
                    <div className="absolute top-0 bottom-0 left-0 w-1/12 bg-gradient-to-r from-[#090d16] to-transparent z-10" />
                    {/* Right Edge Fade */}
                    <div className="absolute top-0 bottom-0 right-0 w-1/12 bg-gradient-to-l from-[#090d16] to-transparent z-10" />
                </div>
            </div>

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />

            {/* Play Button - Positioned below the main artwork */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 mb-10 w-full flex justify-center"
            >
                <button
                    onClick={() => setStatus(GAME_STATUS.PLAYING)}
                    className="btn-secondary group relative overflow-hidden px-14 py-5 flex items-center gap-3 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative font-black text-xl tracking-tight">PLAY</span>
                    <Play size={24} className="relative fill-primary" />
                </button>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
