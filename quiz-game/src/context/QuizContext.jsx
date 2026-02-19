import { createContext, useContext, useState, useCallback } from 'react';
import { getShuffledQuestions } from '../data/questions';
import { useSound } from '../hooks/useSound';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { submitToLMS } from '../utils/api';

// Screen constants
export const SCREENS = {
    WELCOME: 'welcome',
    QUESTION: 'question',
    FEEDBACK: 'feedback',
    RESULTS: 'results',
    THANK_YOU: 'thank_you'
};

// Create context
const QuizContext = createContext(null);

// Provider component
export const QuizProvider = ({ children }) => {
    // Core state
    const [currentScreen, setCurrentScreen] = useState(SCREENS.WELCOME);
    const [questions, setQuestions] = useState(() => getShuffledQuestions());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);

    // Lead Management
    const [leadName, setLeadName] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);

    // Hooks
    const { playSound } = useSound();
    const [highScore, setHighScore] = useLocalStorage('quizHighScore', 0);

    // Derived values
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Actions
    const startQuiz = useCallback(() => {
        const shuffled = getShuffledQuestions();
        setQuestions(shuffled);
        setCurrentScreen(SCREENS.QUESTION);
        setCurrentQuestionIndex(0);
        setScore(0);
        setUserAnswers([]);
        setSelectedAnswer(null);
        playSound('start');
    }, [playSound]);

    const handleAnswerSelect = useCallback((answerIndex) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answerIndex);
        const selectedOptionText = currentQuestion.options[answerIndex];
        const isCorrect = selectedOptionText === currentQuestion.correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            playSound('correct');
        } else {
            playSound('incorrect');
        }

        setUserAnswers(prev => [
            ...prev,
            {
                questionId: currentQuestion.id,
                selectedAnswer: selectedOptionText,
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect
            }
        ]);

        setShowFeedback(true);
        setCurrentScreen(SCREENS.FEEDBACK);
    }, [selectedAnswer, currentQuestion, playSound]);

    const handleNextQuestion = useCallback(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentScreen(SCREENS.QUESTION);
        } else {
            const finalScore = userAnswers.filter(a => a.isCorrect).length +
                (currentQuestion.options[selectedAnswer] === currentQuestion.correctAnswer ? 1 : 0);
            if (finalScore > highScore) {
                setHighScore(finalScore);
            }
            setCurrentScreen(SCREENS.RESULTS);
            playSound('complete');
        }
    }, [currentQuestionIndex, totalQuestions, userAnswers, currentQuestion, selectedAnswer, highScore, setHighScore, playSound]);

    const handleRestart = useCallback(() => {
        setCurrentScreen(SCREENS.WELCOME);
        setCurrentQuestionIndex(0);
        setScore(0);
        setUserAnswers([]);
        setSelectedAnswer(null);
        setShowFeedback(false);
        // Reset lead state for a fresh start
        setIsLeadSubmitted(false);
        setLeadName('');
        setLeadPhone('');
        setIsTermsAccepted(false);
    }, []);

    const retakeQuiz = useCallback(() => {
        setCurrentScreen(SCREENS.WELCOME);
        setCurrentQuestionIndex(0);
        setScore(0);
        setUserAnswers([]);
        setSelectedAnswer(null);
        setShowFeedback(false);
        // Reset lead state for a fresh start
        setIsLeadSubmitted(false);
        setLeadName('');
        setLeadPhone('');
        setIsTermsAccepted(false);
    }, []);

    const onLeadSubmit = useCallback(async (name, phone) => {
        // Automatic Preferred Callback Logic
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const preferredDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
        const preferredTime = '09:00 AM';

        // Fresh submission
        console.log('Attempting lead submission to Bajaj LMS...');
        const result = await submitToLMS({
            name,
            mobile_no: phone,
            goal_name: 'Quiz Game',
            param4: new Date().toISOString(),
            param19: preferredDate,
            param23: preferredTime,
            summary_dtls: 'Lead Submission'
        });

        if (result.success) {
            setLeadName(name);
            setLeadPhone(phone);
            setIsLeadSubmitted(true);
        }

        return result;
    }, [setLeadName, setLeadPhone]);

    const handleBookingSubmit = useCallback(async (bookingData) => {
        // bookingData includes potentially edited name and phone
        const result = await submitToLMS({
            name: bookingData.name,
            mobile_no: bookingData.mobile_no,
            goal_name: 'Quiz Booking',
            param4: bookingData.booking_timestamp || new Date().toISOString(),
            param19: bookingData.date,
            param23: bookingData.timeSlot,
            summary_dtls: 'Booking Request'
        });

        if (result.success) {
            // Update local storage if they edited their details during booking
            if (bookingData.name) setLeadName(bookingData.name);
            if (bookingData.mobile_no) setLeadPhone(bookingData.mobile_no);

            setCurrentScreen(SCREENS.THANK_YOU);
        }

        return result;
    }, [setLeadName, setLeadPhone]);

    // Context value
    const value = {
        // State
        currentScreen,
        questions,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        selectedAnswer,
        userAnswers,
        score,
        showFeedback,
        leadName,
        leadPhone,
        isLeadSubmitted,
        isTermsAccepted,
        highScore,
        setIsTermsAccepted,

        // Actions
        startQuiz,
        handleAnswerSelect,
        handleNextQuestion,
        handleRestart,
        retakeQuiz,
        onLeadSubmit,
        handleBookingSubmit,
        setCurrentScreen,
    };

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    );
};

// Custom hook to use quiz context
export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};

export default QuizContext;
