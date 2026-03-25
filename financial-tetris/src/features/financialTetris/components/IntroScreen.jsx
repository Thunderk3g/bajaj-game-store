import { motion } from 'framer-motion';
import welcomeBg from '/assets/welcome_bg.png';

const IntroScreen = ({ onStart }) => {
    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-between z-[100] bg-[#0a0a25] overflow-hidden"
        >
            {/* Background Image Container */}
            <div
                className="absolute inset-0 w-full h-full bg-[length:100%_100%] bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url("${welcomeBg}")`,
                }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-12 sm:pb-24 px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="w-full max-w-sm"
                >
                    <button
                        onClick={() => onStart({})}
                        className="group relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#bbf7d0] via-[#4ade80] to-[#16a34a] p-1 shadow-[0_8px_0_0_#14532d,0_15px_30px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_#14532d,0_20px_40px_rgba(0,0,0,0.6)] active:translate-y-[4px] active:shadow-none"
                    >
                        <div className="bg-gradient-to-b from-[#4ade80] to-[#16a34a] rounded-[1.9rem] px-8 py-4 sm:py-5 border-t-2 border-white/30">
                            <span className="relative z-10 block text-3xl sm:text-5xl font-black tracking-tighter text-[#052c16] drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]">
                                PLAY
                            </span>
                        </div>

                        {/* Shimmer/Reflection effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default IntroScreen;
