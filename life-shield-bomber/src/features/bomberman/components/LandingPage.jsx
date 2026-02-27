/**
 * LandingPage — Shield Guardian thumbnail with Play button.
 * Full-screen thumbnail image with a centered Play button at the bottom.
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import shieldManImg from '../assets/images/Shield-Man.png';

const LandingPage = memo(function LandingPage({ onStart }) {
    return (
        <div className="w-full h-[100dvh] relative overflow-hidden flex flex-col">
            {/* Full-screen thumbnail */}
            <div className="absolute inset-0">
                <img
                    src={shieldManImg}
                    alt="Shield Guardian"
                    className="w-full h-full object-cover object-center"
                    draggable={false}
                />
                {/* Subtle gradient overlay at bottom for button visibility */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(5,11,20,0.85) 0%, rgba(5,11,20,0.3) 30%, transparent 60%)',
                    }}
                />
            </div>

            {/* Play Button — center bottom */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8">
                <motion.button
                    onClick={onStart}
                    id="btn-start-bomber"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-[16rem] py-4 rounded-xl font-display text-xl font-extrabold tracking-widest text-white uppercase transition-transform active:scale-[0.97]"
                    style={{
                        background: 'linear-gradient(135deg, #1E5EFF 0%, #3B82F6 100%)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 0 #1e40af, 0 8px 25px rgba(30,94,255,0.4)',
                    }}
                >
                    Play
                </motion.button>
            </div>
        </div>
    );
});

LandingPage.propTypes = {
    onStart: PropTypes.func.isRequired,
};

export default LandingPage;
