import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Protection meter with Bajaj Blue base and Orange fill animation.
 * Thick 14px bar, glowing pill label, bold white score.
 */
const ProtectionMeter = memo(function ProtectionMeter({ score, maxScore = 100 }) {
    const percentage = useMemo(() => {
        return Math.max(0, Math.min(100, (score / maxScore) * 100));
    }, [score, maxScore]);

    const { label, pillColor } = useMemo(() => {
        if (percentage <= 35) {
            return { label: 'Low', pillColor: '#EF4444' };
        }
        if (percentage <= 70) {
            return { label: 'Medium', pillColor: '#FF8C00' };
        }
        return { label: 'High', pillColor: '#10B981' };
    }, [percentage]);

    return (
        <div className="w-full space-y-3">
            {/* Header — label left, pill + score right */}
            <div className="flex items-center justify-between">
                <span className="text-[0.9375rem] font-bold text-blue-950 tracking-wide">
                    Protection Level
                </span>
                <div className="flex items-center gap-3">
                    {/* Glowing pill */}
                    <span
                        className="text-[0.75rem] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{
                            backgroundColor: pillColor,
                            color: '#fff',
                            boxShadow: `0 0 14px ${pillColor}80, 0 0 4px ${pillColor}80`,
                        }}
                    >
                        {label}
                    </span>
                    {/* Bold score */}
                    <span className="text-[1.5rem] font-black text-blue-950 leading-none">
                        {Math.round(score)}
                    </span>
                </div>
            </div>

            {/* Thick progress bar — Blue base, Orange fill */}
            <div
                className="relative w-full rounded-full overflow-hidden"
                style={{
                    height: '14px',
                    backgroundColor: 'rgba(0, 102, 178, 0.2)',
                    border: '1px solid rgba(0, 102, 178, 0.3)',
                }}
            >
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #FF8C00 0%, #FF6600 100%)',
                        boxShadow: '0 0 16px rgba(255, 140, 0, 0.4)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
});

ProtectionMeter.displayName = 'ProtectionMeter';

ProtectionMeter.propTypes = {
    score: PropTypes.number.isRequired,
    maxScore: PropTypes.number,
};

export default ProtectionMeter;
