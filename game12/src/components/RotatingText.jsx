import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RotatingText = forwardRef((props, ref) => {
    const {
        texts,
        transition = { type: "spring", damping: 25, stiffness: 300 },
        initial = { y: "100%" },
        animate = { y: 0 },
        exit = { y: "-120%" },
        animatePresenceMode = "wait",
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = "first",
        loop = true,
        auto = true,
        splitBy = "characters",
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const next = () => {
        const nextIndex =
            currentTextIndex === texts.length - 1
                ? loop
                    ? 0
                    : currentTextIndex
                : currentTextIndex + 1;
        setCurrentTextIndex(nextIndex);
        if (onNext) onNext(nextIndex);
    };

    const previous = () => {
        const prevIndex =
            currentTextIndex === 0
                ? loop
                    ? texts.length - 1
                    : currentTextIndex
                : currentTextIndex - 1;
        setCurrentTextIndex(prevIndex);
        if (onNext) onNext(prevIndex);
    };

    const jumpTo = (index) => {
        const targetIndex = Math.max(0, Math.min(index, texts.length - 1));
        setCurrentTextIndex(targetIndex);
        if (onNext) onNext(targetIndex);
    };

    useImperativeHandle(ref, () => ({
        next,
        previous,
        jumpTo,
        reset: () => setCurrentTextIndex(0),
    }));

    useEffect(() => {
        if (!auto) return;
        const intervalId = setInterval(next, rotationInterval);
        return () => clearInterval(intervalId);
    }, [auto, rotationInterval, texts.length, currentTextIndex]);

    const indexFrom = staggerFrom === "last" ? texts[currentTextIndex].length - 1 : 0;
    const direction = staggerFrom === "last" ? -1 : 1;

    return (
        <div
            className={`flex items-center justify-center relative ${mainClassName}`}
            {...rest}
        >
            <AnimatePresence
                mode={animatePresenceMode}
                initial={animatePresenceInitial}
            >
                <motion.div
                    key={currentTextIndex}
                    className={`flex items-center justify-center ${splitLevelClassName}`}
                >
                    {texts[currentTextIndex].split("").map((char, index) => (
                        <motion.span
                            key={index}
                            initial={initial}
                            animate={animate}
                            exit={exit}
                            transition={{
                                ...transition,
                                delay: (indexFrom + index * direction) * staggerDuration,
                            }}
                            className={`inline-block whitespace-pre ${elementLevelClassName}`}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
});

RotatingText.displayName = 'RotatingText';

export default RotatingText;
