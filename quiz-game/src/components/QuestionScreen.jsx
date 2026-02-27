import { motion } from 'framer-motion';
import QuizProgressBar from './QuizProgressBar';
// Updated UI with enhanced option boxes and GST welcome image

const QuestionScreen = ({ question, currentQuestion, totalQuestions, onAnswerSelect, selectedAnswer }) => {

    return (
        <motion.div
            className="w-full h-[100dvh] flex flex-col pt-4 pb-4 px-4 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            {/* Top Navigation / Progress */}
            <div className="mb-4 sm:mb-6">
                <QuizProgressBar currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 px-2 max-w-md mx-auto w-full min-h-0">
                {/* Question Section */}
                <div className="bg-[#e0f2fe] rounded-[24px] p-5 sm:p-6 border-2 border-[#7dd3fc] shadow-sm relative">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-700 leading-snug text-center">
                        {question.question}
                    </h2>
                </div>

                {/* Answer Options Section */}
                <div className="flex flex-col gap-3 sm:gap-4 overflow-y-auto scrollbar-hide overflow-x-hidden">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAnswerSelect(index)}
                            disabled={selectedAnswer !== null}
                            className={`game-option ${selectedAnswer === index ? 'selected' : ''}`}
                        >
                            <span className={`
                                flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-black border-2 text-base sm:text-lg transition-colors flex-shrink-0
                                ${selectedAnswer === index
                                    ? 'bg-brand-blue text-white border-brand-blue'
                                    : 'bg-white text-[#E5E5E5] border-[#E5E5E5] group-hover:border-brand-blue'}
                            `}>
                                {index + 1}
                            </span>
                            <span className={`flex-1 text-left font-bold text-base sm:text-lg leading-tight ${selectedAnswer === index ? 'text-brand-blue' : 'text-gray-600'}`}>
                                {option}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default QuestionScreen;

