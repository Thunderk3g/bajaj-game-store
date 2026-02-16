import { motion } from 'framer-motion';
import { Phone } from "lucide-react";
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
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic tracking-tight drop-shadow-xl mb-6 leading-tight"
                    >
                        Thank You for sharing your details
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
                        className="w-full max-w-xs bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black text-xl py-5 shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest border-2 border-white/20"
                    >
                        RETAKE
                    </motion.button>
                </motion.div>

            </div>
        </div>
    );
};

export default ThankYouScreen;
