import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, GAME_STATUS } from '../features/game/context/GameContext';
import { useSnakeEngine } from '../features/game/hooks/useSnakeEngine';
import GameCanvas from '../features/game/components/GameCanvas';
import ReflectionOverlay from '../features/game/components/ReflectionOverlay';
import ConversionScreen from '../features/game/components/ConversionScreen';
import IntroScreen from '../features/game/components/IntroScreen';
import TutorialOverlay from '../features/game/components/TutorialOverlay';
import CalculatorForm from '../features/calculator/CalculatorForm';
import LeadCaptureForm from '../features/leadCapture/LeadCaptureForm';
import { Shield, Clock, Trophy } from 'lucide-react';
import { submitToLMS } from '../services/api';

const GamePage = () => {
    const { status, setStatus, score, highScore, toast, leadData, setLeadData, startGame, lastEatenMilestone, nextMilestone } = useGame();
    const { snake, previousSnake, pellet, timeLeft, speed, lastMoveTime, resetEngine, setIsPaused } = useSnakeEngine();
    const [recommendedCover, setRecommendedCover] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);
    const handleStart = (userData) => {
        setLeadData(userData);
        resetEngine();
        startGame(); // Set status to PLAYING so board renders
        setIsPaused(true); // But pause the engine immediately
        setShowTutorial(true);
    };

    const handleTutorialDismiss = () => {
        setShowTutorial(false);
        setIsPaused(false); // Unpause the engine when tutorial is gone
    };

    const handleBookSlot = async (bookingInfo) => {
        const result = await submitToLMS({
            ...bookingInfo,
            name: leadData?.name || bookingInfo.name,
            mobile_no: leadData?.phone || bookingInfo.mobile_no,
            score,
            summary_dtls: 'Snake Life - Appointment',
            param19: `Milestones: ${score}`
        });
        return result;
    };

    const handleCalculate = (cover) => {
        setRecommendedCover(cover);
        setStatus('CALCULATOR');
    };

    return (
        <div className="relative w-full max-w-md h-screen-safe mx-auto bg-[#0B1221] flex flex-col shadow-2xl overflow-hidden pt-safe">
            {/* Header Info */}
            {(status === GAME_STATUS.PLAYING || status === GAME_STATUS.PAUSED) && (
                <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 z-10 animate-fade-in font-outfit">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Trophy size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Milestones</p>
                            <p className="text-xl font-black text-primary leading-tight">{score}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`${timeLeft <= 15 ? 'bg-danger/10 animate-pulse-fast' : 'bg-secondary/10'} p-2 rounded-lg`}>
                            <Clock size={20} className={timeLeft <= 15 ? 'text-danger' : 'text-secondary'} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Time</p>
                            <p className={`text-xl font-black leading-tight ${timeLeft <= 15 ? 'text-danger' : 'text-secondary'}`}>{timeLeft}s</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {status === GAME_STATUS.START && (
                        <IntroScreen key="intro" onStart={handleStart} />
                    )}

                    {(status === GAME_STATUS.PLAYING || status === GAME_STATUS.REFLECTION || status === GAME_STATUS.GAMEOVER) && (
                        <motion.div
                            key="gameplay"
                            className="flex-1 flex flex-col p-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex-1 w-full mx-auto flex items-center justify-center p-1">
                                <GameCanvas
                                    snake={snake}
                                    previousSnake={previousSnake}
                                    pellet={pellet}
                                    nextMilestone={nextMilestone}
                                    lastEatenMilestone={lastEatenMilestone}
                                    speed={speed}
                                    lastMoveTime={lastMoveTime}
                                />
                                {/* Overlay the tutorial precisely on top of the canvas */}
                                {showTutorial && <TutorialOverlay onDismiss={handleTutorialDismiss} />}
                            </div>

                            {/* Milestone Achievement Message */}
                            <div className="mt-4 h-12 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {lastEatenMilestone && (
                                        <motion.div
                                            key={score}
                                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                            className="px-6 py-2 bg-secondary/10 border border-secondary/20 rounded-full"
                                        >
                                            <p className="text-secondary font-black text-sm uppercase tracking-widest text-center">
                                                {lastEatenMilestone.icon} {lastEatenMilestone.name} Milestone Achieved
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <ReflectionOverlay />
                        </motion.div>
                    )}

                    {status === GAME_STATUS.CTA && (
                        <ConversionScreen
                            key="results"
                            score={score}
                            total={20}
                            leadData={leadData}
                            onRestart={() => {
                                resetEngine();
                                setStatus(GAME_STATUS.START);
                            }}
                            onBookSlot={handleBookSlot}
                        />
                    )}

                    {status === 'CALCULATOR' && (
                        <CalculatorForm
                            key="calc"
                            onBack={() => setStatus(GAME_STATUS.CTA)}
                            onSubmit={handleCalculate}
                        />
                    )}

                    {status === 'LEAD_CAPTURE' && (
                        <LeadCaptureForm
                            key="lead"
                            recommendedCover={recommendedCover}
                            onBack={() => setStatus(GAME_STATUS.CTA)}
                        />
                    )}
                </AnimatePresence>

                {/* Toast Notification - Moved outside main AnimatePresence to fix blinking */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            className="absolute top-28 left-1/2 z-[100] bg-white/90 backdrop-blur-md border border-primary/20 px-6 py-2 rounded-full shadow-xl pointer-events-none"
                        >
                            <p className="text-primary font-bold text-sm whitespace-nowrap">{toast}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GamePage;
