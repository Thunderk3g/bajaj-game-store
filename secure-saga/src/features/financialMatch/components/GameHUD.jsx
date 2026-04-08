/**
 * GameHUD — Header section with overlapping gear timer and gold panel.
 * Pixel-perfect recreation: 
 * Top 17% of screen height.
 * Center timer overlaps gold panel. 
 * Gold Panel: brushed brass texture, thin dark brown borders.
 * Subtitle below gold panel.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import CircularTimer from './CircularTimer.jsx';
import { GAME_DURATION_SECONDS } from '../config/gameConfig.js';

const GameHUD = memo(function GameHUD({ timeLeft, userName, idleMessage }) {
    return (
        <div className="w-full flex flex-col items-center pt-2 pb-1 z-20 gap-0" style={{ minHeight: '17vh' }}>

            {/* Topmost Overlapping Timer */}
            <div className="relative z-30 mb-[-25px]">
                <div className={`transition-all duration-500 ease-in-out ${timeLeft <= 10 ? 'scale-110 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'scale-100 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]'}`}>
                    <CircularTimer timeLeft={timeLeft} totalTime={GAME_DURATION_SECONDS} />
                </div>
            </div>

            {/* Gold Panel Banner */}
            <div
                className="w-full flex justify-center relative z-20"
                style={{
                    height: '60px',
                    background: 'linear-gradient(to bottom, #d4af37 0%, #aa8021 30%, #cdab41 50%, #9f7318 80%, #b48a28 100%)',
                    borderTop: '2px solid #3d2000',
                    borderBottom: '2px solid #5a3e1b',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}
            >
                {/* Subtle vertical brushed metal texture overlay can be implied via linear-gradient side-to-side, or just use the gradient above. */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: 'repeating-linear-gradient(to right, transparent, transparent 1px, #000 1px, #000 2px)' }}
                />

                {/* Inner Pill Shape Name Banner - Positioned toward bottom of panel so timer fits above */}
                <div
                    className="absolute bottom-2 rounded-full flex items-center justify-center border-[2px] border-[#D4A017] shadow-inner"
                    style={{
                        backgroundColor: '#0D1B3E',
                        padding: '4px 20px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.3)',
                    }}
                >
                    <span
                        className="text-white font-bold tracking-wide uppercase"
                        style={{ fontSize: '18px', fontFamily: "'Outfit', sans-serif" }}
                    >
                        HI {userName ? userName : 'PLAYER'} 👋
                    </span>
                </div>
            </div>

            {/* Subtitle below gold panel */}
            <div className="mt-4 mb-2 text-center z-10 w-full px-4">
                <span
                    className="block font-bold tracking-[3px] uppercase"
                    style={{
                        color: '#A8C4E0',
                        fontSize: '12px',
                        lineHeight: '1.2',
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    FILL YOUR LIFE GOALS BUCKETS
                </span>
            </div>

            {/* CTA / Idle Message Container - Proper Flow, No Overlap */}
            <div className="w-full flex justify-center items-center px-4 mt-1 mb-2" style={{ minHeight: '32px' }}>
                <AnimatePresence>
                    {idleMessage && (
                        <motion.div
                            key={idleMessage}
                            initial={{ opacity: 0, y: -6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: 'linear-gradient(135deg, #001f4d 0%, #003380 100%)',
                                border: '1.5px solid #0056b3',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                color: '#FFFFFF',
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                                maxWidth: '90%',
                                lineHeight: '1.3',
                                whiteSpace: 'normal',
                            }}
                        >
                            {idleMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
});

GameHUD.propTypes = {
    timeLeft: PropTypes.number.isRequired,
    userName: PropTypes.string,
    idleMessage: PropTypes.string,
};

export default GameHUD;
