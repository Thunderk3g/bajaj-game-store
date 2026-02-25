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
        <div className="w-full h-dvh flex items-center justify-center bg-[#060E24]">
            {/* Main container with fixed aspect ratio/mobile-first sizing */}
            <div
                className="relative w-full max-w-[480px] h-full flex flex-col items-center justify-end overflow-hidden"
                style={{
                    backgroundImage: `url(${secureThumbnail})`,
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Visual Overlay to ensure background looks good */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#060E24]/60 to-transparent pointer-events-none" />

                {/* Play Button */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[65%] max-w-[200px]">
                    <motion.button
                        onClick={onStart}
                        id="btn-play-secure"
                        className="w-full py-3 rounded-xl font-game text-2xl tracking-wider uppercase text-white shadow-[0_4px_0_#4d7c0f] transition-all"
                        style={{
                            background: 'linear-gradient(180deg, #a3e635 0%, #65a30d 100%)',
                            border: '3px solid #ffffff',
                        }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                        whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.95, y: 2, boxShadow: 'none' }}
                    >
                        Play
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
