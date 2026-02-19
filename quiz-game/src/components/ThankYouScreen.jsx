import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useQuiz } from '../context/QuizContext';

const ThankYouScreen = () => {
    const { retakeQuiz, leadName } = useQuiz();

    return (
        <motion.div
            className="w-full h-[100dvh] flex flex-col justify-between py-6 sm:py-10 px-6 text-center overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex-1 flex flex-col justify-center space-y-6 sm:space-y-10 min-h-0">
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <div className="bg-brand-blue p-4 sm:p-6 rounded-full shadow-2xl relative">
                        <div className="absolute inset-0 bg-brand-blue/30 rounded-full animate-ping" />
                        <CheckCircle2 className="w-12 h-12 sm:w-20 sm:h-20 text-white relative z-10" strokeWidth={2.5} />
                    </div>
                </motion.div>

                {/* Thank You Message */}
                <div className="space-y-3 sm:space-y-4 px-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-800 uppercase tracking-tight leading-[1.1] flex flex-col items-center">
                        <span>THANK YOU</span>
                        <span className="text-brand-blue drop-shadow-[0_0_15px_rgba(28,176,246,0.6)]">{leadName ? leadName : ''}</span>
                        <span>FOR SHARING YOUR DETAILS</span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 font-bold uppercase tracking-wide max-w-[280px] mx-auto leading-relaxed">
                        Our Relationship Manager will reach out to you
                    </p>
                </div>
            </div>

            {/* Action Section */}
            <div className="pt-4 pb-2">
                <button
                    onClick={retakeQuiz}
                    className="w-full game-btn text-xl sm:text-2xl py-4 sm:py-5"
                >
                    <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span>RETAKE</span>
                    </div>
                </button>
            </div>
        </motion.div>
    );
};

export default ThankYouScreen;
