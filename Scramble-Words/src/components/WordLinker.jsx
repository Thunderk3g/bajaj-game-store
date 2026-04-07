import { motion } from "framer-motion";
import { Pointer } from "lucide-react";

export default function WordLinker({ letters, usedIndices, hintedIndex, onLetterSelect, showTutorial }) {
    const isTutorialActive = showTutorial && usedIndices.length === 0;

    return (
        <div className="relative w-full max-w-[360px] min-h-[100px] flex flex-wrap justify-center gap-1.5 sm:gap-4 p-3 sm:p-5 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 shadow-inner select-none">
            {isTutorialActive && (
                <motion.div
                    className="absolute z-50 pointer-events-none text-white drop-shadow-md top-1/2 left-1/2"
                    initial={{ x: -20, y: 10, opacity: 0, scale: 1 }}
                    animate={{
                        scale: [1, 0.8, 1],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Pointer className="w-10 h-10 text-white fill-white drop-shadow-lg transform -rotate-12" />
                </motion.div>
            )}
            {letters.map((char, i) => {
                const isUsed = usedIndices.includes(i);
                const isHinted = hintedIndex === i;

                return (
                    <div key={`bank-${i}`} className="relative w-11 h-11 sm:w-16 sm:h-16">
                        {!isUsed && (
                            <motion.div
                                layout
                                layoutId={`letter-${i}`}
                                onTap={() => onLetterSelect(i)}
                                whileHover={{ scale: 1.05, zIndex: 30 }}
                                whileTap={{ scale: 0.95, zIndex: 30 }}
                                className={`w-11 h-11 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center font-sans font-bold text-2xl sm:text-4xl text-blue-900 shadow-lg cursor-pointer z-20 transition-all duration-300
                                    ${isHinted ? 'hint-glow scale-110' : ''}
                                `}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                {char}
                            </motion.div>
                        )}
                        {/* Placeholder for the letter to keep layout stable */}
                        <div className="absolute inset-0 bg-white/5 rounded-xl border-2 border-dotted border-white/20 -z-10" />
                    </div>
                );
            })}
        </div>
    );
}
