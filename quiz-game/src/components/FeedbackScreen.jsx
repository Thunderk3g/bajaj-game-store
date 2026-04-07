import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import gstBackground from '../assets/gst_background.png';

const FeedbackScreen = ({ isCorrect, explanation, onNext }) => {
    const [canAdvance, setCanAdvance] = useState(false);

    useEffect(() => {
        // Auto advance timer (10s)
        const autoTimer = setTimeout(() => {
            onNext();
        }, 10000);

        // Navigation guard timer (2s)
        const guardTimer = setTimeout(() => {
            setCanAdvance(true);
        }, 2000);

        return () => {
            clearTimeout(autoTimer);
            clearTimeout(guardTimer);
        };
    }, [onNext]);

    const handleNextClick = () => {
        if (canAdvance) {
            onNext();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: "easeOut" }
        },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-[#005EB8]" onClick={(e) => e.stopPropagation()}>
            {/* Background Image with Overlay (matching QuestionScreen) */}
            <div className="absolute inset-0 z-0">
                <img
                    src={gstBackground}
                    alt=""
                    className="w-full h-full object-cover opacity-30 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#005EB8]/85 via-transparent to-[#005EB8]/90" />
            </div>

            <motion.div
                className="relative z-10 w-full max-w-[360px] sm:max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Feedback Card (Glassmorphism) */}
                <div className="glass-card bg-white/45 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 pt-10 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/40 overflow-hidden text-center relative">

                    {/* Status Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                        className="mb-6 flex justify-center"
                    >
                        <div className={`p-6 rounded-[28px] ${isCorrect ? 'bg-green-500/40 text-white' : 'bg-red-500/40 text-white'} border border-white/30 backdrop-blur-md shadow-inner`}>
                            {isCorrect ? (
                                <CheckCircle2 className="w-16 h-16 drop-shadow-lg" strokeWidth={2.5} />
                            ) : (
                                <XCircle className="w-16 h-16 drop-shadow-lg" strokeWidth={2.5} />
                            )}
                        </div>
                    </motion.div>

                    {/* Feedback Text */}
                    <h3 className={`text-4xl sm:text-5xl font-black mb-4 tracking-tight drop-shadow-md ${isCorrect ? 'text-white' : 'text-red-500'}`}>
                        {isCorrect ? 'Correct!' : "Incorrect!"}
                    </h3>

                    <div className={`p-5 sm:p-6 rounded-2xl mb-8 border-2 text-center bg-white/40 border-white/40 shadow-inner overflow-y-auto max-h-[30vh] scrollbar-hide`}>
                        <p className="text-[#005EB8] font-bold text-lg sm:text-xl leading-snug drop-shadow-sm">
                            {explanation}
                        </p>
                    </div>

                    {/* Action Button (2s delay + state guard) */}
                    <motion.button
                        initial={{ opacity: 0, y: 10, pointerEvents: "none" }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            pointerEvents: canAdvance ? "auto" : "none"
                        }}
                        transition={{ delay: 2, duration: 0.3 }}
                        onClick={handleNextClick}
                        whileHover={canAdvance ? { scale: 1.05 } : {}}
                        whileTap={canAdvance ? { scale: 0.95 } : {}}
                        className={`w-full font-black py-4 px-8 rounded-2xl transition-all shadow-xl text-xl sm:text-2xl flex items-center justify-center border-b-4 ${isCorrect
                            ? 'bg-brand-blue text-white border-brand-blue/70'
                            : 'bg-red-500 text-white border-red-700/50'
                            } ${!canAdvance ? 'cursor-default opacity-0' : 'cursor-pointer'}`}
                    >
                        Next
                    </motion.button>

                    {/* Progress Bar (Centered pill to avoid clipping) */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[60%] h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className={`h-full ${isCorrect ? 'bg-white' : 'bg-red-500'}`}
                        />
                    </div>
                </div>
            </motion.div>

            <style>{`
                .glass-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.25));
                }
            `}</style>
        </div>
    );
};

export default FeedbackScreen;
