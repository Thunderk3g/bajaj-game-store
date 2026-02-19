import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useEffect } from 'react';

const FeedbackScreen = ({ isCorrect, explanation, onNext }) => {
    useEffect(() => {
        const duration = 10000;
        const timer = setTimeout(() => {
            onNext();
        }, duration);
        return () => clearTimeout(timer);
    }, [onNext, isCorrect]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#B9E6FE]/80 backdrop-blur-sm">
            <motion.div
                className="w-full max-w-[340px] sm:max-w-sm max-h-[90vh] flex flex-col"
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="bg-white rounded-[32px] p-5 sm:p-8 shadow-2xl border-2 border-soft-gray relative overflow-hidden flex flex-col h-full">
                    {/* Top Accent Bar */}
                    <div className={`absolute top-0 left-0 w-full h-2 ${isCorrect ? 'bg-brand-blue' : 'bg-red-500'}`} />

                    <div className="text-center flex flex-col h-full min-h-0">
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200 }}
                            className="mb-4 sm:mb-6 flex justify-center shrink-0"
                        >
                            <div className={`p-5 rounded-3xl ${isCorrect ? 'bg-blue-50 text-brand-blue' : 'bg-red-50 text-red-500'}`}>
                                {isCorrect ? (
                                    <CheckCircle2 className="w-16 h-16" strokeWidth={2.5} />
                                ) : (
                                    <XCircle className="w-16 h-16" strokeWidth={2.5} />
                                )}
                            </div>
                        </motion.div>

                        {/* Title */}
                        <h3 className={`text-3xl sm:text-4xl font-black mb-3 sm:mb-4 tracking-tight shrink-0 ${isCorrect ? 'text-brand-blue' : 'text-red-500'}`}>
                            {isCorrect ? 'Correct!' : "Incorrect!"}
                        </h3>

                        {/* Explanation Area */}
                        <div className={`p-4 sm:p-6 rounded-2xl mb-4 sm:mb-6 border-2 text-left flex-1 overflow-y-auto min-h-0 custom-scrollbar ${isCorrect ? 'bg-blue-50/50 border-blue-100/50' : 'bg-red-50 border-red-100'}`}>
                            <p className="text-gray-700 font-bold text-base sm:text-lg leading-snug">
                                {explanation}
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onNext}
                            className={`w-full font-black py-3 sm:py-4 px-6 rounded-2xl transition-all active:scale-[0.98] text-lg sm:text-xl mb-4 sm:mb-6 shrink-0 ${isCorrect
                                ? 'bg-brand-blue text-white'
                                : 'bg-red-500 text-white'
                                }`}
                        >
                            Next
                        </button>

                        {/* Progress Capsule */}
                        <div className="w-full bg-gray-100 h-2 sm:h-3 rounded-full overflow-hidden shrink-0">
                            <motion.div
                                className={`h-full ${isCorrect ? 'bg-brand-blue' : 'bg-red-500'}`}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 10, ease: "linear" }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FeedbackScreen;
