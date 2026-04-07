import { useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { GAME_PHASES } from '../context/gameReducer.js';

/**
 * TimeUpModal — no UI.
 * When the countdown reaches zero (TIMEUP phase), navigates to /result.
 * The ResultPage handles both WON and TIMEUP, showing the same screen.
 */
const TimeUpModal = memo(function TimeUpModal() {
    const { state } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (state.phase === GAME_PHASES.TIMEUP) {
            navigate('/lead');
        }
    }, [state.phase, navigate]);

    return null;
});

export default TimeUpModal;
