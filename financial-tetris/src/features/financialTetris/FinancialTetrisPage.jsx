import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TetrisLayout from '../../components/layout/TetrisLayout';
import IntroScreen from './components/IntroScreen';
import GameBoard from './components/GameBoard';
import ScoreDisplay from './components/ScoreDisplay';
import MilestoneOverlay from './components/MilestoneOverlay';
import GameOverScreen from './components/GameOverScreen';
import WinScreen from './components/WinScreen';
import ConversionScreen from './components/ConversionScreen';
import TutorialOverlay from './components/TutorialOverlay';

import { useTetrisEngine } from './hooks/useTetrisEngine';
import { useGameTimer } from './hooks/useGameTimer';
import { useKeyboardControls } from './hooks/useKeyboardControls';

import { GAME_STATUS, GAME_DURATION } from './constants/gameConfig';
import { getRandomMilestone } from './utils/milestoneMessages';
import { submitToLMS, updateLeadNew } from '../../utils/api';

const FinancialTetrisPage = () => {
    const {
        grid,
        currentPiece,
        nextPiece,
        score,
        linesCleared,
        gameStatus,
        setGameStatus,
        startGame,
        moveLeft,
        moveRight,
        moveDown,
        rotatePiece,
        spawnPiece,
        ghostPiece,
        resetGame
    } = useTetrisEngine();

    const [milestone, setMilestone] = useState(null);
    const [timeAtCompletion, setTimeAtCompletion] = useState(0);
    const [leadData, setLeadData] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);

    const handleTimeUp = useCallback(() => {
        if (gameStatus === GAME_STATUS.PLAYING) {
            setGameStatus(GAME_STATUS.WON);
        }
    }, [gameStatus, setGameStatus]);

    const { timeLeft, formatTime, resetTimer, addTime } = useGameTimer(gameStatus, handleTimeUp);

    useKeyboardControls(gameStatus, moveLeft, moveRight, moveDown, rotatePiece);

    // Handle Milestone and Timer Bonus
    useEffect(() => {
        if (gameStatus === GAME_STATUS.LINE_CLEARED) {
            setMilestone(getRandomMilestone());
        }
    }, [gameStatus]);

    const handleMilestoneDismiss = () => {
        setMilestone(null);
        setGameStatus(GAME_STATUS.PLAYING);
        spawnPiece();
    };

    const handleStart = (userData) => {
        setLeadData(userData);
        startGame(); // Initialize board and pieces
        setGameStatus(GAME_STATUS.TUTORIAL); // Override to pause engine
        setShowTutorial(true);
    };

    const handleTutorialComplete = () => {
        setShowTutorial(false);
        resetTimer();
        setGameStatus(GAME_STATUS.PLAYING);
    };

    const handleRestart = useCallback(() => {
        resetGame(); // This sets status to PLAYING and initializes board
        resetTimer(); // This resets the timer to 60s
        // We removed setGameStatus(IDLE) so it starts playing immediately
    }, [resetGame, resetTimer]);

    const handleBookSlot = useCallback(async (bookingInfo) => {
        const leadNo = sessionStorage.getItem('tetrisLeadNo');

        if (leadNo) {
            // Update existing lead with slot booking details
            return await updateLeadNew(leadNo, {
                firstName: leadData?.name || bookingInfo.name,
                mobile: leadData?.phone || bookingInfo.mobile_no,
                date: bookingInfo.date,
                time: bookingInfo.timeSlot,
                remarks: `Financial Tetris Slot Booking | Milestones: ${linesCleared}`
            });
        } else {
            // Fallback: Fresh booking lead
            return await submitToLMS({
                name: leadData?.name || bookingInfo.name,
                mobile_no: leadData?.phone || bookingInfo.mobile_no,
                param4: bookingInfo.date,
                param19: bookingInfo.timeSlot,
                score: linesCleared,
                summary_dtls: 'Financial Tetris - Slot Booking',
                p_data_source: 'FINANCIAL_TETRIS_BOOKING'
            });
        }
    }, [leadData, linesCleared]);

    const handleNextFromResults = useCallback(() => {
        setTimeAtCompletion(GAME_DURATION - timeLeft);
        setGameStatus('results');
    }, [timeLeft, setGameStatus]);

    // Handle Auto-transition to results
    useEffect(() => {
        if (gameStatus === GAME_STATUS.LOST || gameStatus === GAME_STATUS.WON) {
            const timer = setTimeout(() => {
                setGameStatus('results');
                setTimeAtCompletion(GAME_DURATION - timeLeft);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [gameStatus, timeLeft, setGameStatus]);

    // Touch Handling State
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const minSwipeDistance = 30;

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (!touchStartX.current || !touchStartY.current) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = touchStartX.current - currentX;
        const diffY = touchStartY.current - currentY;

        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) moveLeft();
            else moveRight();
            touchStartX.current = currentX;
        }

        if (diffY < -minSwipeDistance * 1.5) {
            moveDown();
            touchStartY.current = currentY;
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
        touchStartY.current = null;
    };

    return (
        <TetrisLayout>
            <AnimatePresence mode="wait">
                {gameStatus === GAME_STATUS.IDLE && (
                    <IntroScreen key="intro" onStart={handleStart} />
                )}

                {(gameStatus !== GAME_STATUS.IDLE && gameStatus !== 'results') && (
                    <motion.div
                        key="gameplay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full relative h-full flex flex-col pt-4"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="px-3">
                            <ScoreDisplay
                                score={linesCleared}
                                timeLeft={timeLeft}
                                formatTime={formatTime}
                                nextPiece={nextPiece}
                            />
                        </div>

                        <div className="flex-grow flex items-center justify-center px-4 relative">
                            <div className="w-full max-w-[320px] mx-auto">
                                <GameBoard
                                    grid={grid}
                                    currentPiece={currentPiece}
                                    ghostPiece={ghostPiece}
                                    onBoardClick={rotatePiece}
                                />
                            </div>
                        </div>

                        <MilestoneOverlay
                            isVisible={gameStatus === GAME_STATUS.LINE_CLEARED}
                            message={milestone}
                            onDismiss={handleMilestoneDismiss}
                        />

                        <TutorialOverlay
                            isVisible={showTutorial}
                            onStart={handleTutorialComplete}
                        />

                        {/* Game Over / Win Overlays */}
                        <AnimatePresence>
                            {gameStatus === GAME_STATUS.LOST && (
                                <GameOverScreen key="game-over" score={linesCleared} onNext={handleNextFromResults} />
                            )}
                            {gameStatus === GAME_STATUS.WON && (
                                <WinScreen key="win" onNext={handleNextFromResults} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {gameStatus === 'results' && (
                    <ConversionScreen
                        key="results"
                        score={linesCleared}
                        total={20}
                        leadData={leadData}
                        onRestart={handleRestart}
                        onBookSlot={handleBookSlot}
                    />
                )}
            </AnimatePresence>
        </TetrisLayout>
    );
};

export default FinancialTetrisPage;
