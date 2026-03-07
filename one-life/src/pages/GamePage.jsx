import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, GAME_STATUS } from '../features/game/context/GameContext';
import { useGameEngine } from '../features/game/hooks/useGameEngine';
import GameCanvas from '../features/game/components/GameCanvas';
import GameOverOverlay from '../features/game/components/GameOverOverlay';
import ConversionScreen from '../features/game/components/ConversionScreen';
import IntroScreen from '../features/game/components/IntroScreen';
import TutorialOverlay from '../features/game/components/TutorialOverlay';
import ThankYouScreen from '../features/game/components/ThankYouScreen';
import LifeLostPopup from '../features/game/components/LifeLostPopup';
import { submitToLMS } from '../services/api';

const GamePage = () => {
    const {
        status, setStatus, score, leadData, setLeadData, startGame,
        lives, phase, comboMultiplier, risksAvoided,
    } = useGame();

    const {
        canvasRef, startEngine, stopEngine,
        heartShake, isCrashing, screenShake,
        canvasWidth, canvasHeight,
        lifeLostPopup, dismissLifeLostPopup, handleGameOverFromPopup,
    } = useGameEngine();

    const [showTutorial, setShowTutorial] = useState(false);

    const handleStart = (userData) => {
        setLeadData(userData);
        startGame();
        setShowTutorial(true);
    };

    const handleTutorialDismiss = () => {
        setShowTutorial(false);
        startEngine();
    };

    const handleRestart = () => {
        startGame();
        // Small delay to let state reset before starting engine
        setTimeout(() => startEngine(), 100);
    };

    const handleBookSlot = async (bookingInfo) => {
        const result = await submitToLMS({
            ...bookingInfo,
            name: leadData?.name || bookingInfo.name,
            mobile_no: leadData?.phone || bookingInfo.mobile_no,
            score,
            summary_dtls: 'One Life - Appointment',
        });
        return result;
    };

    // When GAME_OVER (lives lost), go to CTA after short delay
    useEffect(() => {
        if (status === GAME_STATUS.GAME_OVER) {
            const timer = setTimeout(() => {
                setStatus(GAME_STATUS.CTA);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [status, setStatus]);

    // Track analytics events
    useEffect(() => {
        const trackEvent = (event) => {
            console.log(`[Analytics] ${event}`, { score, phase, lives });
        };

        if (status === GAME_STATUS.PLAYING && phase === 1) trackEvent('game_start');
        if (status === GAME_STATUS.PLAYING && phase === 2) trackEvent('phase_2_start');
        if (status === GAME_STATUS.PLAYING && phase === 3) trackEvent('phase_3_start');
        if (status === GAME_STATUS.CRASH) trackEvent('crash_triggered');
        if (status === GAME_STATUS.CTA) trackEvent('cta_shown');
        if (status === GAME_STATUS.THANK_YOU) trackEvent('lead_submitted');
    }, [status, phase]);

    return (
        <div className="w-full h-[100dvh] flex justify-center items-center bg-[#0B1221] overflow-hidden">
            <div className="relative w-full max-w-md h-full mx-auto bg-[#0B1221] flex flex-col shadow-2xl overflow-hidden md:h-[850px] md:max-h-[95dvh] md:rounded-3xl border border-white/5">
                {/* Main Area */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {status === GAME_STATUS.START && (
                            <IntroScreen key="intro" onStart={handleStart} />
                        )}

                        {(status === GAME_STATUS.PLAYING || status === GAME_STATUS.CRASH) && (
                            <motion.div
                                key="gameplay"
                                className="flex-1 flex flex-col relative"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="flex-1 w-full flex items-center justify-center">
                                    <GameCanvas
                                        canvasRef={canvasRef}
                                        canvasWidth={canvasWidth}
                                        canvasHeight={canvasHeight}
                                    />
                                    {showTutorial && (
                                        <TutorialOverlay onDismiss={handleTutorialDismiss} />
                                    )}
                                </div>

                                {/* Life Lost Popup Overlay */}
                                <AnimatePresence>
                                    {lifeLostPopup && (
                                        <LifeLostPopup
                                            message={lifeLostPopup.message}
                                            type={lifeLostPopup.type}
                                            onContinue={dismissLifeLostPopup}
                                            onGameOver={handleGameOverFromPopup}
                                            onRestart={handleRestart}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Game Over Overlay (car crash) */}
                                <GameOverOverlay />
                            </motion.div>
                        )}

                        {status === GAME_STATUS.CTA && (
                            <ConversionScreen
                                key="results"
                                score={score}
                                leadData={leadData}
                                onBookSlot={handleBookSlot}
                                onRestart={handleRestart}
                            />
                        )}

                        {status === GAME_STATUS.THANK_YOU && (
                            <ThankYouScreen
                                key="thankyou"
                                leadName={leadData?.name}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default GamePage;
