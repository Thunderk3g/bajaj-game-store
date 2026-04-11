import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizProgressBar from './QuizProgressBar';
import gstBackground from '../assets/gst_background.png';

const QuestionScreen = ({ question, currentQuestion, totalQuestions, onAnswerSelect, selectedAnswer }) => {
    const [canClick, setCanClick] = useState(false);

    useEffect(() => {
        setCanClick(false);
        const timer = setTimeout(() => {
            setCanClick(true);
        }, 1000); // Wait for stagger animations to complete
        return () => clearTimeout(timer);
    }, [question]);

    if (!question) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: { opacity: 0, scale: 0.95 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative w-full h-[100dvh] flex flex-col pt-4 pb-8 px-4 overflow-hidden bg-[#005EB8]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={gstBackground}
                    alt=""
                    className="w-full h-full object-cover opacity-30 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#005EB8]/80 via-transparent to-[#005EB8]/90" />
            </div>

            {/* Content Container */}
            <motion.div
                className="relative z-10 w-full flex-1 flex flex-col max-w-lg mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Top Navigation / Progress */}
                <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
                    <QuizProgressBar
                        currentQuestion={currentQuestion}
                        totalQuestions={totalQuestions}
                        selectedAnswer={selectedAnswer}
                    />
                </motion.div>

                <div className="flex-1 flex flex-col justify-center space-y-6 sm:space-y-8 min-h-0">
                    {/* Question Card (Glassmorphism) */}
                    <motion.div
                        variants={itemVariants}
                        className="glass-card bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative"
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#005EB8] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-md">
                            Question {currentQuestion}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight text-center mt-2 drop-shadow-md">
                            {question.question}
                        </h2>
                    </motion.div>

                    {/* Answer Options Section */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <AnimatePresence mode="popLayout">
                            {question.options.map((option, index) => (
                                <motion.button
                                    key={`${currentQuestion}-${index}`}
                                    variants={itemVariants}
                                    whileHover={canClick && selectedAnswer === null ? { scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" } : {}}
                                    whileTap={canClick && selectedAnswer === null ? { scale: 0.98 } : {}}
                                    onClick={() => canClick && onAnswerSelect(index)}
                                    disabled={selectedAnswer !== null || !canClick}
                                    className={`
                                        group relative flex items-center gap-4 p-4 sm:p-5 rounded-[24px] transition-all duration-300
                                        ${selectedAnswer === index
                                            ? 'bg-brand-blue/95 border-brand-blue shadow-[0_0_25px_rgba(28,176,246,0.5)] ring-2 ring-white/40'
                                            : 'bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/40 shadow-sm'}
                                        ${!canClick ? 'cursor-default' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className={`
                                        flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl font-black text-lg transition-all duration-300
                                        ${selectedAnswer === index
                                            ? 'bg-white text-brand-blue scale-110 shadow-lg'
                                            : 'bg-white/30 text-white group-hover:bg-white/40'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <span className={`
                                        flex-1 text-left font-bold text-base sm:text-lg leading-snug transition-colors
                                        ${selectedAnswer === index ? 'text-white' : 'text-white/90 group-hover:text-white'}
                                    `}>
                                        {option}
                                    </span>

                                    {selectedAnswer === index && (
                                        <motion.div
                                            layoutId="check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                                        >
                                            <div className="w-3 h-2 border-b-2 border-r-2 border-brand-blue rotate-45 -mt-1 ml-0.5" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .glass-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.15));
                }
            `}</style>
        </div>
    );
};

export default QuestionScreen;

