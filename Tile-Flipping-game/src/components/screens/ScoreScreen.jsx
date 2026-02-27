import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { getFlipStars, getScoreMessage, formatTime, getScoreScenario } from '../../utils/gameUtils';
import { TOTAL_PAIRS, SCREENS } from '../../constants/game';
import { ACTION } from '../../context/GameContext';
import { submitToLMS } from '../../utils/api';
import { submitScore } from '../../services/api';
import Button from '../ui/Button';
import LeadModal from '../modals/LeadModal';
import styles from './ScoreScreen.module.css';

const CIRCUMFERENCE = 380;

export default function ScoreScreen({ showToast }) {
    const { state, navigate, dispatch } = useGame();
    const { initGame } = useGameEngine();
    const { game, user } = state;
    const { score, flipsCount, timeRemaining, elapsedSeconds } = game;

    // Calculate score out of 100
    const scaledScore = Math.round((score / TOTAL_PAIRS) * 100);
    const scoreVal = scaledScore > 100 ? 100 : scaledScore; // Clamp just in case (though math says it shouldn't exceed)

    const [showLeadModal, setShowLeadModal] = useState(false);
    const fillRef = useRef(null);

    const stars = getFlipStars(flipsCount);
    const scenarioData = getScoreScenario(score);
    const elapsed = elapsedSeconds || (120 - timeRemaining);

    // Submission logic for background lead
    useEffect(() => {
        // Submit score in background
        submitScore({ ...user, score, flips: flipsCount, elapsed }).catch(() => { });

        return () => {
            // When leaving the score screen (e.g. Play Again or navigating away)
            // If user provided details at start but we haven't submitted yet (didn't book),
            // we should submit their general lead now.
            if (user.name && user.phone && !user.isLeadSubmitted) {
                console.log("[ScoreScreen] User leaving without booking. Submitting deferred lead...");
                submitToLMS({
                    name: user.name,
                    mobile_no: user.phone,
                    score: scaledScore,
                    summary_dtls: "Game Lead (Completed)"
                }).then(() => {
                    dispatch({ type: ACTION.MARK_SUBMITTED });
                });
            }
        };
    }, [user, dispatch, score, flipsCount, elapsed]); // eslint-disable-line react-hooks/exhaustive-deps

    // Animate the score ring on mount
    useEffect(() => {
        const target = CIRCUMFERENCE - (score / TOTAL_PAIRS) * CIRCUMFERENCE;
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (fillRef.current) {
                    fillRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
                    fillRef.current.style.strokeDashoffset = String(target);
                }
            }, 300);
        });
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    function handlePlayAgain() {
        initGame();
        navigate(SCREENS.GAME);
    }

    function handleShare() {
        const text = `I scored ${scenarioData.scoreDisplay} in the Life Insurance Memory Game! Can you beat me? 🛡️`;
        if (navigator.share) {
            navigator.share({ title: 'My Game Score', text }).catch(() => { });
        } else {
            navigator.clipboard.writeText(text).then(() => showToast?.('Score copied to clipboard!', 'success'));
        }
    }

    return (
        <>
            <div className={`screen ${styles.scoreScreen}`}>
                <div className={`screen-inner ${styles.inner}`}>
                    {/* Top Right Share Button */}
                    <button className={styles.shareBtnTop} onClick={handleShare} aria-label="Share score" title="Share">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className={styles.header}>
                        <p className={styles.userName}>{user.name ? `Hi ${user.name.split(' ')[0]}!` : 'Hi there!'}</p>
                        <p className={styles.headline}>{scenarioData.headline}</p>
                    </div>
                    {/* <p className={styles.subLabel}>Your Protection Score</p> */}

                    {/* Score Ring */}
                    <div className={styles.ringWrap}>
                        <div className={styles.ring}>
                            <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" className={styles.svg}>
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#F97316" />
                                        <stop offset="100%" stopColor="#FFB380" />
                                    </linearGradient>
                                </defs>
                                <circle className={styles.track} cx="70" cy="70" r="60" />
                                <circle
                                    ref={fillRef}
                                    className={styles.fill}
                                    cx="70" cy="70" r="60"
                                    strokeDashoffset={CIRCUMFERENCE}
                                />
                            </svg>
                            <div className={styles.ringInner}>
                                <div className={styles.scoreBig}>{scoreVal}</div>
                                <div className={styles.scoreDenom}>/ 100</div>
                                <div className={styles.scoreLbl}>Score</div>
                            </div>
                        </div>
                    </div>



                    {/* Stats row */}
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statVal}>{formatTime(elapsed)}</div>
                            <div className={styles.statLbl}>Time Taken</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statVal}>{flipsCount}</div>
                            <div className={styles.statLbl}>Flips Used</div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className={styles.messagebox}>
                        <p className={styles.bodyText}>{scenarioData.body}</p>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <Button variant="primary" fullWidth onClick={handleShare} id="btn-share-main">
                            &nbsp; Share
                        </Button>

                        <p className={styles.cta}>
                            {scenarioData.cta}
                        </p>

                        <Button variant="outline" fullWidth onClick={() => window.location.href = 'tel:18001234567'} id="btn-call-now" className={styles.secondaryBtn}>
                            &nbsp; Call Now
                        </Button>
                        <Button variant="secondary" fullWidth onClick={() => setShowLeadModal(true)} id="btn-book-slot">
                            &nbsp; Book a Slot
                        </Button>
                        <button className={styles.btnPlayAgainText} onClick={handlePlayAgain} id="btn-play-again">
                            Play Again
                        </button>
                    </div>

                </div>
            </div>

            {showLeadModal && (
                <LeadModal
                    title="Book a Slot"
                    subtitle="Our agent will help you secure your future."
                    shouldSubmit={true}
                    isBooking={true}
                    summaryDtls="Booking Request (Score Screen)"
                    onClose={() => setShowLeadModal(false)}
                    showToast={showToast}
                />
            )}
        </>
    );
}
