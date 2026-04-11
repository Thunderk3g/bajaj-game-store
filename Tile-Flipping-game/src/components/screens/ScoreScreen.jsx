import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { getFlipStars, getScoreMessage, formatTime, getScoreScenario } from '../../utils/gameUtils';
import { buildShareUrl } from '../../utils/crypto';
import { shortenUrl } from '../../utils/shortener';
import { TOTAL_PAIRS, SCREENS } from '../../constants/game';
import { ACTION } from '../../context/GameContext';
import { submitToLMS } from '../../utils/api';
import { submitScore } from '../../services/api';
import Button from '../ui/Button';
import LeadModal from '../modals/LeadModal';
import styles from './ScoreScreen.module.css';
import gameThumbnail from '../../assets/tile-bg.png';

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

    const handleShare = async () => {
        const rawShareUrl = buildShareUrl() || window.location.href;
        const shareUrl = await shortenUrl(rawShareUrl);
        const senderName = (typeof user !== 'undefined' ? user?.name : '') || '';
        const signature = senderName ? `\n\nBest Regards,\n${senderName}` : '';

        const shareData = {
            title: 'Insurance Match',
            text: `Hi,\nMy memory score is ${typeof scoreVal === 'number' ? Math.round(scoreVal) : scoreVal}. Find out yours ${shareUrl}${signature}`.trim(),
            url: shareUrl
        };

        if (navigator.share) {
            try {
                const sharePayload = {
                    title: shareData.title,
                    text: shareData.text
                };
                try {
                    const res = await fetch(gameThumbnail);
                    const blob = await res.blob();
                    const file = new File([blob], 'game-thumbnail.png', { type: blob.type });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        sharePayload.files = [file];
                    }
                } catch (e) {
                    // Share without image if fetch fails
                }
                await navigator.share(sharePayload);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback
            try {
                await navigator.clipboard.writeText(shareData.url);
                showToast?.('Link copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <>
            <div className={`screen ${styles.scoreScreen}`}>
                <div className={`screen-inner ${styles.inner}`}>
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
                        <div className={styles.shareBtnWrap}>
                            <Button variant="primary" fullWidth onClick={handleShare} id="btn-share-main" className={styles.shareBtnSmall}>
                                &nbsp; Share
                            </Button>
                        </div>

                        <p className={styles.cta}>
                            {scenarioData.cta}
                        </p>

                        {sessionStorage.getItem('gamification_emp_mobile') && (
                            <Button variant="outline" fullWidth onClick={() => window.location.href = `tel:${sessionStorage.getItem('gamification_emp_mobile')}`} id="btn-call-now" className={styles.callNowBtn}>
                                &nbsp; Call Now
                            </Button>
                        )}
                        <Button variant="secondary" fullWidth onClick={() => setShowLeadModal(true)} id="btn-book-slot">
                            &nbsp; Book a Slot
                        </Button>
                        <button className={styles.btnPlayAgainText} onClick={handlePlayAgain} id="btn-play-again">
                            Play Again
                        </button>

                        {/* Disclaimer */}
                        <div className={styles.disclaimerContainer}>
                            <p className={styles.disclaimer}>
                                <strong>Disclaimer:</strong> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                            </p>
                        </div>
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
