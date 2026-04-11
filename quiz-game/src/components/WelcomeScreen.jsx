import { motion } from 'framer-motion';

const WelcomeScreen = ({ onStart }) => {
    const handleStartClick = () => {
        onStart();
    };

    return (
        <motion.div
            className="w-full h-[100dvh] flex flex-col items-center justify-end pb-4 overflow-hidden bg-no-repeat"
            style={{
                backgroundImage: 'url(./assets/Quiz-bg.png)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full max-w-[180px] mx-auto flex items-center justify-center">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onClick={handleStartClick}
                    className="w-full game-btn-green text-lg py-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                >
                    START
                </motion.button>
            </div>
        </motion.div>
    );
};

export default WelcomeScreen;