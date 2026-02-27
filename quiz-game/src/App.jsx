import { AnimatePresence } from 'framer-motion';
import { QuizProvider, useQuiz, SCREENS } from './context/QuizContext';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionScreen from './components/QuestionScreen';
import FeedbackScreen from './components/FeedbackScreen';
import ResultsScreen from './components/ResultsScreen';

import ThankYouScreen from './components/ThankYouScreen';
import './index.css';

// Main Quiz Component (uses context)
const QuizGame = () => {
    const {
        currentScreen,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        selectedAnswer,
        showFeedback,
        score,
        startQuiz,
        handleAnswerSelect,
        handleNextQuestion,
        handleRestart,
    } = useQuiz();

    return (
        <div className="w-screen h-screen flex flex-col font-sans transition-colors duration-300 overflow-hidden">
            {/* Main Content */}
            <main className="w-full h-full flex flex-col items-center overflow-hidden">
                <div className="w-full h-full max-w-[600px] flex flex-col items-center relative overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {currentScreen === SCREENS.WELCOME && (
                            <WelcomeScreen key="welcome" onStart={startQuiz} />
                        )}

                        {currentScreen === SCREENS.QUESTION && (
                            <QuestionScreen
                                key={`question-${currentQuestionIndex}`}
                                question={currentQuestion}
                                currentQuestion={currentQuestionIndex + 1}
                                totalQuestions={totalQuestions}
                                onAnswerSelect={handleAnswerSelect}
                                selectedAnswer={selectedAnswer}
                            />
                        )}

                        {currentScreen === SCREENS.FEEDBACK && showFeedback && (
                            <div key="feedback-container">
                                <QuestionScreen
                                    question={currentQuestion}
                                    currentQuestion={currentQuestionIndex + 1}
                                    totalQuestions={totalQuestions}
                                    onAnswerSelect={() => { }}
                                    selectedAnswer={selectedAnswer}
                                />
                                <FeedbackScreen
                                    isCorrect={currentQuestion.options[selectedAnswer] === currentQuestion.correctAnswer}
                                    explanation={currentQuestion.explanation}
                                    onNext={handleNextQuestion}
                                />
                            </div>
                        )}

                        {currentScreen === SCREENS.RESULTS && (
                            <ResultsScreen
                                key="results"
                                score={score}
                                total={totalQuestions}
                                onRestart={handleRestart}
                            />
                        )}

                        {currentScreen === SCREENS.THANK_YOU && (
                            <ThankYouScreen key="thankyou" />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// App wrapper with provider
function App() {
    return (
        <QuizProvider>
            <QuizGame />
        </QuizProvider>
    );
}

export default App;
