/**
 * AlertPopup — Contextual message popup shown below the game grid.
 * Displays bucket-specific messages when tiles are burst,
 * plus urgency messages as time pressure increases.
 */
import { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';

const AlertPopup = memo(function AlertPopup({ message, color, onClear }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            if (onClear) onClear();
        }, 5000);
        return () => clearTimeout(timer);
    }, [message, onClear]);

    return (
        <div className="absolute top-[15%] left-0 w-full flex justify-center pointer-events-none z-[100] px-4">
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        key={message}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full max-w-[360px] py-3 px-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl overflow-hidden text-center"
                        style={{
                            background: `linear-gradient(135deg, ${color || 'rgba(255,255,255,0.08)'} 0%, rgba(255,255,255,0.03) 100%)`,
                        }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                        <span className="text-[1.1rem] sm:text-[1.25rem] bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide relative z-10">
                            {message}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

AlertPopup.propTypes = {
    message: PropTypes.string,
    color: PropTypes.string,
    onClear: PropTypes.func,
};

export default AlertPopup;
