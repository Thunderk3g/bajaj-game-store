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
        <div className="w-full flex flex-col items-center gap-3">
            {/* Timer badge */}
            <div className="flex flex-col items-center gap-1 -mb-2 z-10">
                <motion.div
                    className="relative flex items-center justify-center bg-white rounded-full p-1"
                    style={{
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}
                >
                    <motion.div
                        className="relative flex items-center justify-center rounded-full"
                        style={{
                            width: 76,
                            height: 76,
                            background: 'linear-gradient(135deg, #FF8C00 0%, #FF6600 100%)',
                            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1)',
                        }}
                        animate={
                            isUrgent
                                ? { scale: [1, 1.05, 1] }
                                : { scale: 1 }
                        }
                        transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
                    >
                        <span className="text-[2.25rem] font-black text-white leading-none drop-shadow-md">
                            {timeLeft}
                        </span>

                        {/* Ring */}
                        <svg
                            className="absolute inset-0 w-full h-full -rotate-90"
                            viewBox="0 0 76 76"
                        >
                            <circle
                                cx="38"
                                cy="38"
                                r="34"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="38"
                                cy="38"
                                r="34"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerProgress / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                    </motion.div>
                </motion.div>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3 pt-2">
                {/* Primary — I'm Protected */}
                <motion.button
                    onClick={() => onDecision('protected')}
                    disabled={disabled}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 font-black text-white text-[1.2rem] uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        height: '66px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3), 0 4px 0 #059669',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    id="btn-protected"
                >
                    🛡️ I&apos;m Protected
                </motion.button>

                {/* Secondary — I'm Exposed */}
                <motion.button
                    onClick={() => onDecision('exposed')}
                    disabled={disabled}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 font-black text-white text-[1.2rem] uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        height: '66px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25), 0 4px 0 #991b1b',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
