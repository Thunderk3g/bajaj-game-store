import { useEffect, useRef } from 'react';
import { ACTION, useGame } from '../context/GameContext';
import { SCREENS, TOTAL_PAIRS, MAX_FLIPS } from '../constants/game';

/**
 * Countdown timer for the game screen.
 * Ticks every second while the game is active.
 * Fires END_GAME + navigates to score when time runs out or all pairs are found.
 */
export function useGameTimer(onEnd) {
    const { state, dispatch, navigate } = useGame();
    const { isEnded, timeRemaining, matchedPairs, flipsCount } = state.game;
    const intervalRef = useRef(null);

    useEffect(() => {
        // Don't start if game already ended
        if (isEnded) return;
        if (state.screen !== SCREENS.GAME) return;

        intervalRef.current = setInterval(() => {
            dispatch({ type: ACTION.TICK_TIMER });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isEnded, state.screen, dispatch]);

    // Watch for time reaching 0
    useEffect(() => {
        if (state.screen !== SCREENS.GAME) return;
        if (timeRemaining === 0 && !isEnded) {
            dispatch({ type: ACTION.END_GAME });
            onEnd?.('timeout');
            setTimeout(() => navigate(SCREENS.SCORE), 600);
        }
    }, [timeRemaining, isEnded, dispatch, navigate, onEnd, state.screen]);

    // Watch for all pairs matched
    useEffect(() => {
        if (state.screen !== SCREENS.GAME) return;
        if (matchedPairs === TOTAL_PAIRS && !isEnded) {
            dispatch({ type: ACTION.END_GAME });
            onEnd?.('win');
            setTimeout(() => navigate(SCREENS.SCORE), 800);
        }
    }, [matchedPairs, isEnded, dispatch, navigate, onEnd, state.screen]);

    // Watch for flip limit
    useEffect(() => {
        if (state.screen !== SCREENS.GAME) return;
        if (flipsCount >= MAX_FLIPS && !isEnded) {
            dispatch({ type: ACTION.END_GAME });
            onEnd?.('flips');
            setTimeout(() => navigate(SCREENS.SCORE), 800);
        }
    }, [flipsCount, isEnded, dispatch, navigate, onEnd, state.screen]);
}
