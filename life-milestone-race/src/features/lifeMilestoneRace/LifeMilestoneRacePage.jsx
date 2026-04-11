import { memo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GAME_PHASES } from './constants/lifeStages';
import { useRaceEngine } from './hooks/useRaceEngine';
import { useTimer } from './hooks/useTimer';
import RaceLayout from '../../components/layout/RaceLayout';
import IntroScreen from './components/IntroScreen';
import StageSelection from './components/StageSelection';
import ResultScreen from './components/ResultScreen';
import PostGameLeadCapture from './components/PostGameLeadCapture';
import QuestionScreen from './components/QuestionScreen';

const EVENT_TIMER_SECONDS = 15;

/**
 * Feedback overlay shown as a POPUP on top of the screen.
 */
const FeedbackOverlay = memo(function FeedbackOverlay({ feedback, onContinue }) {
    if (!feedback) return null;

    const isProtected = feedback.decision === 'protected';
    const isPositive = feedback.delta > 0;

    return (
        <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="w-[85%] max-w-[300px] rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden ring-2 ring-white/10"
                style={{
                    background: isProtected
                        ? 'linear-gradient(145deg, #1e1b4b 0%, #064e3b 100%)'
                        : 'linear-gradient(145deg, #1e1b4b 0%, #450a0a 100%)',
                }}
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[40px] opacity-40 ${isProtected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[40px] opacity-20 bg-white" />
                </div>

                <div className="relative mb-3">
                    <div className={`absolute inset-0 rounded-full blur-lg opacity-60 animate-pulse ${isProtected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-[2.2rem] relative z-10 shadow-xl border-[4px] border-white/10"
                        style={{
                            background: isProtected
                                ? 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)'
                                : 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
                        }}
                    >
                        {isProtected ? '🛡️' : '⚠️'}
                    </div>
                </div>

                <h3 className="text-[1.4rem] font-black uppercase italic tracking-tighter mb-1 leading-none text-white drop-shadow-md relative z-10">
                    {isProtected ? 'YOU\'RE PROTECTED!' : 'YOU\'RE EXPOSED!'}
                </h3>

                <p className="text-blue-100 font-bold leading-tight mb-4 text-[0.7rem] px-1 relative z-10 opacity-90">
                    {feedback.title}
                </p>

                <div className="relative z-10 mb-5">
                    <div className="flex flex-col items-center">
                        <span className="text-white/60 text-[0.55rem] font-bold uppercase tracking-[0.2em] mb-0.5">Impact on Score</span>
                        <div className={`text-[2.2rem] font-black leading-none flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{feedback.delta}
                        </div>
                    </div>
                </div>

                <motion.button
                    onClick={onContinue}
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-3 rounded-xl font-black text-white text-sm uppercase tracking-wide shadow-lg relative z-10 overflow-hidden group"
                    style={{
                        background: 'linear-gradient(90deg, #FFFFFF 0%, #F0F9FF 100%)',
                        color: isProtected ? '#16a34a' : '#dc2626'
                    }}
                >
                    <span className="relative z-10">CONTINUE</span>
                    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-20 transition-opacity" />
                </motion.button>
            </motion.div>
        </motion.div>
    );
});

const LifeMilestoneRacePage = memo(function LifeMilestoneRacePage() {
    const engine = useRaceEngine();

    const {
        gameId,
        phase,
        score,
        currentEvent,
        currentEventIndex,
        eventQueue,
        timeline,
        lastFeedback,
        isTimerActive,
        protectionCategory,
        finalScore,
        riskGaps,
        userName,
        userPhone,
        selectedStageData,
        startGame,
        selectStage,
        makeDecision,
        handleTimerExpire,
        advanceToNextEvent,
        showThankYou,
        restartGame,
        setUserName,
        setUserPhone,
        setPhase,
    } = engine;

    const { timeLeft, progress: timerProgress } = useTimer(
        EVENT_TIMER_SECONDS,
        handleTimerExpire,
        isTimerActive,
    );

    // Auto-transition from FINISH to POST_GAME_LEAD
    useEffect(() => {
        if (phase === GAME_PHASES.FINISH) {
            const timer = setTimeout(() => {
                setPhase(GAME_PHASES.POST_GAME_LEAD);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [phase, setPhase]);

    const handleLeadSuccess = useCallback((name, phone) => {
        setUserName(name);
        setUserPhone(phone);
        setPhase(GAME_PHASES.SCORE_REVEAL);
    }, [setUserName, setUserPhone, setPhase]);

    const renderPhase = () => {
        switch (phase) {
            case GAME_PHASES.INTRO:
                return <IntroScreen key="intro" onStart={startGame} />;

            case GAME_PHASES.STAGE_SELECTION:
                return <StageSelection key="stage-select" onSelectStage={selectStage} />;

            case GAME_PHASES.RACING:
            case GAME_PHASES.EVENT_FEEDBACK:
                return (
                    <div className="w-full h-full relative">
                        <QuestionScreen
                            key="question-screen"
                            stageData={selectedStageData}
                            questionNumber={currentEventIndex + 1}
                            totalQuestions={eventQueue.length}
                            currentEvent={currentEvent}
                            timeLeft={timeLeft}
                            timerProgress={timerProgress}
                            onDecision={makeDecision}
                        />

                        <AnimatePresence>
                            {phase === GAME_PHASES.EVENT_FEEDBACK && (
                                <FeedbackOverlay
                                    key="feedback-popup"
                                    feedback={lastFeedback}
                                    onContinue={advanceToNextEvent}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                );

            case GAME_PHASES.FINISH:
                return (
                    <div className="w-full h-full flex items-center justify-center bg-race-dark" key="finish">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white/10 backdrop-blur-md p-12 rounded-[3.5rem] border-2 border-white/20 text-center shadow-2xl"
                        >
                            <h2 className="text-white text-6xl font-black italic uppercase tracking-tighter mb-4 drop-shadow-lg">FINISH!</h2>
                            <p className="text-blue-200 font-bold tracking-[0.3em] uppercase text-sm">Calculating your life readiness...</p>
                        </motion.div>
                    </div>
                );

            case GAME_PHASES.POST_GAME_LEAD:
                return (
                    <PostGameLeadCapture
                        key="post-game-lead"
                        onSuccess={handleLeadSuccess}
                    />
                );

            case GAME_PHASES.SCORE_REVEAL:
            case GAME_PHASES.TIMELINE:
            case GAME_PHASES.CONVERSION:
            case GAME_PHASES.LEAD_FORM:
                return (
                    <ResultScreen
                        key="result-screen"
                        score={score}
                        finalScore={finalScore}
                        userName={userName}
                        userPhone={userPhone}
                        timeline={timeline}
                        category={protectionCategory}
                        onRestart={restartGame}
                        gameId={gameId}
                        riskGaps={riskGaps}
                        onBookSlot={() => showThankYou(userName)}
                    />
                );

            case GAME_PHASES.THANK_YOU:
                return <ThankYou key="thank-you" onRestart={restartGame} userName={userName} />;

            default:
                return null;
        }
    };

    return (
        <RaceLayout fullScreen={phase === GAME_PHASES.INTRO}>
            <AnimatePresence mode="wait">
                {renderPhase()}
            </AnimatePresence>
        </RaceLayout>
    );
});

// Polyfill ThankYou component if missing or just use simple placeholder
const ThankYou = ({ onRestart, userName }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#003366] text-white p-8 text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg border-4 border-white/20">✓</div>
        <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">THANK YOU!</h2>
        <p className="text-blue-100 font-medium mb-8 max-w-xs">{userName}, our Relationship Manager will connect with you shortly to secure your milestones.</p>
        <button
            onClick={onRestart}
            className="px-12 py-4 bg-[#FF8C00] text-white font-black rounded-xl shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-sm border-2 border-white/20"
        >
            Play Again
        </button>
    </div>
);

LifeMilestoneRacePage.displayName = 'LifeMilestoneRacePage';

export default LifeMilestoneRacePage;
