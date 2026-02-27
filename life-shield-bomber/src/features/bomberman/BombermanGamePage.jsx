/**
 * BombermanGamePage — Main orchestrating page for Life Shield Bomber.
 * Conditionally renders components based on game phase.
 * All logic is in useBombermanEngine hook — this component is purely presentational.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useBombermanEngine } from './hooks/useBombermanEngine.js';
import { GAME_PHASES } from './constants/gameConstants.js';

import Background from './components/Background.jsx';
import LandingPage from './components/LandingPage.jsx';
import EntryPopup from './components/EntryPopup.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import GameHUD from './components/GameHUD.jsx';
import GameGrid from './components/GameGrid.jsx';
import MobileControls from './components/MobileControls.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import ThankYou from './components/ThankYou.jsx';

function BombermanGamePage() {
    const {
        gamePhase,
        grid,
        playerPos,
        health,
        score,
        risksDestroyed,
        timeLeft,
        activePraise,
        floatingScores,
        entryDetails,
        shakeScreen,
        finalScore,
        isInvulnerable,
        shields,
        monsters,
        activePowerup,
        getCooldownProgress,

        movePlayer,
        placeBomb,
        handleEntrySubmit,
        startGame,
        exitGame,
        restartGame,
        goToHowToPlay,
        handleBookSlot,
        showThankYou,
    } = useBombermanEngine();

    const [showEntry, setShowEntry] = useState(false);

    const handleLandingStart = useCallback(() => {
        if (entryDetails) {
            goToHowToPlay();
        } else {
            setShowEntry(true);
        }
    }, [entryDetails, goToHowToPlay]);

    const handleEntryDone = useCallback(async (name, mobile) => {
        await handleEntrySubmit(name, mobile);
        setShowEntry(false);
    }, [handleEntrySubmit]);

    const handleEntryClose = useCallback(() => {
        setShowEntry(false);
    }, []);

    return (
        <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden">
            <Background />

            {/* ─── LANDING PHASE ───────────────────────────────────── */}
            {gamePhase === GAME_PHASES.LANDING && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                >
                    <LandingPage onStart={handleLandingStart} />

                    <AnimatePresence>
                        {showEntry && (
                            <EntryPopup
                                onSubmit={handleEntryDone}
                                onClose={handleEntryClose}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ─── HOW TO PLAY ─────────────────────────────────────── */}
            {gamePhase === GAME_PHASES.HOW_TO_PLAY && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                >
                    <HowToPlay onStart={startGame} />
                </motion.div>
            )}

            {/* ─── PLAYING PHASE ──────────────────────────────────── */}
            {(gamePhase === GAME_PHASES.PLAYING || gamePhase === GAME_PHASES.FINISHED) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`relative z-10 flex flex-col h-full ${shakeScreen ? 'animate-shake' : ''}`}
                >
                    {/* Low health vignette */}
                    {health === 1 && (
                        <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(239,68,68,0.2)_100%)] animate-pulse" />
                    )}

                    <GameHUD
                        timeLeft={timeLeft}
                        health={health}
                        score={score}
                        onExit={exitGame}
                    />

                    {/* Praise Popup Area (Fixed between HUD and Grid) */}
                    <div className="w-full h-0 flex items-center justify-center relative z-20 pointer-events-none overflow-visible">
                        {activePraise && (
                            <div className="absolute -top-3 animate-pop-in px-6 py-2 rounded-full bg-[#1e40af]/95 backdrop-blur-md border border-[#60A5FA] shadow-[0_0_15px_rgba(59,130,246,0.4)] whitespace-nowrap">
                                <span className="font-display text-[0.65rem] sm:text-xs font-black text-white uppercase tracking-widest drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)]">
                                    {activePraise}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <GameGrid
                            grid={grid}
                            playerPos={playerPos}
                            shields={shields}
                            monsters={monsters}
                            activePowerup={activePowerup}
                            floatingScores={floatingScores}
                            activePraise={activePraise}
                            isInvulnerable={isInvulnerable}
                        />
                    </div>

                    {gamePhase === GAME_PHASES.PLAYING && (
                        <MobileControls
                            onMove={movePlayer}
                            onAction={placeBomb}
                            getCooldownProgress={getCooldownProgress}
                        />
                    )}

                    {/* Game Over Overlay */}
                    {gamePhase === GAME_PHASES.FINISHED && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="text-center"
                            >
                                <h2 className="font-display text-4xl font-extrabold text-white mb-2">
                                    {health <= 0 ? '💥 Game Over' : timeLeft <= 0 ? '⏰ Time Up!' : '🚪 Mission Complete!'}
                                </h2>
                                <p className="text-white/60 font-medium">
                                    Calculating your protection score...
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* ─── RESULT PHASE ────────────────────────────────────── */}
            {gamePhase === GAME_PHASES.RESULT && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                >
                    <ResultScreen
                        finalScore={finalScore}
                        risksDestroyed={risksDestroyed}
                        health={health}
                        timeLeft={timeLeft}
                        score={score}
                        onBookSlot={handleBookSlot}
                        onShowThankYou={showThankYou}
                        onRestart={goToHowToPlay}
                        entryDetails={entryDetails}
                    />
                </motion.div>
            )}

            {/* ─── THANK YOU PHASE ─────────────────────────────────── */}
            {gamePhase === GAME_PHASES.THANK_YOU && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                >
                    <ThankYou onRestart={goToHowToPlay} entryDetails={entryDetails} />
                </motion.div>
            )}
        </div>
    );
}

export default BombermanGamePage;
