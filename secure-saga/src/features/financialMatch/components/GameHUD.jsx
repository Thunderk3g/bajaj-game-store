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
import CircularTimer from './CircularTimer.jsx';
import { GAME_DURATION_SECONDS } from '../config/gameConfig.js';

const GameHUD = memo(function GameHUD({ timeLeft, userName }) {
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

            {/* Subtitle below gold panel - FIXED to add explicit bottom margin preventing GameGrid gear overlap */}
            <div className="mt-2 mb-6 text-center z-10 w-full px-4">
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

        </div>
    );
});

GameHUD.propTypes = {
    timeLeft: PropTypes.number.isRequired,
    userName: PropTypes.string,
};

export default GameHUD;
