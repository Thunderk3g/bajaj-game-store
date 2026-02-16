import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameState, SCREENS } from './hooks/useGameState';
import SuccessToast from './components/SuccessToast';
import './index.css';

// Lazy load screens for performance optimization
const WelcomeScreen = lazy(() => import('./components/WelcomeScreen'));
const GoalSelectionScreen = lazy(() => import('./components/GoalSelectionScreen'));
const CountdownScreen = lazy(() => import('./components/CountdownScreen'));
const GoalAssessmentScreen = lazy(() => import('./components/GoalAssessmentScreen'));
const ScoreResultsScreen = lazy(() => import('./components/ScoreResultsScreen'));
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
        handleRestart
    } = useGameState();

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
            case SCREENS.COUNTDOWN:
                return <CountdownScreen key="countdown" userName={leadName} onComplete={handleCountdownComplete} />;
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

    return (
        <div className="h-[100dvh] w-full bg-slate-900 overflow-hidden">
            {/* Main Content */}
            <main className="quiz-container">
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
