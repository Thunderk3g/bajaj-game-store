import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Speedometer from './Speedometer';

/**
 * Speedometer-style score reveal animation.
 */
const SpeedometerScore = memo(function SpeedometerScore({
    score,
    category,
    onViewTimeline,
}) {
    const fillColor = category?.color || '#3B82F6';

    return (
        <motion.div
            className="w-full flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Heading */}
            <motion.div
                className="text-center space-y-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <h2 className="race-heading text-[2rem] text-blue-950">Race Complete!</h2>
                <p className="text-blue-900/60 text-[0.875rem] uppercase tracking-widest font-bold">
                    Your Life Protection Score
                </p>
            </motion.div>

            {/* Speedometer Component */}
            <div className="relative w-full flex justify-center">
                <Speedometer score={score} />
            </div>

            {/* Category badge */}
            <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <span
                    className="inline-flex items-center px-6 py-2 rounded-full text-[1rem] font-black uppercase tracking-wider"
                    style={{
                        backgroundColor: `${fillColor}15`,
                        color: fillColor,
                        border: `2px solid ${fillColor}40`,
                        boxShadow: `0 0 20px ${fillColor}20`,
                    }}
                >
                    {category?.label}
                </span>

                <p className="text-blue-900/70 text-[0.875rem] max-w-xs mx-auto leading-relaxed">
                    Life moves faster than planning. Let&apos;s strengthen your protection.
                </p>
            </motion.div>

            {/* CTA */}
            <motion.div
                className="w-full max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
            >
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full py-4 text-[1rem] font-bold uppercase tracking-wider"
                    onClick={onViewTimeline}
                    id="btn-view-timeline"
                >
                    View Your Journey
                    <ChevronRight size={20} />
                </Button>
            </motion.div>
        </motion.div>
    );
});

SpeedometerScore.displayName = 'SpeedometerScore';

SpeedometerScore.propTypes = {
    score: PropTypes.number.isRequired,
    category: PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
        key: PropTypes.string,
    }).isRequired,
    onViewTimeline: PropTypes.func.isRequired,
};

export default SpeedometerScore;
