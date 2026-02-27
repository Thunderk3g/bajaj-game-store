/**
 * GameHUD — Top bar showing timer, health, score during gameplay.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import { Clock, Heart, Zap, X } from 'lucide-react';

const GameHUD = memo(function GameHUD({ timeLeft, health, score, onExit }) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const isLowTime = timeLeft <= 15;

    return (
        <div className="glass-header w-full px-5 py-4 flex items-center justify-between relative z-30 border-b border-white/10">
            {/* Timer */}
            <div className={`flex flex-col items-start ${isLowTime ? 'text-red-400' : 'text-white/80'}`}>
                <div className="flex items-center gap-1.5 opacity-60">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Time</span>
                </div>
                <span className={`font-display text-xl font-black tabular-nums leading-none ${isLowTime ? 'animate-pulse text-red-500' : 'text-white'}`}>
                    {timeStr}
                </span>
            </div>

            {/* Health */}
            <div className={`bg-white/5 px-3 py-2 rounded-2xl flex items-center gap-1.5 border border-white/10 shadow-inner ${health === 1 ? 'animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500/50' : ''}`}>
                {[...Array(3)].map((_, i) => (
                    <Heart
                        key={i}
                        className={`w-5 h-5 transition-all duration-500 ${i < health
                            ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] scale-110'
                            : 'text-white/10 grayscale opacity-30 shadow-none scale-90'
                            }`}
                        strokeWidth={2.5}
                    />
                ))}
            </div>

            {/* Score */}
            <div className="flex flex-col items-end text-bb-gold">
                <div className="flex items-center gap-1.5 opacity-60">
                    <Zap className="w-3.5 h-3.5 fill-bb-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Score</span>
                </div>
                <span className="font-display text-xl font-black tabular-nums leading-none text-white drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    {score}
                </span>
            </div>


        </div>
    );
});

GameHUD.propTypes = {
    timeLeft: PropTypes.number.isRequired,
    health: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired,
    onExit: PropTypes.func.isRequired,
};

export default GameHUD;
