import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { assessmentQuestions } from '../data/lifeGoals';

// Updated Video Mapping with new webm assets
const goalVideos = {
    1: './assets/videos/child_edu.mp4',
    2: './assets/videos/retirement.mp4',
    3: './assets/videos/house.mp4',
    5: './assets/videos/travel.mp4',
    6: './assets/videos/dream_car.mp4',
    7: './assets/videos/financial_security.mp4',
    8: './assets/videos/business.mp4',
    9: './assets/videos/health.mp4',
    10: './assets/videos/child_marriage.mp4'
};

const goalImages = {
    1: './assets/elements/child-edu.png',
    2: './assets/elements/retirement.png',
    3: './assets/elements/house.png',
    5: './assets/elements/travel.png',
    6: './assets/elements/dream_car.png',
    7: './assets/elements/financial_security.png',
    8: './assets/elements/Planning.png',
    9: './assets/elements/health.png',
    10: './assets/elements/child_marriage.png'
};

const GoalAssessmentScreen = ({
    currentGoal,
    currentGoalIndex,
    currentQuestionIndex,
    onAnswer,
    score,
    lives
}) => {
    const [showIntro, setShowIntro] = useState(currentQuestionIndex === 0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAnswering, setIsAnswering] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const timerRef = useRef(null);

    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const totalProgress = ((currentGoalIndex * 3) + currentQuestionIndex + 1) / 9 * 100;

    useEffect(() => {
        if (showIntro) {
            const timer = setTimeout(() => {
                setShowIntro(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showIntro]);

    useEffect(() => {
        if (showIntro) return;

        setIsAnswering(false);
        setSelectedAnswer(null);
        setTimeLeft(30);

        const timerCallback = () => {
            setTimeLeft(prev => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        };

        timerRef.current = setInterval(timerCallback, 1000);
        return () => clearInterval(timerRef.current);
    }, [currentGoalIndex, currentQuestionIndex, showIntro]);

    useEffect(() => {
        if (timeLeft === 0 && !isAnswering && !showIntro) {
            clearInterval(timerRef.current);
            setIsAnswering(true);
            onAnswer(false);
        }
    }, [timeLeft, isAnswering, onAnswer, showIntro]);

    const handleAnswer = (answer) => {
        if (isAnswering || showIntro) return;
        setIsAnswering(true);
        setSelectedAnswer(answer);
        clearInterval(timerRef.current);



        setTimeout(() => {
            onAnswer(answer);
        }, 300);
    };

    if (!currentGoal || !currentQuestion) return null;

    return (
        <div className="ghibli-card">
            <div className="bg-burst"></div>

            <AnimatePresence mode='wait'>
                {showIntro ? (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0066B2] p-4 text-center"
                    >
                        <div className="absolute inset-0 bg-[url('/assets/images/background_burst.png')] opacity-80 mix-blend-overlay bg-cover bg-center" />

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10"
                        >
                            <h2 className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-2">Next Goal</h2>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white font-black drop-shadow-lg mb-6 leading-tight px-4">
                                {currentGoal.name}
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                            className="relative z-10 w-72 h-72 sm:w-96 sm:h-96 mb-8 flex items-center justify-center overflow-hidden pt-4"
                        >
                            <motion.img
                                key={currentGoal.id}
                                src={goalImages[currentGoal.id]}
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        <motion.p className="relative z-10 text-blue-100 font-bold text-lg animate-pulse">Get Ready...</motion.p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ghibli-content justify-between sm:justify-center py-2 sm:py-4"
                    >
                        {/* Header Area - Top bar with GOAL and Timer */}
                        <div className="w-full shrink-0 mb-3 sm:mb-4">
                            <header className="flex items-center justify-between mb-3">
                                <span className="text-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                    GOAL {currentGoalIndex + 1}/3
                                </span>
                                <div className="relative w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
                                    <svg className="absolute w-full h-full -rotate-90 scale-110">
                                        <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="transparent" />
                                        <motion.circle
                                            cx="50%" cy="50%" r="45%"
                                            stroke={timeLeft <= 10 ? '#EF4444' : '#FF8C00'}
                                            strokeWidth="3" fill="transparent"
                                            strokeDasharray="100"
                                            animate={{ strokeDashoffset: 100 - (100 * (timeLeft / 30)) }}
                                            transition={{ duration: 1, ease: "linear" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className={`text-sm sm:text-lg font-black ${timeLeft <= 10 ? 'text-red-300' : 'text-white'}`}>{timeLeft}</span>
                                </div>
                            </header>

                            <div className="progress-track h-2 sm:h-2.5">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            {/* Goal Title - Centered, Large, Dominant - Reduced top margin */}
                            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl pt-8 font-extrabold drop-shadow-md text-center mt-1 uppercase">
                                {currentGoal.name}
                            </h2>
                        </div>


                        {/* Main Questions Container - Compact layout to fit single screen */}
                        <div className="flex-1 flex flex-col justify-center items-center gap-0 sm:gap-3 w-full min-h-0 pb-4">

                            {/* Animation/Video - 3-layer containment to prevent clipping */}
                            {/* Layer 1: Safe Zone - NO overflow-hidden */}
                            <div className="w-full flex justify-center items-center flex-grow pt-2 sm:pt-8">
                                {/* Layer 2: Frame - Size controller - Increased for better visibility */}
                                <div className="relative w-[380px] h-[380px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px] flex items-center justify-center">
                                    {/* Layer 3: Animation - Constrained, NO absolute positioning */}
                                    <AnimatePresence mode='wait'>
                                        <motion.video
                                            key={currentGoal.id}
                                            src={goalVideos[currentGoal.id]}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="max-w-full max-h-full object-contain"
                                            style={{
                                                maskImage: 'radial-gradient(circle, black 35%, transparent 80%)',
                                                WebkitMaskImage: 'radial-gradient(circle, black 35%, transparent 80%)'
                                            }}
                                        />
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Question Card - Increased padding and text size */}
                            <motion.div
                                key={`${currentGoal.id}-${currentQuestionIndex}`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full mx-0.5 sm:mx-1 md:mx-2 bg-white/95 backdrop-blur-sm p-3 sm:p-5 shadow-2xl border-4 border-white/50 text-center mb-2"
                            >
                                <h3 className="text-[#0066B2] text-lg sm:text-xl md:text-2xl font-black leading-snug drop-shadow-sm">
                                    {currentQuestion.text.replace(/this (life )?goal/gi, `"${currentGoal.name}"`)}
                                </h3>
                            </motion.div>

                            {/* Action Buttons - Increased size */}
                            <div className="w-full mx-0.5 sm:mx-1 md:mx-2 grid grid-cols-2 gap-3 sm:gap-5 mb-6">
                                <button
                                    onClick={() => handleAnswer(true)}
                                    disabled={isAnswering}
                                    className={`relative !py-3 sm:!py-4 !text-lg sm:!text-xl font-black transition-all border-4 uppercase tracking-widest active:translate-y-1 active:shadow-none shadow-[0_6px_0_rgba(0,0,0,0.2)] ${isAnswering && selectedAnswer === true
                                        ? 'bg-[#FF8C00] border-[#FF8C00] text-slate-900 shadow-[0_6px_0_#993D00]'
                                        : 'bg-white border-white/50 text-[#0066B2] hover:bg-slate-50'
                                        }`}
                                >
                                    YES
                                </button>
                                <button
                                    onClick={() => handleAnswer(false)}
                                    disabled={isAnswering}
                                    className={`relative !py-3 sm:!py-4 !text-lg sm:!text-xl font-black transition-all border-4 uppercase tracking-widest active:translate-y-1 active:shadow-none shadow-[0_6px_0_rgba(0,0,0,0.2)] ${isAnswering && selectedAnswer === false
                                        ? 'bg-[#FF8C00] border-[#FF8C00] text-slate-900 shadow-[0_6px_0_#993D00]'
                                        : 'bg-white border-white/50 text-[#0066B2] hover:bg-slate-50'
                                        }`}
                                >
                                    NO
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GoalAssessmentScreen;
