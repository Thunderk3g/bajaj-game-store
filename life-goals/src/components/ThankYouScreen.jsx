import { motion } from 'framer-motion';
import { RotateCcw } from "lucide-react";
import Confetti from './Confetti';
import RotatingText from './RotatingText';
import Speedometer from './Speedometer';

const ThankYouScreen = ({ userName = "User", score, onRestart }) => {
    return (
        <div className="ghibli-card">
            <Confetti />

            {/* Background Pattern */}
            <div className="bg-burst"></div>

            {/* Content Layer - Responsive padding */}
            <div className="ghibli-content justify-between sm:justify-center py-4 sm:py-8">

                {/* Simplified Thank You Message */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center justify-center my-auto flex-1 text-center px-4"
                >
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic tracking-tight drop-shadow-xl mb-6 leading-tight flex flex-col items-center"
                    >
                        <span>Thank You</span>
                        <span className="text-[#FF8C00] drop-shadow-[0_0_10px_rgba(255,140,0,0.6)]">{userName}</span>
                        <span>for sharing your details</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg sm:text-xl md:text-2xl text-blue-100 font-bold drop-shadow-md mb-12"
                    >
                        Our Relationship Manager will reach out to you
                    </motion.p>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={onRestart}
                        className="text-blue-100 hover:text-white text-sm sm:text-lg font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3 mx-auto drop-shadow-md py-4 px-8 border-2 border-white/20 bg-white/5 hover:bg-white/10 rounded-xl"
                    >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" /> Retake Quiz
                    </motion.button>
                </motion.div>

            </div>
        </div>
    );
};

export default ThankYouScreen;
