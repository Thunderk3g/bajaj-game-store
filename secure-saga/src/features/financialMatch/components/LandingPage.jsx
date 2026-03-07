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
        <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#060E24] overflow-hidden">
            {/* Background Thumbnail with aspect-ratio handling */}
            <div
                className="absolute inset-0 w-full h-full z-10"
                style={{
                    backgroundImage: `url(${secureThumbnail})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Subtle overlay for better depth */}
            <div className="absolute inset-0 bg-black/10 z-20 pointer-events-none" />

            {/* Bottom Gradient for Button Contrast */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-20 pointer-events-none" />

            {/* Play Button Container - Positioned at the very bottom to avoid cutting off background text */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[70%] max-w-[240px]">
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
    );
});

LandingPage.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default LandingPage;
