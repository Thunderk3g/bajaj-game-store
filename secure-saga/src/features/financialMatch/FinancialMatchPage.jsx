/**
 * BalanceBuilderPage — Main orchestrator.
 * Flow: Landing → Entry Popup → How To Play → 2-min Gameplay → Result → ThankYou
 */
import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import LandingPage from './components/LandingPage.jsx';
import EntryPopup from './components/EntryForm.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import GameHUD from './components/GameHUD.jsx';
import GameGrid from './components/GameGrid.jsx';
import BucketBar from './components/BucketBar.jsx';
import AlertPopup from './components/AlertPopup.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import ThankYou from './components/ThankYou.jsx';
import Background from './components/Background.jsx';

import { useMatchGame } from './hooks/useMatchGame.js';
import { GAME_PHASES, BUCKET_MESSAGES, URGENCY_MESSAGES, TILE_META } from './config/gameConfig.js';

// Import Audio
import bgmUrl from '../assets/audio/BGAudio.mp3';
import completionUrl from '../assets/audio/Completion_audio.wav';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const BalanceBuilderPage = memo(function BalanceBuilderPage() {
    const {
        state,
        finalScore,
        handleEntrySubmit,
        startGame,
        handleCellTap,
        exitGame,
        restartGame,
        showThankYou,
        handleBookSlot,
    } = useMatchGame();

    const {
        gameStatus,
        timeLeft,
        grid,
        selectedCell,
        explodingCells,
        floatingScores,
        activePraise,
        buckets,
        entryDetails,
    } = state;

    const [showEntry, setShowEntry] = useState(false);
    const audioRef = useRef(null);
    const completionAudioRef = useRef(null);
    const [isPlayingBGM, setIsPlayingBGM] = useState(false);

    // Alert popup state
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState(null);
    const alertTimeoutRef = useRef(null);
    const prevBucketsRef = useRef(null);

    // 1. Contextual Bucket Alerts (Triggered by Large Bursts / Praise)
    useEffect(() => {
        if (!activePraise) return;

        const prev = prevBucketsRef.current || {};
        const changedTypes = Object.keys(buckets).filter(
            (type) => (buckets[type] || 0) > (prev[type] || 0)
        );

        if (changedTypes.length > 0) {
            const type = changedTypes[0];
            const msgs = BUCKET_MESSAGES[type];
            const advice = msgs[Math.floor(Math.random() * msgs.length)];
            const meta = TILE_META[type];

            // Combine Praise (Excellent!) with Bucket Advice
            setAlertMessage(`${activePraise} ${advice}`);
            setAlertColor(`${meta.color}44`);

            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => {
                setAlertMessage(null);
                setAlertColor(null);
            }, 4000);
        }
        prevBucketsRef.current = { ...buckets };
    }, [activePraise, buckets]);

    // 2. Idle Urgency Alerts (If user doesn't move for 4 seconds)
    useEffect(() => {
        if (gameStatus !== GAME_PHASES.PLAYING) return;

        if (state.idleSeconds >= 4 && !alertMessage) {
            const msg = URGENCY_MESSAGES[Math.floor(Math.random() * URGENCY_MESSAGES.length)];
            setAlertMessage(`⚡ ${msg}`);
            setAlertColor('rgba(239, 68, 68, 0.4)');

            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => {
                setAlertMessage(null);
                setAlertColor(null);
            }, 3000);
        }
    }, [state.idleSeconds, gameStatus]);

    // 3. Reset bucket tracking ref on restart
    useEffect(() => {
        if (gameStatus === GAME_PHASES.LANDING || gameStatus === GAME_PHASES.HOW_TO_PLAY) {
            prevBucketsRef.current = null;
        }
    }, [gameStatus]);

    // ── Audio Management ──────────────────────────────────────────

    // 1. Autoplay BGM on mount (or first interaction)
    useEffect(() => {
        const playAudio = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = 0.4;
                    await audioRef.current.play();
                    setIsPlayingBGM(true);
                } catch (err) {
                    // Autoplay blocked
                }
            }
        };
        playAudio();
    }, []);

    // 2. Manage Audio State based on Game Phase
    useEffect(() => {
        // If Game Finishes (Result Screen), Stop BGM & Play Completion
        if (gameStatus === GAME_PHASES.RESULT || gameStatus === GAME_PHASES.EXITED) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlayingBGM(false);
            }

            // Play Completion Audio (Once)
            if (completionAudioRef.current) {
                completionAudioRef.current.volume = 0.8;
                completionAudioRef.current.currentTime = 0;
                completionAudioRef.current.play().catch(() => { });
            }
        }

        // If Game Restarts, Restart BGM & Stop Completion Audio
        if (gameStatus === GAME_PHASES.LANDING || gameStatus === GAME_PHASES.ENTRY || gameStatus === GAME_PHASES.PLAYING) {

            // Stop completion audio if playing
            if (completionAudioRef.current) {
                completionAudioRef.current.pause();
                completionAudioRef.current.currentTime = 0;
            }

            if (!isPlayingBGM && audioRef.current) {
                audioRef.current.play().then(() => setIsPlayingBGM(true)).catch(() => { });
            }
        }
    }, [gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUserInteraction = useCallback(() => {
        if (!isPlayingBGM && audioRef.current && gameStatus !== GAME_PHASES.RESULT && gameStatus !== GAME_PHASES.EXITED) {
            audioRef.current.play().then(() => setIsPlayingBGM(true)).catch(() => { });
        }
    }, [isPlayingBGM, gameStatus]);

    // ── Handlers ──────────────────────────────────────────────────

    const handleLandingStart = useCallback(() => {
        handleUserInteraction();
        setShowEntry(true);
    }, [handleUserInteraction]);

    const handleEntryClose = useCallback(() => {
        setShowEntry(false);
    }, []);

    const handleEntryDone = useCallback(
        async (name, mobile) => {
            handleUserInteraction();
            await handleEntrySubmit(name, mobile);
            setShowEntry(false);
        },
        [handleEntrySubmit, handleUserInteraction]
    );

    return (
        <div
            className="h-[100dvh] w-full flex flex-col items-center relative overflow-hidden text-white font-sans"
            onClick={handleUserInteraction}
        >
            {/* ── Global Background ── */}
            <Background />

            {/* ── Audio Elements ── */}
            <audio ref={audioRef} src={bgmUrl} loop />
            <audio ref={completionAudioRef} src={completionUrl} />

            <AnimatePresence>

                {/* ── LANDING (with popup overlay) ── */}
                {gameStatus === GAME_PHASES.LANDING && (
                    <motion.div
                        key="landing"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex-1 w-full relative z-10"
                    >
                        <LandingPage onStart={handleLandingStart} />

                        <AnimatePresence>
                            {showEntry && (
                                <EntryPopup onSubmit={handleEntryDone} onClose={handleEntryClose} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ── ENTRY TRANSITION ── */}
                {gameStatus === GAME_PHASES.ENTRY && (
                    <motion.div
                        key="entry-transition"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex-1 w-full relative z-10"
                    >
                        <LandingPage onStart={() => { }} />
                    </motion.div>
                )}

                {/* ── HOW TO PLAY ── */}
                {gameStatus === GAME_PHASES.HOW_TO_PLAY && (
                    <motion.div
                        key="htp"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-0 z-[1500] w-full h-[100dvh]"
                    >
                        <HowToPlay onStart={startGame} />
                    </motion.div>
                )}

                {/* ── PLAYING ── */}
                {gameStatus === GAME_PHASES.PLAYING && (
                    <motion.div
                        key="playing"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex-1 w-full flex flex-col items-center justify-between pb-4 relative z-10"
                    >
                        <GameHUD
                            timeLeft={timeLeft}
                            userName={entryDetails?.name}
                        />

                        <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 -mt-2 sm:-mt-4">
                            <GameGrid
                                grid={grid}
                                selectedCell={selectedCell}
                                explodingCells={explodingCells}
                                floatingScores={floatingScores}
                                activePraise={activePraise}
                                onCellTap={handleCellTap}
                            />
                        </div>

                        {/* Global Alert Area — Fixed at top to prevent bucket bar overlap */}
                        <div className="fixed top-32 inset-x-0 z-[500] pointer-events-none">
                            <AlertPopup message={alertMessage} color={alertColor} />
                        </div>

                        <BucketBar buckets={buckets} />
                    </motion.div>
                )}

                {/* ── FINISHED (brief transition) ── */}
                {gameStatus === GAME_PHASES.FINISHED && (
                    <motion.div
                        key="finished"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex-1 w-full flex items-center justify-center relative z-10"
                    >
                        {/* Simple Loading Spinner for results */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-t-bb-gold border-white/10 rounded-full animate-spin" />
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-white/60 font-game text-xl tracking-wider uppercase"
                            >
                                Calculated...
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* ── THANK YOU ── */}
                {gameStatus === GAME_PHASES.THANK_YOU && (
                    <motion.div
                        key="thankyou"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }}
                        className="fixed inset-0 z-[2000] bg-[#003366] overflow-hidden flex flex-col"
                    >
                        <ThankYou
                            userName={entryDetails?.name}
                            onRestart={restartGame}
                        />
                    </motion.div>
                )}

                {/* ── RESULT / EXITED ── */}
                {(gameStatus === GAME_PHASES.RESULT || gameStatus === GAME_PHASES.EXITED) && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }}
                        className="fixed inset-0 z-[1000] bg-[#003366] overflow-hidden flex flex-col"
                    >
                        <ResultScreen
                            finalScore={finalScore}
                            buckets={buckets}
                            userName={entryDetails?.name}
                            userPhone={entryDetails?.mobile}
                            onRestart={restartGame}
                            onBookSlot={handleBookSlot}
                        />
                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
});

export default BalanceBuilderPage;
