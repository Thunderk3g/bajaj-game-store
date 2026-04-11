import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../features/game/context/GameContext.jsx';

/**
 * ThankYouPage — exact replica of Scramble-Words ThankYou.jsx
 *
 * - Same dark game-bg-gradient background
 * - Large "THANK YOU!" heading
 * - User's first name from sessionStorage underneath
 * - Thin divider line
 * - Two-line message
 * - Orange "Play Again" button
 */
const ThankYouPage = memo(function ThankYouPage() {
    const navigate = useNavigate();
    const { restartGame } = useGame();

    // Read the name the user entered on the intro form
    const fullName = sessionStorage.getItem('sudokuUserName') || '';
    const firstName = fullName.split(' ')[0] || '';

    const handleHome = () => navigate('/');
    const handleReplay = () => {
        restartGame();
        navigate('/game');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-dvh flex flex-col items-center justify-center p-6 text-center font-sans overflow-y-auto"
            style={{
                background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #0c1a2e 100%)',
            }}
        >
            <div className="space-y-6">
                {/* Large heading */}
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-widest leading-tight uppercase">
                    THANK YOU!
                </h1>

                {/* First name — shown if we have it */}
                {firstName && (
                    <h2 className="text-3xl sm:text-4xl font-bold text-white/90 uppercase tracking-wider">
                        {firstName.toUpperCase()}
                    </h2>
                )}

                {/* Thin divider */}
                <div className="h-px w-24 bg-white/30 mx-auto my-6" />

                {/* Two lines of text */}
                <div className="space-y-2">
                    <p className="text-white/90 text-lg sm:text-xl font-medium tracking-wide">
                        Thank you for sharing your details.
                    </p>
                    <p className="text-white/80 text-base sm:text-lg font-normal tracking-wide">
                        Our Relationship Manager will reach out to you shortly
                    </p>
                </div>

                {/* Play Again */}
                <motion.button
                    onClick={handleReplay}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all border-2 border-white/10"
                >
                    Play Again
                </motion.button>
            </div>
        </motion.div>
    );
});

export default ThankYouPage;
