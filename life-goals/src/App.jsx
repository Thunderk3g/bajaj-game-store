import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameState, SCREENS } from './hooks/useGameState';
import SuccessToast from './components/SuccessToast';
import './index.css';

// Lazy load screens for performance optimization
const WelcomeScreen = lazy(() => import('./components/WelcomeScreen'));
const GoalSelectionScreen = lazy(() => import('./components/GoalSelectionScreen'));
const GoalAssessmentScreen = lazy(() => import('./components/GoalAssessmentScreen'));
const ScoreResultsScreen = lazy(() => import('./components/ScoreResultsScreen'));
const LeadCaptureScreen = lazy(() => import('./components/LeadCaptureScreen'));
const ThankYouScreen = lazy(() => import('./components/ThankYouScreen'));

function App() {
    const {
        currentScreen,
        selectedGoals,
        currentGoalIndex,
        currentQuestionIndex,
        score,
        leadName,
        leadPhone,
        lives,
        showSuccessToast,
        successMessage,
        isSubmitting,
        lastSubmittedPhone,
        setShowSuccessToast,
        setSuccessMessage,
        startGame,
        handleGoalsSelected,
        handleCountdownComplete,
        handleLeadSubmit,

        advanceGame,
        handleBookSlot,
        handleRestart,
        completeLeadCapture
    } = useGameState();


    const [useFixedMobile, setUseFixedMobile] = useState(false);
    const [scale, setScale] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const calculateScale = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const mobileMode = width < 1024;
            setIsMobile(mobileMode);

            if (mobileMode) {
                const aspectRatio = width / height;
                // If screen is narrow/tall (like 390x844), use fixed scaling.
                // If screen is shorter/wider (like 375x667), use fluid full-screen.
                const needsFixed = aspectRatio < 0.5;
                setUseFixedMobile(needsFixed);

                if (needsFixed) {
                    const baseWidth = 390;
                    const baseHeight = 844;
                    const newScale = Math.min(
                        width / baseWidth,
                        height / baseHeight
                    );
                    setScale(newScale);
                }
            } else {
                setScale(1);
                setUseFixedMobile(false);
            }
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    useEffect(() => {
        const today = new Date().toLocaleDateString();
        console.log('Today:', today);
    }, []);

    const renderScreen = () => {
        switch (currentScreen) {
            case SCREENS.WELCOME:
                return (
                    <WelcomeScreen
                        key="welcome"
                        onStart={startGame}
                        onSubmitLead={handleLeadSubmit}
                        isSubmitting={isSubmitting}
                        lastSubmittedPhone={lastSubmittedPhone}
                        setSuccessMessage={setSuccessMessage}
                        setShowSuccessToast={setShowSuccessToast}
                    />
                );
            case SCREENS.GOAL_SELECTION:
                return <GoalSelectionScreen key="goal-selection" onProceed={handleGoalsSelected} />;
            case SCREENS.ASSESSMENT:
                return selectedGoals.length > 0 && (
                    <GoalAssessmentScreen
                        key={`assessment-${currentGoalIndex}-${currentQuestionIndex}`}
                        currentGoal={selectedGoals[currentGoalIndex]}
                        currentGoalIndex={currentGoalIndex}
                        currentQuestionIndex={currentQuestionIndex}
                        score={score}
                        lives={lives}
                        onAnswer={(ans) => advanceGame(ans, selectedGoals[currentGoalIndex], selectedGoals.length)}
                    />
                );
            case SCREENS.LEAD_CAPTURE:
                return (
                    <LeadCaptureScreen
                        key="lead-capture"
                        score={score}
                        isSubmitting={isSubmitting}
                        onSubmit={async (data) => {
                            const result = await handleLeadSubmit(data);
                            if (result.success) {
                                completeLeadCapture();
                            }
                            return result;
                        }}
                    />
                );
            case SCREENS.SCORE_RESULTS:
                return (
                    <ScoreResultsScreen
                        key="score-results"
                        score={score}
                        userName={leadName}
                        userPhone={leadPhone}
                        onBookSlot={handleBookSlot}
                        onRestart={handleRestart}
                    />
                );
            case SCREENS.THANK_YOU:
                return (
                    <ThankYouScreen
                        key="thank-you"
                        userName={leadName || "Adventurer"}
                        onRestart={handleRestart}
                    />
                );
            default:
                return null;
        }
    };

    if (isMobile && useFixedMobile) {
        return (
            <div
                className="fixed inset-0 flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #142B57 0%, #2E5590 100%)' }}
            >
                <div
                    className="relative overflow-hidden shrink-0"
                    style={{
                        width: '390px',
                        height: '844px',
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                    }}
                >
                    <main className="w-full h-full relative">
                        <AnimatePresence mode="wait">
                            <Suspense fallback={null}>
                                {renderScreen()}
                            </Suspense>
                        </AnimatePresence>
                    </main>

                    {showSuccessToast && (
                        <SuccessToast
                            message={successMessage}
                            onClose={() => setShowSuccessToast(false)}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`h-[100dvh] w-full bg-slate-900 flex items-center justify-center overflow-hidden relative ${isMobile && !useFixedMobile ? 'fluid-mobile' : ''}`}>
            {/* Main Content Wrapper */}
            <main className="quiz-container max-w-full">
                <AnimatePresence mode="wait">
                    <Suspense fallback={null}>
                        {renderScreen()}
                    </Suspense>
                </AnimatePresence>
            </main>

            {/* Success Toast Notification */}
            {showSuccessToast && (
                <SuccessToast
                    message={successMessage}
                    onClose={() => setShowSuccessToast(false)}
                />
            )}
        </div>
    );
}

export default App;
