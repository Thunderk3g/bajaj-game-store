/**
 * ThankYou — Final screen after booking/completion.
 * Shows the knight character, personalised thank you, and play-again option.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import Confetti from './Confetti.jsx';
import PlayerCharacter from './PlayerCharacter.jsx';

const ThankYou = memo(function ThankYou({ onRestart, entryDetails }) {
    const userName = entryDetails?.name || 'Player';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-[100dvh] flex flex-col items-center justify-center px-6 relative"
            style={{
                background: 'radial-gradient(circle at 50% 30%, #0f2a55 0%, #081c3a 80%, #051421 100%)',
            }}
        >
            <Confetti />

            <div className="flex flex-col items-center gap-5 z-10 text-center max-w-sm">
                {/* Knight Character */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center shadow-2xl border-4 border-white/10 backdrop-blur-sm"
                >
                    <div className="w-20 h-20">
                        <PlayerCharacter />
                    </div>
                </motion.div>

                {/* Thank You {Name} */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-display text-4xl font-extrabold text-white"
                >
                    Thank You {userName}!
                </motion.h1>

                {/* Message */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/60 text-sm font-medium leading-relaxed"
                >
                    Your details have been recorded.
                </motion.p>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/50 text-sm font-medium leading-relaxed"
                >
                    Our relationship manager will connect with you shortly.
                </motion.p>

                {/* Try Again — small */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={onRestart}
                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white/50 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                >
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Try Again
                </motion.button>

            </div>
        </motion.div>
    );
});

ThankYou.propTypes = {
    onRestart: PropTypes.func.isRequired,
    entryDetails: PropTypes.object,
};

export default ThankYou;
