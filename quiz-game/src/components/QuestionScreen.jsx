import { motion } from 'framer-motion';
import QuizProgressBar from './QuizProgressBar';
// Updated UI with enhanced option boxes and GST welcome image

const QuestionScreen = ({ question, currentQuestion, totalQuestions, onAnswerSelect, selectedAnswer }) => {

    return (
        <motion.div
            className="w-full h-full flex flex-col py-0 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            {/* Top Navigation / Progress */}
            <div className="mb-6">
                <QuizProgressBar currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
            </div>

            <div className="flex-1 flex flex-col justify-start space-y-8 px-2 max-w-md mx-auto w-full">
                {/* Question Section */}
                <div className="game-board">
                    <h2 className="text-2xl font-black text-gray-700 leading-snug">
                        {question.question}
                    </h2>
                </div>

                {/* Answer Options Section */}
                <div className="flex flex-col gap-4">
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
                                flex items-center justify-center w-10 h-10 rounded-xl font-black border-2 text-lg transition-colors flex-shrink-0
                                ${selectedAnswer === index
                                    ? 'bg-brand-blue text-white border-brand-blue'
                                    : 'bg-white text-[#E5E5E5] border-[#E5E5E5] group-hover:border-brand-blue'}
                            `}>
                                {index + 1}
                            </span>
                            <span className={`flex-1 text-left font-bold text-lg leading-tight ${selectedAnswer === index ? 'text-brand-blue' : 'text-gray-600'}`}>
                                {option}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Bottom Section Spacer */}
            <div className="py-8"></div>
        </motion.div>
    );
};

export default QuestionScreen;

