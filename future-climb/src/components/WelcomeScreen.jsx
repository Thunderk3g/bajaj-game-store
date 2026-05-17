import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Play } from 'lucide-react';

const WelcomeScreen = () => {
    const { setStatus } = useGameStore();

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0B1221] overflow-hidden px-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-radial from-primary/20 via-transparent to-transparent"
                />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Thumbnail */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 mb-8"
            >
                <img 
                    src="/assets/ui/thumbnail.png" 
                    alt="Future Climb" 
                    className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl"
                />
            </motion.div>

            {/* Play Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
            >
                <button 
                    onClick={() => setStatus(GAME_STATUS.PLAYING)}
                    className="btn-secondary group relative overflow-hidden px-12 py-5 flex items-center gap-3"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative font-black text-xl tracking-tight">START JOURNEY</span>
                    <Play size={24} className="relative fill-primary" />
                </button>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
