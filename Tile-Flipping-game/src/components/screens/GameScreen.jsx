import { useEffect, useCallback } from 'react';
import { ACTION, useGame } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameTimer } from '../../hooks/useGameTimer';
import { formatTime, getHintText, getFlipStars } from '../../utils/gameUtils';
import { TOTAL_PAIRS, MAX_FLIPS } from '../../constants/game';
import { submitToLMS } from '../../utils/api';
import GameBoard from './GameBoard';
import styles from './GameScreen.module.css';

export default function GameScreen({ showToast }) {
    const { state, dispatch } = useGame();
    const { flipTile } = useGameEngine();
    const { game, user } = state;

    // Timer manages countdown and end conditions automatically
    useGameTimer(useCallback((reason) => {
        if (reason === 'win') showToast?.('🎉 You matched all pairs!', 'success');
        else if (reason === 'flips') showToast?.('⚠️ Out of moves!', 'info');
        else showToast?.(`⏰ Time's up!`, 'info');
    }, [showToast]));

    const { timeRemaining, matchedPairs, flipsCount, tiles, isEnded } = game;
    const progress = Math.round((matchedPairs / TOTAL_PAIRS) * 100);
    const isWarning = timeRemaining <= 20 && timeRemaining > 0;
    const currentStars = getFlipStars(flipsCount);

    // Handle background lead submission if user quits mid-game
    useEffect(() => {
        return () => {
            // This runs on unmount.
            // If the game didn't end normally AND user details exist AND not submitted yet.
            // Note: isEnded in closure might be stale, so we ideally need a ref or check state.
            // But since this is a functional component, we can use a ref for isEnded if needed.
            // For now, let's keep it simple.
            if (user.name && user.phone && !user.isLeadSubmitted) {
                console.log("[GameScreen] User quitting? Submitting deferred lead...");
                submitToLMS({
                    name: user.name,
                    mobile_no: user.phone,
                    score: Math.round((game.score / TOTAL_PAIRS) * 100),
                    summary_dtls: "Game Lead (Quit/Interrupted)"
                }).then(() => {
                    dispatch({ type: ACTION.MARK_SUBMITTED });
                });
            }
        };
    }, [user, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTileClick = useCallback((index) => {
        flipTile(state, index);
    }, [flipTile, state]);

    return (
        <div className={`screen ${styles.gameScreen}`}>

            {/* Top bar */}
            <div className={styles.topbar}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Time</span>
                    <span className={`${styles.statValue} ${isWarning ? styles.warn : ''}`}>
                        {formatTime(timeRemaining)}
                    </span>
                </div>
                <div className={styles.scoreBadge}>
                    <span className={styles.statLabel} style={{ color: 'rgba(255,255,255,0.6)' }}>Pairs Found</span>
                    <span className={styles.statValue}>{matchedPairs} / {TOTAL_PAIRS}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Flip Tries</span>
                    <div className={styles.starRack}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <span key={n} className={`${styles.uiStar} ${n <= currentStars ? styles.lit : ''}`}>
                                ⭐
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progressTrack}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={matchedPairs}
                    aria-valuemax={TOTAL_PAIRS}
                />
            </div>

            {/* Hint */}
            <div className={styles.hint}>
                <div className={styles.hintChip}>
                    {isWarning
                        ? ` Hurry! Only ${timeRemaining}s left!`
                        : getHintText(matchedPairs)
                    }
                </div>
            </div>

            {/* Header Message */}
            <div className={styles.boardHeader}>
                <h2>Test Your Memory. Don’t Forget What Matters.</h2>
            </div>

            {/* Board */}
            <div className={styles.boardWrapper}>
                <GameBoard tiles={tiles} onTileClick={handleTileClick} locked={game.isLocked} />
            </div>

        </div>
    );
}
