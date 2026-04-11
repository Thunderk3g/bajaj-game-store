/**
 * LandingPage — Branded intro with thumbnail background.
 * Simplified with a prominent "Play" button following user request.
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import secureThumbnail from '../../assets/image/secure-thumbnail.png';

const LandingPage = memo(function LandingPage({ onStart }) {
    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-[#050D24] overflow-hidden">
            {/* Top Area: Background Thumbnail */}
            <div className="flex-1 relative min-h-0 w-full">
                <img
                    src={secureThumbnail}
                    alt="Secure Saga Thumbnail"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-top z-10"
                />
                {/* Subtle overlay for better depth */}
                <div className="absolute inset-0 bg-black/10 z-20 pointer-events-none" />
                {/* Bottom Gradient for smooth transition */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050D24] to-transparent z-20 pointer-events-none" />
            </div>

            {/* Bottom Area: Play Button Container */}
            <div className="shrink-0 pb-6 pt-0 -mt-2 sm:-mt-4 sm:pb-8 flex justify-center items-center z-40 relative">
                <div className="w-[70%] max-w-[240px]">
                    <motion.button
                        onClick={onStart}
                        id="btn-play-secure"
                        className="w-full py-3.5 sm:py-4 rounded-2xl font-game text-2xl sm:text-3xl tracking-widest uppercase text-white shadow-[0_6px_0_#4d7c0f] transition-all"
                        style={{
                            background: 'linear-gradient(180deg, #a3e635 0%, #65a30d 100%)',
                            border: '4px solid #ffffff',
                        }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            delay: 0.3
                        }}
                        whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.95, y: 2, boxShadow: 'none' }}
                    >
                        PLAY
                    </motion.button>
                </div>
            </div>
        </div>
    );
});

LandingPage.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default LandingPage;
