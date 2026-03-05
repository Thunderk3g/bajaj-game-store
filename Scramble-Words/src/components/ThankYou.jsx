import { motion } from "framer-motion";

// UPDATED: onReplay = go directly to game (skip name form)
//          onHome   = go all the way back to the start/lead screen
export default function ThankYou({ onHome, onReplay, firstName }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 game-bg-gradient font-sans"
        >
            <div className="space-y-6">
                {/* Large Heading */}
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-widest leading-tight uppercase">
                    THANK YOU!
                </h1>

                {/* Optional First Name */}
                {firstName && (
                    <h2 className="text-3xl sm:text-4xl font-bold text-white/90 uppercase tracking-wider">
                        {firstName}
                    </h2>
                )}

                {/* Thin Subtle Divider Line */}
                <div className="h-px w-24 bg-white/30 mx-auto my-6"></div>

                {/* Two Lines of Text */}
                <div className="space-y-2">
                    <p className="text-white/90 text-lg sm:text-xl font-medium tracking-wide">
                        Thank you for sharing your details.
                    </p>
                    <p className="text-white/80 text-base sm:text-lg font-normal tracking-wide">
                        Our Relationship Manager will reach out to you shortly.
                    </p>
                </div>

                {/* ADDED: Play Again — jumps directly to the game/questions screen (skips name form) */}
                <motion.button
                    onClick={onReplay}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all border-2 border-white/10"
                >
                    PLAY AGAIN
                </motion.button>
            </div>
        </motion.div>
    );
}
