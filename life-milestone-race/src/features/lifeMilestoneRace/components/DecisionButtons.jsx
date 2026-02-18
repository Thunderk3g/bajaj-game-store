import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Full-width stacked decision buttons.
 * Orange primary (Protected), Blue secondary (Exposed).
 * No green/red. Powerful, game-like feel.
 */
const DecisionButtons = memo(function DecisionButtons({
    onDecision,
    timeLeft,
    timerProgress,
    disabled = false,
}) {
    const isUrgent = timeLeft <= 2;

    const timerColor = useMemo(() => {
        if (timeLeft <= 2) return '#FF8C00';
        if (timeLeft <= 3) return '#FF8C00';
        return '#FF8C00';
    }, [timeLeft]);

    return (
        <div className="w-full flex flex-col items-center gap-5">
            {/* Timer badge — large floating orange circle */}
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    className="relative flex items-center justify-center"
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF8C00 0%, #FF6600 100%)',
                        boxShadow: '0 0 30px rgba(255, 140, 0, 0.4), 0 4px 16px rgba(255, 102, 0, 0.3)',
                    }}
                    animate={
                        isUrgent
                            ? { scale: [1, 1.08, 1], boxShadow: ['0 0 30px rgba(255, 140, 0, 0.4)', '0 0 50px rgba(255, 102, 0, 0.7)', '0 0 30px rgba(255, 140, 0, 0.4)'] }
                            : { y: [0, -4, 0] }
                    }
                    transition={
                        isUrgent
                            ? { duration: 0.5, repeat: Infinity }
                            : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                    }
                >
                    <span className="text-[2rem] font-black text-white leading-none">
                        {timeLeft}
                    </span>

                    {/* SVG ring progress */}
                    <svg
                        className="absolute inset-0 w-full h-full -rotate-90"
                        viewBox="0 0 72 72"
                    >
                        <circle
                            cx="36"
                            cy="36"
                            r="34"
                            fill="none"
                            stroke="rgba(255,255,255,0.25)"
                            strokeWidth="3"
                        />
                        <circle
                            cx="36"
                            cy="36"
                            r="34"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerProgress / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                </motion.div>

                <span className="text-[1rem] font-bold text-blue-950 tracking-wide">
                    {isUrgent ? 'Decide Now!' : 'Make Your Choice'}
                </span>
            </div>

            {/* Buttons — stacked, full width, 60px height each */}
            <div className="w-full flex flex-col gap-4">
                {/* Primary — I'm Protected (Orange) */}
                <motion.button
                    onClick={() => onDecision('protected')}
                    disabled={disabled}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 font-black text-white text-[1.125rem] uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        height: '60px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FF8C00 0%, #FF6600 100%)',
                        boxShadow: '0 0 20px rgba(255, 140, 0, 0.35), 0 4px 0 #CC5500',
                    }}
                    id="btn-protected"
                >
                    🛡️ I&apos;m Protected
                </motion.button>

                {/* Secondary — I'm Exposed (Blue) */}
                <motion.button
                    onClick={() => onDecision('exposed')}
                    disabled={disabled}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 font-black text-white text-[1.125rem] uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        height: '60px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 0 #004A80',
                    }}
                    id="btn-exposed"
                >
                    ⚡ I&apos;m Exposed
                </motion.button>
            </div>
        </div>
    );
});

DecisionButtons.displayName = 'DecisionButtons';

DecisionButtons.propTypes = {
    onDecision: PropTypes.func.isRequired,
    timeLeft: PropTypes.number.isRequired,
    timerProgress: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
};

export default DecisionButtons;
