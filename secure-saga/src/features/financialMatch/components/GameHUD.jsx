/**
 * GameHUD — Timer + Greeting. No exit button per user request.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import CircularTimer from './CircularTimer.jsx';
import { GAME_DURATION_SECONDS } from '../config/gameConfig.js';

const GameHUD = memo(function GameHUD({ timeLeft, userName }) {
    return (
        <div className="w-full shrink-0 flex flex-col items-center px-4 pt-3 pb-1 z-20 gap-1">
            {/* Timer Row */}
            <div className="w-full flex items-center justify-center relative h-14">
                {/* Center: Timer with Scaling Animation */}
                <div
                    className={`transition-all duration-500 ease-in-out z-30 ${timeLeft <= 10 ? 'scale-125 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]' : 'scale-100'}`}
                >
                    <div className={`bg-bb-navy p-1 rounded-full border border-bb-accent/20 shadow-xl transition-colors ${timeLeft <= 10 ? 'border-red-500/50 bg-red-900/40' : ''}`}>
                        <CircularTimer timeLeft={timeLeft} totalTime={GAME_DURATION_SECONDS} />
                    </div>
                </div>
            </div>

            {/* Greeting */}
            <div className="flex flex-col items-center gap-0.5 mt-1">
                <span className="font-game text-lg sm:text-xl text-white drop-shadow-md tracking-wide">
                    Hi {(userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'Player')} 👋
                </span>
                <span className="text-[0.7rem] sm:text-xs text-blue-200/80 font-medium uppercase tracking-widest">
                    Fill your life goals buckets
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
