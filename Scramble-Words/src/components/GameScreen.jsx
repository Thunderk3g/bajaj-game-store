import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { WORDS } from "../data/words";
import WordLinker from "./WordLinker";
import expertImg from "../assets/MaleImg.png";

export default function GameScreen({ onEnd }) {
    const [wordIndex, setWordIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [shuffledLetters, setShuffledLetters] = useState([]);
    const [placedLetters, setPlacedLetters] = useState([]); // Array of {char, originalIndex} or null
    const [usedLetterIndices, setUsedLetterIndices] = useState([]); // Indices from shuffledLetters
    const [hintUsedCount, setHintUsedCount] = useState(0);
    const [hintedBankIndex, setHintedBankIndex] = useState(null);
    const [wrongSlotIndices, setWrongSlotIndices] = useState([]);
    const [wrongTryCount, setWrongTryCount] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [showRevealedPop, setShowRevealedPop] = useState(false);
    const [questionResults, setQuestionResults] = useState(new Array(5).fill(null)); // 'correct', 'wrong', or null

    // Limit to first 5 questions
    const [gameWords, setGameWords] = useState([]);

    useEffect(() => {
        const shuffled = [...(WORDS || [])].sort(() => Math.random() - 0.5);
        setGameWords(shuffled.slice(0, 5));
    }, []);

    const currentWordObj = (gameWords && gameWords[wordIndex]) ? gameWords[wordIndex] : null;

    // Shuffle letters whenever wordIndex changes
    useEffect(() => {
        if (currentWordObj && currentWordObj.word) {
            const letters = currentWordObj.word.split("").sort(() => Math.random() - 0.5);
            setShuffledLetters(letters);
            setPlacedLetters(new Array(currentWordObj.word.length).fill(null));
            setUsedLetterIndices([]);
            setHintUsedCount(0);
            setWrongTryCount(0);
            setIsLocked(false);
            setIsError(false);
            setMessage("");
            setShowRevealedPop(false);
        }
    }, [wordIndex, currentWordObj?.word]);

    const handleLetterPlace = (shuffledIndex, targetBoxIndex = null) => {
        if (isLocked || isTransitioning || usedLetterIndices.includes(shuffledIndex)) return;

        const char = shuffledLetters[shuffledIndex];
        const nextEmptyIndex = targetBoxIndex !== null ? targetBoxIndex : placedLetters.indexOf(null);

        if (nextEmptyIndex !== -1 && nextEmptyIndex < placedLetters.length) {
            // If targeted box is already full, we can either swap or just place in next empty
            // User said "place over there", so let's allow overwriting or returning old letter
            const oldPlaced = placedLetters[nextEmptyIndex];
            const newPlaced = [...placedLetters];
            const newUsed = [...usedLetterIndices];

            if (oldPlaced) {
                // Remove old letter from used list
                const oldIdx = newUsed.indexOf(oldPlaced.shuffledIndex);
                if (oldIdx !== -1) newUsed.splice(oldIdx, 1);
            }

            newPlaced[nextEmptyIndex] = { char, shuffledIndex };
            newUsed.push(shuffledIndex);

            setPlacedLetters(newPlaced);
            setUsedLetterIndices(newUsed);

            // Auto-validate if all filled
            if (newPlaced.every(p => p !== null)) {
                const formedWord = newPlaced.map(p => p.char).join("");
                validateWord(formedWord);
            }
        }
    };

    const handleRemoveLetter = (index) => {
        if (isLocked || isTransitioning || !placedLetters[index]) return;

        const removedLetter = placedLetters[index];
        const newPlaced = [...placedLetters];
        newPlaced[index] = null;
        setPlacedLetters(newPlaced);

        setUsedLetterIndices(prev => prev.filter(idx => idx !== removedLetter.shuffledIndex));
    };

    const validateWord = (formedWord) => {
        if (formedWord === currentWordObj.word) {
            handleSuccess();
        } else {
            handleError();
        }
    };

    const handleSuccess = () => {
        setScore(prev => prev + 10);
        setMessage("Excellent!");
        setMessage("Excellent!");
        setIsTransitioning(true);
        setIsLocked(true);

        setQuestionResults(prev => {
            const next = [...prev];
            next[wordIndex] = 'correct';
            return next;
        });

        setTimeout(() => {
            setMessage("");
            if (wordIndex < gameWords.length - 1) {
                setWordIndex(prev => prev + 1);
                setIsTransitioning(false);
            } else {
                onEnd(score + 10);
            }
        }, 1500);
    };

    const handleError = () => {
        const nextWrongCount = wrongTryCount + 1;
        setWrongTryCount(nextWrongCount);

        setIsError(true);
        setMessage("Try Again!");

        if (nextWrongCount >= 2) {
            setIsLocked(true);
            setQuestionResults(prev => {
                const next = [...prev];
                next[wordIndex] = 'wrong';
                return next;
            });
            setTimeout(() => {
                setIsError(false);
                setMessage("");
                setShowRevealedPop(true);
                setIsTransitioning(true); // Fill slots as well for visual clarity

                setTimeout(() => {
                    setShowRevealedPop(false);
                    if (wordIndex < gameWords.length - 1) {
                        setWordIndex(prev => prev + 1);
                        setIsTransitioning(false);
                    } else {
                        onEnd(score);
                    }
                }, 5000);
            }, 1000);
        } else {
            setTimeout(() => {
                setIsError(false);
                setMessage("");
                handleReset(); // Automatically reset on wrong attempt to allow retry
            }, 1000);
        }
    };

    const handleReset = () => {
        if (isLocked || isTransitioning) return;
        setPlacedLetters(new Array(currentWordObj.word.length).fill(null));
        setUsedLetterIndices([]);
    };

    const handleHint = () => {
        if (isLocked || isTransitioning || hintUsedCount >= 3) {
            if (hintUsedCount >= 3) {
                setMessage("Hints Exhausted");
                setTimeout(() => setMessage(""), 1000);
            }
            return;
        }

        // 2. Identify ALL incorrect placed letters
        const currentWrongIndices = [];
        placedLetters.forEach((placed, index) => {
            if (placed && placed.char !== currentWordObj.word[index]) {
                currentWrongIndices.push(index);
            }
        });

        if (currentWrongIndices.length > 0) {
            setMessage("Incorrect letters found!");
            setWrongSlotIndices(currentWrongIndices);
            setHintUsedCount(prev => prev + 1); // Reduce hint count

            // Find the correct letter for the FIRST error to guide the user
            const firstWrongIndex = currentWrongIndices[0];
            const targetChar = currentWordObj.word[firstWrongIndex];

            const bankIndex = shuffledLetters.findIndex((char, idx) =>
                char === targetChar && !usedLetterIndices.includes(idx)
            );

            if (bankIndex !== -1) {
                setHintedBankIndex(bankIndex);
            }

            setTimeout(() => {
                setHintedBankIndex(null);
                setWrongSlotIndices([]);
                setMessage("");
            }, 2000);
            return;
        }

        // 3. If the slot is empty and preceding ones are correct, auto-place
        // Find the FIRST index that is either empty OR incorrectly filled (after checking for existing wrong ones)
        let targetIndex = -1;
        for (let i = 0; i < currentWordObj.word.length; i++) {
            if (!placedLetters[i] || placedLetters[i].char !== currentWordObj.word[i]) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex === -1) return; // Word is already correct but maybe not submitted

        const targetChar = currentWordObj.word[targetIndex];

        const bankIndex = shuffledLetters.findIndex((char, idx) =>
            char === targetChar && !usedLetterIndices.includes(idx)
        );

        if (bankIndex !== -1) {
            handleLetterPlace(bankIndex, targetIndex);
            setHintUsedCount(prev => prev + 1);
        }
    };

    if (!currentWordObj) return <div className="text-white p-10 font-game">Loading...</div>;

    return (
        <div className="w-full h-dvh flex flex-col items-center justify-between px-3 py-3 sm:p-4 md:p-6 relative game-bg-gradient overflow-y-auto">

            {/* Top Info Bar */}
            <div className="z-10 w-full max-w-lg flex justify-between items-center mt-1 sm:mt-4 shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 sm:px-6 sm:py-2 rounded-2xl border border-white/20">
                    <span className="text-blue-300 font-bold uppercase tracking-wider text-[10px] sm:text-xs block text-left"></span>
                    <span className="text-xl sm:text-2xl font-game text-white">{wordIndex + 1}/{gameWords ? gameWords.length : 0}</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-3 py-2 sm:px-6 sm:py-2 rounded-2xl border border-white/20 flex gap-1 sm:gap-2 justify-center">
                    {gameWords.map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${questionResults[i] === 'correct' ? 'text-yellow-400 fill-yellow-400' :
                                questionResults[i] === 'wrong' ? 'text-red-500 fill-red-500' :
                                    'text-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Expert Character & Hint Pill */}
            <motion.div
                className="z-10 w-full max-w-lg shrink-0 relative flex items-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={`hint-pill-${wordIndex}`}
            >
                <div className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] border-amber-400 bg-gradient-to-br from-blue-100 to-slate-200 shadow-lg z-10 relative">
                    <img
                        src={expertImg}
                        alt="Expert character"
                        className="w-full h-full object-cover object-top"
                    />
                </div>

                <div className="flex-1 -ml-8 sm:-ml-12 bg-white/90 backdrop-blur-sm rounded-3xl py-4 pl-12 pr-6 sm:pl-16 sm:pr-8 sm:py-6 shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/40">
                    <p className="text-blue-900 font-bold text-lg sm:text-2xl md:text-3xl leading-tight sm:leading-snug text-center">
                        {currentWordObj.hint}
                    </p>
                </div>
            </motion.div>

            {/* Success / Error Message / Reveal Pop */}
            <div className="h-20 sm:h-32 flex items-center justify-center shrink-0">
                <AnimatePresence mode="wait">
                    {message && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            key={`msg-${message}`}
                            className={`z-50 px-5 py-1.5 sm:px-8 sm:py-3 rounded-full font-game text-base sm:text-2xl shadow-xl ${message === "Excellent!"
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white"
                                }`}
                        >
                            {message}
                        </motion.div>
                    )}

                    {showRevealedPop && !message && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="z-50 bg-amber-500 text-blue-900 px-6 py-3 sm:px-10 sm:py-5 rounded-3xl font-game flex flex-col items-center gap-2 shadow-[0_0_40px_rgba(245,158,11,0.6)] border-2 border-amber-300 max-w-[90%]"
                        >
                            <span className="text-sm sm:text-lg uppercase tracking-widest text-blue-900/60 font-bold">Try Exhausted</span>
                            <div className="text-xl sm:text-3xl flex flex-col items-center">
                                <span className="text-white tracking-[0.2em] font-game mb-2">{currentWordObj.word}</span>
                                <p className="text-xs sm:text-base text-blue-900 font-semibold text-center italic leading-tight">
                                    "{currentWordObj.hint}"
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Active Word Slots */}
            <div className="z-10 flex flex-wrap justify-center gap-1 sm:gap-2 mb-1 sm:mb-4 shrink-0">
                {placedLetters.map((placed, i) => (
                    <div
                        key={`${wordIndex}-${i}`}
                        data-box-index={i}
                        onClick={() => handleRemoveLetter(i)}
                        className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 flex items-center justify-center
                            ${(placed || isTransitioning)
                                ? 'bg-white shadow-md cursor-pointer hover:bg-white/90'
                                : 'border-2 border-dotted border-white/20 bg-white/5'
                            }
                            ${isError ? 'animate-shake border-rose-500 bg-rose-500/10' : ''}
                            ${(isTransitioning && !isError) ? 'success-glow' : ''}
                            ${(wrongSlotIndices.includes(i)) ? 'wrong-glow' : ''}
                        `}
                    >
                        {(placed || isTransitioning) && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`font-game text-2xl sm:text-4xl pointer-events-none drop-shadow-sm
                                    ${placed ? 'text-blue-900' : 'text-white'}
                                `}
                            >
                                {isTransitioning ? (currentWordObj.word[i]) : placed.char}
                            </motion.span>
                        )}
                    </div>
                ))}
            </div>

            <div className="z-10 w-full max-w-lg mb-2 sm:mb-6 shrink-0 flex flex-col items-center gap-4 sm:gap-6">
                <WordLinker
                    key={`linker-${wordIndex}`}
                    letters={shuffledLetters}
                    usedIndices={usedLetterIndices}
                    hintedIndex={hintedBankIndex}
                    onLetterSelect={handleLetterPlace}
                />

                <div className="flex gap-4 sm:gap-6 pb-2 sm:pb-0">
                    <motion.button
                        onClick={handleHint}
                        className="bg-amber-400 backdrop-blur-md px-8 py-3 sm:px-12 sm:py-5 rounded-2xl border-b-8 border-amber-600 text-blue-900 font-game text-xl sm:text-3xl uppercase tracking-widest hover:bg-amber-300 transition-all shadow-2xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Hint ({3 - hintUsedCount})
                    </motion.button>

                    {/* CHANGED: disabled once result is shown (isLocked) or transitioning to next word */}
                    <motion.button
                        onClick={handleReset}
                        disabled={isLocked || isTransitioning}
                        className={`bg-white/10 backdrop-blur-md px-5 py-2 sm:px-10 sm:py-4 rounded-2xl border-b-4 border-white/20 text-white font-game text-lg sm:text-2xl uppercase tracking-widest transition-all shadow-lg ${isLocked || isTransitioning
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-white/20'
                            }`}
                        whileHover={!(isLocked || isTransitioning) ? { scale: 1.05 } : {}}
                        whileTap={!(isLocked || isTransitioning) ? { scale: 0.95 } : {}}
                    >
                        Reset
                    </motion.button>
                </div>
            </div>

            <style>{`
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .success-glow {
                    animation: success-pulse 0.8s infinite alternate ease-in-out;
                    box-shadow:
                        0 0 0 2px rgba(245, 158, 11, 0.4),
                        0 0 12px rgba(245, 158, 11, 0.6),
                        inset 0 0 8px rgba(245, 158, 11, 0.1);
                    z-index: 20;
                }
                @keyframes success-pulse {
                    from {
                        box-shadow:
                            0 0 0 1px rgba(245, 158, 11, 0.3),
                            0 0 8px rgba(245, 158, 11, 0.4),
                            inset 0 0 4px rgba(245, 158, 11, 0.1);
                    }
                    to {
                        box-shadow: 
                            0 0 0 4px rgba(245, 158, 11, 0.5),
                            0 0 20px rgba(245, 158, 11, 0.8),
                            inset 0 0 12px rgba(245, 158, 11, 0.2);
                    }
                }
                .hint-glow {
                    animation: hint-pulse 0.5s infinite alternate ease-in-out;
                    border: 3px solid #f59e0b !important;
                    box-shadow: 0 0 20px #f59e0b, inset 0 0 10px #f59e0b;
                    z-index: 40 !important;
                }
                @keyframes hint-pulse {
                    from { transform: scale(1); box-shadow: 0 0 10px #f59e0b; }
                    to { transform: scale(1.15); box-shadow: 0 0 30px #f59e0b; }
                }
                .wrong-glow {
                    animation: wrong-pulse 0.5s infinite alternate ease-in-out;
                    border: 3px solid #ef4444 !important;
                    box-shadow: 0 0 15px #ef4444;
                    z-index: 40 !important;
                }
                @keyframes wrong-pulse {
                    from { transform: scale(1); box-shadow: 0 0 8px #ef4444; }
                    to { transform: scale(1.1); box-shadow: 0 0 20px #ef4444; }
                }
          `}</style>
        </div>
    );
}
