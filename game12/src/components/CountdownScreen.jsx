import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';

const CountdownScreen = ({ onComplete, userName = "User" }) => {
    const [count, setCount] = useState(3);
    const { playSound } = useSound();

    useEffect(() => {
        if (count === 3) {
            playSound('mixkit-clock-countdown-bleeps-916', { startTime: 1.0 });
        }

        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [count, onComplete, playSound]);

    // Circle properties
    const radius = 120;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="ghibli-card flex items-center justify-center overflow-hidden relative">
            {/* Background Pattern */}
            <div className="bg-burst"></div>

            {/* Clock Container */}
            <div className="relative flex items-center justify-center">
                {/* SVG Ring - Hide when showing text to avoid clutter or keep it? 
                    Let's hide the ring when count is 0 to focus on text 
                */}
                {count > 0 && (
                    <svg className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rotate-[-90deg] absolute">
                        {/* Background Circle */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="15"
                        />
                        {/* Animated Progress Circle (Anti-Clockwise) */}
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            fill="none"
                            stroke="#FF8C00"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: 0 }}
                            animate={{ strokeDashoffset: -circumference }}
                            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                        />
                    </svg>
                )}

                {/* Center Number / Text */}
                <div className="relative z-10 flex items-center justify-center text-center px-4 w-[200px] h-[200px]">
                    <AnimatePresence initial={false}>
                        {count > 0 ? (
                            <motion.div
                                key={count}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <span className="text-8xl sm:text-9xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] tracking-widest leading-none"
                                    style={{ textShadow: "4px 4px 0px #993D00" }}>
                                    {count}
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="message"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.1, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute inset-0 flex items-center justify-center max-w-md"
                            >
                                <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md leading-tight uppercase">
                                    <span className="text-[#FF8C00] drop-shadow-sm">{userName || "User"}'s</span> <br />
                                    Life Goals are Loading...
                                </h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CountdownScreen;
