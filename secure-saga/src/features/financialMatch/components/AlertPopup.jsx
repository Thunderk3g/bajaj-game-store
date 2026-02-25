/**
 * AlertPopup — Contextual message popup shown below the game grid.
 * Displays bucket-specific messages when tiles are burst,
 * plus urgency messages as time pressure increases.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';

const AlertPopup = memo(function AlertPopup({ message, color }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    key={message}
                    initial={{ opacity: 0, scale: 0.9, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    className="w-full flex justify-center pointer-events-none"
                >
                    <div
                        className="w-[92%] max-w-[400px] px-6 py-4 rounded-3xl backdrop-blur-3xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
                        style={{
                            background: `linear-gradient(165deg, ${color || 'rgba(59,130,246,0.6)'} 0%, rgba(10,34,70,0.98) 100%)`,
                        }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                        <span className="text-[0.85rem] sm:text-[1rem] text-white font-bold leading-normal drop-shadow-md block relative z-10">
                            {message}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

AlertPopup.propTypes = {
    message: PropTypes.string,
    color: PropTypes.string,
};

export default AlertPopup;
