import { memo, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GAME_PHASES, LIFE_STAGES, EVENTS_PER_STAGE } from './constants/lifeStages';
import { useRaceEngine } from './hooks/useRaceEngine';
import { useTimer } from './hooks/useTimer';
import RaceLayout from '../../components/layout/RaceLayout';
import IntroScreen from './components/IntroScreen';
import StageSelection from './components/StageSelection';
import EventCard from './components/EventCard';
import ProtectionMeter from './components/ProtectionMeter';
import DecisionButtons from './components/DecisionButtons';
import SpeedometerScore from './components/SpeedometerScore';
import TimelineSummary from './components/TimelineSummary';
import ConversionScreen from './components/ConversionScreen';
import LeadForm from './components/LeadForm';
import ThankYou from './components/ThankYou';

const EVENT_TIMER_SECONDS = 10;

/**
 * Feedback overlay shown between events — Bajaj branded.
 */
const FeedbackOverlay = memo(function FeedbackOverlay({ feedback, onContinue }) {
    if (!feedback) return null;

    const isProtected = feedback.decision === 'protected';

    return (
        <motion.div
            className="w-full flex flex-col items-center gap-5 animate-fade-in"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-[2.5rem]"
                style={{
                    background: isProtected
                        ? 'linear-gradient(135deg, rgba(255,140,0,0.2) 0%, rgba(255,102,0,0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(0,102,178,0.2) 0%, rgba(59,130,246,0.1) 100%)',
                    boxShadow: isProtected
                        ? '0 0 24px rgba(255, 140, 0, 0.3)'
                        : '0 0 24px rgba(0, 102, 178, 0.3)',
                }}
            >
                {isProtected ? '🛡️' : '⚠️'}
            </div>

            <div className="text-center space-y-2">
                <p className="text-[1.25rem] font-black text-blue-950">
                    {isProtected ? 'You\'re Protected!' : 'You\'re Exposed!'}
                </p>
                <p className="text-blue-900/70 text-[0.9375rem]">
                    {feedback.title}
                </p>
                <p
                    className="text-[1.5rem] font-black"
                    style={{
                        color: isProtected ? '#FF8C00' : '#3B82F6',
                    }}
                >
                    {feedback.delta > 0 ? '+' : ''}
                    {feedback.delta} points
                </p>
            </div>

            <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.97 }}
                className="font-black text-white text-[1rem] uppercase tracking-wider px-8 py-3 rounded-xl mt-2"
                style={{
                    background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                    boxShadow: '0 4px 0 #004A80, 0 0 16px rgba(0, 102, 178, 0.3)',
                }}
                id="btn-continue-race"
            >
                Continue →
            </motion.button>
        </motion.div>
    );
});

/**
 * Stage header with emoji, stage name, and "Financial Risk Ahead".
 */
const StageHeader = memo(function StageHeader({ stageData, questionNumber }) {
    if (!stageData) return null;

    return (
        <div className="w-full text-center space-y-1">
            <div className="text-[2rem] leading-none">{stageData.emoji}</div>
            <h2 className="text-[1rem] font-black text-blue-950 uppercase tracking-wider">
                {stageData.label}
            </h2>
            <p className="text-[0.8125rem] font-semibold text-blue-900/60">
                Financial Risk Ahead
            </p>
            <p className="text-[0.875rem] font-black text-blue-950/80">
                Question {questionNumber}/{EVENTS_PER_STAGE}
            </p>
        </div>
    );
});

/**
 * Compact progress bar — shows question progress (X/5).
 */
const RaceProgress = memo(function RaceProgress({ current, total, progress }) {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[0.875rem] font-bold text-blue-950">
                    Question {current}/{total}
                </span>
                <span className="text-[0.875rem] font-bold text-blue-950">
                    {progress}%
                </span>
            </div>
            <div
                className="w-full rounded-full overflow-hidden"
                style={{
                    height: '14px',
                    backgroundColor: 'rgba(0, 102, 178, 0.15)',
                    border: '1px solid rgba(0, 102, 178, 0.2)',
                }}
            >
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #FF8C00 0%, #FF6600 100%)',
                        boxShadow: '0 0 12px rgba(255, 140, 0, 0.4)',
                    }}
                />
            </div>
        </div>
    );
});

/**
 * Main page for the Life Milestone Race feature.
 * Orchestrates the game flow by rendering phase-appropriate components.
 * Business logic lives in useRaceEngine; this component is purely presentational.
 */
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
        progressPercent,
        userName,
        selectedStageData,
        startGame,
        selectStage,
        makeDecision,
        handleTimerExpire,
        advanceToNextEvent,
        showScoreReveal,
        showTimeline,
        showConversion,
        showLeadForm,
        showThankYou,
        restartGame,
    } = engine;

    const { timeLeft, progress: timerProgress } = useTimer(
        EVENT_TIMER_SECONDS,
        handleTimerExpire,
        isTimerActive,
    );

    const handleLeadSuccess = useCallback((formData) => {
        showThankYou(formData?.name);
    }, [showThankYou]);

    const renderPhase = () => {
        switch (phase) {
            case GAME_PHASES.INTRO:
                return <IntroScreen key="intro" onStart={startGame} />;

            case GAME_PHASES.STAGE_SELECTION:
                return <StageSelection key="stage-select" onSelectStage={selectStage} />;

            case GAME_PHASES.RACING:
                return (
                    <div key="racing" className="w-full flex flex-col gap-5 animate-fade-in" style={{ padding: '0.25rem 0' }}>
                        {/* Stage header with emoji + stage name + question counter */}
                        <StageHeader
                            stageData={selectedStageData}
                            questionNumber={currentEventIndex + 1}
                        />

                        {/* Compact progress bar */}
                        <RaceProgress
                            current={currentEventIndex + 1}
                            total={eventQueue.length}
                            progress={progressPercent}
                        />

                        {/* Protection Level meter */}
                        <ProtectionMeter score={score} />

                        {/* Hero event card */}
                        <EventCard event={currentEvent} />

                        {/* Decision buttons + timer */}
                        <DecisionButtons
                            onDecision={makeDecision}
                            timeLeft={timeLeft}
                            timerProgress={timerProgress}
                        />
                    </div>
                );

            case GAME_PHASES.EVENT_FEEDBACK:
                return (
                    <FeedbackOverlay
                        key="feedback"
                        feedback={lastFeedback}
                        onContinue={advanceToNextEvent}
                    />
                );

            case GAME_PHASES.FINISH:
                return (
                    <motion.div
                        key="finish"
                        className="w-full flex flex-col items-center gap-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center space-y-3">
                            <div className="text-[3.5rem]">🏁</div>
                            <h2 className="text-[1.75rem] font-black text-blue-950">
                                Finish Line!
                            </h2>
                            <p className="text-blue-900/70 text-[1rem]">
                                You&apos;ve completed the Life Milestone Race
                            </p>
                        </div>
                        <motion.button
                            onClick={showScoreReveal}
                            whileTap={{ scale: 0.97 }}
                            className="font-black text-white text-[1.125rem] uppercase tracking-wider px-8 py-4 rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, #FF8C00 0%, #FF6600 100%)',
                                boxShadow: '0 4px 0 #CC5500, 0 0 20px rgba(255, 140, 0, 0.35)',
                            }}
                            id="btn-reveal-score"
                        >
                            Reveal My Score 🏆
                        </motion.button>
                    </motion.div>
                );

            case GAME_PHASES.SCORE_REVEAL:
                return (
                    <SpeedometerScore
                        key="score"
                        score={finalScore}
                        category={protectionCategory}
                        onViewTimeline={showTimeline}
                    />
                );

            case GAME_PHASES.TIMELINE:
                return (
                    <TimelineSummary
                        key="timeline"
                        timeline={timeline}
                        onContinue={showConversion}
                    />
                );

            case GAME_PHASES.CONVERSION:
                return (
                    <ConversionScreen
                        key="conversion"
                        score={finalScore}
                        category={protectionCategory}
                        onBookSlot={showLeadForm}
                    />
                );

            case GAME_PHASES.LEAD_FORM:
                return (
                    <LeadForm
                        key="lead-form"
                        gameId={gameId}
                        score={finalScore}
                        category={protectionCategory}
                        riskGaps={riskGaps}
                        onSuccess={handleLeadSuccess}
                    />
                );

            case GAME_PHASES.THANK_YOU:
                return (
                    <ThankYou
                        key="thank-you"
                        name={userName}
                    />
                );

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

LifeMilestoneRacePage.displayName = 'LifeMilestoneRacePage';

export default LifeMilestoneRacePage;
