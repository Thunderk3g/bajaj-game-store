import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GAME_STATUS } from '../store/useGameStore';
import { Trophy, Fuel, Coins as CoinsIcon, Navigation } from 'lucide-react';

const GameOverScreen = () => {
    const { score, distance, coins, fuel, setStatus } = useGameStore();

    const isBalanced = fuel > 0 && coins > 0;
    const message = fuel <= 0 
        ? "Wealth grew, but protection ended the journey."
        : coins === 0 
            ? "Safe journey, but limited growth for your future goals."
            : "Perfectly balanced! You've secured a strong future.";

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 bg-[#0B1221] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm glass-dark rounded-[40px] p-8 border border-white/10 relative"
            >
                {/* Result Icon */}
                <div className="flex justify-center -mt-16 mb-6">
                    <div className="bg-secondary p-5 rounded-3xl shadow-2xl shadow-secondary/20 rotate-3">
                        <Trophy size={48} className="text-primary fill-primary/10" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">
                        JOURNEY <span className="text-secondary">PAUSED</span>
                    </h2>
                    <p className="text-gray-400 text-xs font-bold leading-tight px-4 italic">
                        "{message}"
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-1 text-gray-500">
                            <Navigation size={14} />
                            <span className="text-[10px] font-black uppercase">Distance</span>
                        </div>
                        <p className="text-2xl font-black text-white">{Math.floor(distance)}m</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-1 text-secondary">
                            <CoinsIcon size={14} />
                            <span className="text-[10px] font-black uppercase">Wealth</span>
                        </div>
                        <p className="text-2xl font-black text-secondary">{coins}</p>
                    </div>
                </div>

                {/* Balance Meter Visual */}
                <div className="mb-8 px-2">
                    <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Financial Balance</span>
                        <span className="text-[10px] font-black uppercase text-secondary tracking-widest">
                            {isBalanced ? 'STABLE' : 'RISKY'}
                        </span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isBalanced ? '100%' : '40%' }}
                            className={`h-full rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setStatus(GAME_STATUS.LEAD_CAPTURE)}
                    className="btn-secondary w-full py-5 text-xl font-black tracking-tight flex items-center justify-center gap-3 shadow-2xl"
                >
                    CONTINUE JOURNEY
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Navigation className="rotate-90 fill-primary" size={20} />
                    </motion.div>
                </button>
            </motion.div>

            <p className="mt-8 text-gray-600 text-[10px] font-black tracking-widest uppercase">
                Plan Your Future Summit Today
            </p>
        </div>
    );
};

export default GameOverScreen;
