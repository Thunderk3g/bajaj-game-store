/**
 * BalanceBuilderPage — Main orchestrator.
 * Flow: Landing → Entry Popup → How To Play → 2-min Gameplay → Result → ThankYou
 */
import { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import LandingPage from './components/LandingPage.jsx';
import EntryPopup from './components/EntryForm.jsx';
import GameHUD from './components/GameHUD.jsx';
import GameGrid from './components/GameGrid.jsx';
import BucketBar from './components/BucketBar.jsx';
import AlertPopup from './components/AlertPopup.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import PostGameLeadCapture from './components/PostGameLeadCapture.jsx';
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
        handleCellSwipe,
        exitGame,
        restartGame,
        showThankYou,
        handleLeadSuccess,
        handleBookSlot,
    } = useMatchGame();

    const {
        gameStatus,
        timeLeft,
        grid,
        totalMatches,
        selectedCell,
        explodingCells,
        floatingScores,
        activePraise,
        invalidSwapping,
        buckets,
        entryDetails,
    } = state;

    const [showEntry, setShowEntry] = useState(false);
    const audioRef = useRef(null);
    const completionAudioRef = useRef(null);
    const [isPlayingBGM, setIsPlayingBGM] = useState(false);

    // ── Idle Engagement Popup ──────────────────────────────────────
    const IDLE_MESSAGES = useMemo(() => [
        '⏳ Hurry up! Time is ticking fast!',
        '🎯 Make your move! Match 3 to score!',
        '🔥 Keep going! Your goals are waiting!',
        '💡 Swipe a tile to fill your bucket!',
        "⚡ Don't stop now — you're so close!",
    ], []);
    const idleTimerRef = useRef(null);
    const [idleMessage, setIdleMessage] = useState(null);
    const idleMsgIndexRef = useRef(0);

    const prevBucketsRef = useRef(null);

    // 3. Reset bucket tracking ref on restart
    useEffect(() => {
        if (gameStatus === GAME_PHASES.LANDING || gameStatus === GAME_PHASES.HOW_TO_PLAY) {
            prevBucketsRef.current = null;
        }
    }, [gameStatus]);

    // Helper: reset idle timer
    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        setIdleMessage(null);

        if (gameStatus === GAME_PHASES.PLAYING) {
            // Wait 4s of absolute silence
            idleTimerRef.current = setTimeout(() => {
                const msg = IDLE_MESSAGES[idleMsgIndexRef.current % IDLE_MESSAGES.length];
                idleMsgIndexRef.current = (idleMsgIndexRef.current + 1) % IDLE_MESSAGES.length;
                setIdleMessage(msg);

                // Show for 3s then CLEAR AND RESTART the idle cycle
                idleTimerRef.current = setTimeout(() => {
                    setIdleMessage(null);
                    // Recursive call to start a new 4s wait period if still silent
                    resetIdleTimer();
                }, 3000);
            }, 4000);
        }
    }, [gameStatus, IDLE_MESSAGES]);

    // Start idle timer when game starts, clear when game ends
    useEffect(() => {
        if (gameStatus === GAME_PHASES.PLAYING) {
            resetIdleTimer();
        } else {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            setIdleMessage(null);
        }
        return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
    }, [gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handleEntryDone = useCallback(
        async (name, mobile) => {
            handleUserInteraction();
            await handleEntrySubmit(name, mobile);
            setShowEntry(false);
        },
        [handleEntrySubmit, handleUserInteraction]
    );

    const handleLandingStart = useCallback(() => {
        handleUserInteraction();
        // Lead popup disabled — start game directly
        handleEntryDone('', '');
    }, [handleUserInteraction, handleEntryDone]);

    const handleTileSwipe = useCallback((...args) => {
        resetIdleTimer();
        handleCellSwipe(...args);
    }, [resetIdleTimer, handleCellSwipe]);

    const handleTileTap = useCallback((...args) => {
        resetIdleTimer();
        handleCellTap(...args);
    }, [resetIdleTimer, handleCellTap]);

    const handleEntryClose = useCallback(() => {
        setShowEntry(false);
    }, []);

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            {/* Fully responsive output frame locking — caps at 390x844 but shrinks gracefully on small phones like iPhone SE */}
            <div
                className="relative overflow-hidden text-white font-sans"
                style={{ width: '100%', maxWidth: '390px', height: '100dvh', maxHeight: '844px' }}
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
                            className="flex-1 w-full relative z-10 h-full"
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
                            className="flex-1 w-full relative z-10 h-full"
                        >
                            <LandingPage onStart={() => { }} />
                        </motion.div>
                    )}

                    {/* How-To-Play screen deleted as requested */}

                    {/* ── PLAYING ── */}
                    {gameStatus === GAME_PHASES.PLAYING && (
                        <motion.div
                            key="playing"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            // TASK 9: 16px gap spacing specifically explicitly between header, grid, and footer 
                            className="flex-1 w-full h-full max-w-[390px] mx-auto flex flex-col items-center justify-between pb-0 relative z-10 gap-2"
                        >
                            <GameHUD
                                timeLeft={timeLeft}
                                userName={entryDetails?.name}
                            />

                            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 mt-2">
                                {/* Idle Engagement Popup — between subtitle and game grid */}
                                <div style={{ minHeight: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', width: '100%' }}>
                                    {idleMessage && (
                                        <motion.div
                                            key={idleMessage}
                                            initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                background: 'linear-gradient(90deg, rgba(212,160,23,0.18) 0%, rgba(212,160,23,0.32) 50%, rgba(212,160,23,0.18) 100%)',
                                                border: '1.5px solid #D4A017',
                                                borderRadius: '20px',
                                                padding: '5px 18px',
                                                color: '#FFE57A',
                                                fontFamily: "'Outfit', sans-serif",
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                letterSpacing: '0.5px',
                                                textAlign: 'center',
                                                boxShadow: '0 2px 12px rgba(212,160,23,0.25)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {idleMessage}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Auto-scaler for iPhone SE checking BOTH horizontal tightness and vertical shortness */}
                                <div className="flex justify-center items-center" style={{ transform: 'scale(min(1, calc(100vw / 360), calc(100dvh / 680)))', transformOrigin: 'top center' }}>
                                    <GameGrid
                                        grid={grid}
                                        totalMatches={totalMatches}
                                        selectedCell={selectedCell}
                                        explodingCells={explodingCells}
                                        invalidSwapping={invalidSwapping}
                                        floatingScores={floatingScores}
                                        activePraise={activePraise}
                                        onCellTap={handleTileTap}
                                        onCellSwipe={handleTileSwipe}
                                    />
                                </div>
                            </div>

                            {/* TASK 2: AlertPopup fully removed to eradicate red banner notifications */}

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

                    {/* ── POST-GAME LEAD CAPTURE ── */}
                    {gameStatus === GAME_PHASES.POST_GAME_LEAD && (
                        <motion.div
                            key="post-game-lead"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute inset-0 z-[2000]"
                        >
                            <PostGameLeadCapture
                                score={finalScore}
                                onSuccess={handleLeadSuccess}
                            />
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
        </div>
    );
});

export default BalanceBuilderPage;
