import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Assets for dynamic sequences
import greenShield from '../../assets/image/tiles/green_shield.png';

const MOCK_TILES = [greenShield, greenShield, greenShield];

const TutorialOverlay = memo(function TutorialOverlay({ onComplete }) {
    const [step, setStep] = useState(1);
    const [isFinished, setIsFinished] = useState(false);
    const [showGo, setShowGo] = useState(false);

    // Hardcode layout sequences natively mapped to standard 390x844 responsive centers
    const STEPS = [
        { id: 0, w: 0, h: 0, x: "50%", y: "45%", br: "50%" },
        {
            id: 1, w: 90, h: 90, x: "calc(50% - 120px)", y: "calc(45% - 120px)", br: "50%",
            tTitle: "TAP A TILE", tSub: "Select any tile to start a swap",
            dur: 2500
        },
        {
            id: 2, w: 160, h: 90, x: "calc(50% - 120px)", y: "calc(45% - 120px)", br: "45px",
            tTitle: "SWIPE TO SWAP", tSub: "Drag to swap with any adjacent tile",
            dur: 3000
        },
        {
            id: 3, w: 220, h: 90, x: "calc(50% - 110px)", y: "calc(45% - 20px)", br: "45px",
            tTitle: "MATCH 3 OR MORE", tSub: "Same tiles in a row or column = points!",
            dur: 3000
        },
        {
            id: 4, w: 360, h: 140, x: "calc(50% - 180px)", y: "calc(100% - 160px)", br: "24px",
            tTitle: "FILL YOUR BUCKETS", tSub: "Each match fills your financial goals",
            dur: 2500
        },
        {
            id: 5, w: 120, h: 80, x: "calc(50% - 60px)", y: "15px", br: "40px",
            tTitle: "2 MINUTES!", tSub: "Match as many as you can before time runs out",
            dur: 2000
        }
    ];

    const currentStep = STEPS[step] || STEPS[0];

    useEffect(() => {
        if (step > 5 || isFinished) return;
        const timer = setTimeout(() => {
            if (step === 5) {
                handleFinish();
            } else {
                setStep(s => s + 1);
            }
        }, currentStep.dur);
        return () => clearTimeout(timer);
    }, [step, isFinished, currentStep.dur]);

    const handleFinish = () => {
        if (isFinished) return;
        setIsFinished(true);
        setStep(5); // Pause spotlight on final visual
        setTimeout(() => {
            setShowGo(true);
            setTimeout(() => {
                setShowGo(false);
                setTimeout(onComplete, 100);
            }, 600); // Go POP sequence finishes natively
        }, 300); // Slight delay for overlay fadeout
    };

    return (
        <AnimatePresence>
            {!isFinished && (
                <motion.div
                    key="tutorial-veil"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 z-[5000] overflow-hidden pointer-events-auto touch-none"
                >
                    {/* The Spotlight Cutout Element rendering 9999px shadows purely functionally */}
                    <div className="absolute inset-0">
                        <motion.div
                            initial={{ x: "50%", y: "45%", width: 0, height: 0, borderRadius: "50%" }}
                            animate={{
                                x: currentStep.x,
                                y: currentStep.y,
                                width: currentStep.w,
                                height: currentStep.h,
                                borderRadius: currentStep.br
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute top-0 left-0 bg-transparent ring-[1px] ring-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                        >
                            {/* Explicit Dynamic Visual Triggers bound inside the Spotlight Hole */}
                            <AnimatePresence>
                                {/* STEP 3: MATCH 3 BURST MOCK */}
                                {step === 3 && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center gap-1 p-2 overflow-visible z-50 pointer-events-none"
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: [1, 1, 0], scale: [1, 1.25, 0.3], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(2)'] }}
                                        transition={{ duration: 2.2, times: [0, 0.85, 1], delay: 0.6 }}
                                    >
                                        {MOCK_TILES.map((src, i) => (
                                            <img key={i} src={src} className="w-[60px] h-[60px] object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" alt="" />
                                        ))}
                                    </motion.div>
                                )}

                                {/* STEP 4: BUCKET FILL FLOATERS */}
                                {step === 4 && (
                                    <motion.div
                                        className="absolute -top-10 inset-x-0 flex justify-center gap-6 z-50 pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 1, 0], y: [0, -30, -30, -50] }}
                                        transition={{ duration: 1.5, delay: 0.5, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
                                    >
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <span key={i} className="text-[#10B981] font-black text-xl drop-shadow-[0_0_8px_rgba(255,255,255,1)]">+10</span>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Tooltip Card explicitly syncing coordinates and fade loops per phase */}
                    <AnimatePresence mode="wait">
                        {step >= 1 && step <= 5 && (
                            <motion.div
                                key={`tooltip-${step}`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                className="absolute pointer-events-none z-50 flex flex-col items-center"
                                style={{
                                    // Manual offset responsive tracking
                                    left: "calc(50% - 130px)", // 260px wide box centered
                                    top: step === 5 ? "calc(15px + 90px)" : step === 4 ? "calc(100% - 230px)" : `calc(45% + ${step === 3 ? 80 : 0}px)`
                                }}
                            >
                                {/* Tooltip Container */}
                                <div className="w-[260px] bg-[#0D1B3E] border border-[#D4A017] rounded-xl p-3 shadow-[0_15px_30px_rgba(0,0,0,0.8)] text-center relative z-10 flex flex-col gap-1 ring-1 ring-white/10">
                                    <h3 className="text-white font-black text-[16px] uppercase tracking-widest drop-shadow-md">{currentStep.tTitle}</h3>
                                    <p className="text-blue-200 text-[12px] leading-snug font-medium">{currentStep.tSub}</p>
                                </div>
                                {/* Center Arrow Pointing logic */}
                                {step !== 4 && <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#D4A017] -mt-1" style={{ transform: step === 5 ? 'rotate(180deg) translateY(12px)' : 'none' }} />}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Simple Hand Cursor Mock Animations executing structural pathing over strictly fixed sequences */}
                    {step === 1 && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0, x: "calc(50% - 70px)", y: "calc(45% - 70px)" }}
                            animate={{ scale: [1, 0.85, 1, 1], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 1.5, times: [0, 0.2, 0.4, 1], repeat: Infinity }}
                            className="absolute z-[100] text-5xl pointer-events-none drop-shadow-[0_5px_8px_rgba(0,0,0,0.8)]"
                        >
                            👆
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0, x: "calc(50% - 70px)", y: "calc(45% - 70px)" }}
                            animate={{ x: ["calc(50% - 70px)", "calc(50%)", "calc(50%)"], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 2, times: [0, 0.3, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
                            className="absolute z-[100] text-5xl pointer-events-none drop-shadow-[0_5px_8px_rgba(0,0,0,0.8)]"
                        >
                            👆
                        </motion.div>
                    )}

                    {/* SKIP BUTTON strictly positioned top-right entirely outside flow dependencies */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        onClick={handleFinish}
                        className="absolute top-4 right-4 z-[9999] bg-[#0D1B3E] border border-[#D4A017] rounded-full px-4 py-1.5 text-white font-bold text-xs uppercase shadow-xl hover:bg-red-800 transition-colors"
                    >
                        SKIP ✕
                    </motion.button>

                </motion.div>
            )}

            {/* "GO!" Burst sequence rendered structurally over top exclusively finalizing the chain */}
            <AnimatePresence>
                {showGo && (
                    <motion.div
                        key="go-text-burst"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: [0.5, 1.3, 1], opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", times: [0, 0.5, 1] }}
                        className="absolute inset-0 z-[6000] flex items-center justify-center pointer-events-none"
                    >
                        <span
                            className="font-game text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white to-[#D4A017]"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(212,160,23,0.8))' }}
                        >
                            GO!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
});

export default TutorialOverlay;
