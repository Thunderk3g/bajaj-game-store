import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Mountain, Shield, TrendingUp, Play } from 'lucide-react';

const WelcomeScreen = () => {
    const { setStatus } = useGameStore();

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0B1221] overflow-hidden px-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-radial from-primary/20 via-transparent to-transparent"
                />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Game Logo/Title Area */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center mb-12"
            >
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-secondary/10 rounded-full scale-150 blur-xl"
                        />
                        <div className="relative bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
                            <Mountain size={48} className="text-secondary" />
                        </div>
                    </div>
                </div>
                
                <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic">
                    FUTURE <span className="text-secondary">CLIMB</span>
                </h1>
                <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">
                    Navigate Your Life's Journey
                </p>
            </motion.div>

            {/* Info Cards */}
            <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-dark p-4 rounded-2xl"
                >
                    <div className="bg-primary/20 p-2 w-fit rounded-lg mb-2">
                        <Shield size={20} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1">PROTECTION</h3>
                    <p className="text-[10px] text-gray-400 leading-tight">Keep fuel levels high to survive the journey.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-dark p-4 rounded-2xl"
                >
                    <div className="bg-secondary/20 p-2 w-fit rounded-lg mb-2">
                        <TrendingUp size={20} className="text-secondary" />
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1">GROWTH</h3>
                    <p className="text-[10px] text-gray-400 leading-tight">Collect coins to build your future wealth.</p>
                </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
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
                
                <p className="mt-6 text-gray-500 text-[10px] uppercase font-bold tracking-widest text-center">
                    A Bajaj Life Insurance Initiative
                </p>
            </motion.div>

            {/* Bottom Graphic */}
            <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none opacity-20">
                <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
                    <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </div>
    );
};

export default WelcomeScreen;
