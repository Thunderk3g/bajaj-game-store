import { useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { GAME_PHASES } from '../context/gameReducer.js';

/**
 * WinModal — no UI.
 * When game transitions to WON, immediately navigates to /result.
 * The ResultPage does all the visual work.
 */
const WinModal = memo(function WinModal() {
    const { state } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (state.phase === GAME_PHASES.WON) {
            navigate('/lead');
        }
    }, [state.phase, navigate]);

    return null;
});

export default WinModal;
