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
                className="w-full max-w-sm"
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="bg-white rounded-[32px] p-8 shadow-2xl border-2 border-soft-gray relative overflow-hidden">
                    {/* Top Accent Bar */}
                    <div className={`absolute top-0 left-0 w-full h-2 ${isCorrect ? 'bg-brand-blue' : 'bg-red-500'}`} />

                    <div className="text-center">
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200 }}
                            className="mb-6 inline-block"
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
                        <h3 className={`text-4xl font-black mb-4 tracking-tight ${isCorrect ? 'text-brand-blue' : 'text-red-500'}`}>
                            {isCorrect ? 'Correct!' : "Incorrect!"}
                        </h3>

                        {/* Explanation Area */}
                        <div className={`p-6 rounded-2xl mb-8 border-2 text-left ${isCorrect ? 'bg-blue-50/50 border-blue-100/50' : 'bg-red-50 border-red-100'}`}>
                            <p className="text-gray-700 font-bold text-lg leading-snug">
                                {explanation}
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onNext}
                            className={`w-full font-black py-4 px-6 rounded-2xl border-b-4 transition-all active:border-b-0 active:translate-y-1 text-xl mb-6 ${isCorrect
                                ? 'bg-brand-blue text-white border-blue-600'
                                : 'bg-red-500 text-white border-red-700'
                                }`}
                        >
                            Next
                        </button>

                        {/* Progress Capsule */}
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
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
