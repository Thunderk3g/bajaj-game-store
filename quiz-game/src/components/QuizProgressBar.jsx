import { motion } from 'framer-motion';

const QuizProgressBar = ({ currentQuestion, totalQuestions }) => {
    const percentage = (currentQuestion / totalQuestions) * 100;

    return (
        <div className="w-full px-2 pt-6 pb-2">
            <div className="flex items-center gap-4">
                {/* Progress Bar Container */}
                <div className="flex-1 h-4 bg-[#E5E5E5] rounded-full overflow-hidden relative">
                    {/* Progress Fill */}
                    <motion.div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ backgroundColor: '#58CC02' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
                    />
                    {/* Shadow highlight for Duolingo feel */}
                    <motion.div
                        className="absolute left-0 top-1 h-1.5 opacity-30 rounded-full"
                        style={{
                            backgroundColor: '#FFFFFF',
                            width: `${percentage}%`
                        }}
                    />
                </div>

                {/* Progress Badge */}
                <div className="flex items-center justify-center bg-white border-2 border-[#E5E5E5] rounded-xl px-3 py-1 text-gray-500 font-black text-sm whitespace-nowrap">
                    {currentQuestion}/{totalQuestions}
                </div>
            </div>
        </div>
    );
};

export default QuizProgressBar;
