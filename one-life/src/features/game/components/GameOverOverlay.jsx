import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_OVER_MESSAGES } from '../constants/constants';
import { useGame, GAME_STATUS } from '../context/GameContext';

const GameOverOverlay = () => {
    const { status, setStatus } = useGame();
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [grayscaleAmount, setGrayscaleAmount] = useState(0);

    useEffect(() => {
        if (status !== GAME_STATUS.CRASH) return;

        // Gradually increase grayscale
        const grayscaleTimer = setInterval(() => {
            setGrayscaleAmount(prev => {
                if (prev >= 1) { clearInterval(grayscaleTimer); return 1; }
                return prev + 0.05;
            });
        }, 50);

        // Show messages one by one
        const timers = [];
        GAME_OVER_MESSAGES.forEach((msg, index) => {
            const t = setTimeout(() => {
                setVisibleMessages(prev => [...prev, msg]);
            }, msg.delay + 800);
            timers.push(t);
        });

        // Auto-transition to result screen 2s after last message
        const lastMsg = GAME_OVER_MESSAGES[GAME_OVER_MESSAGES.length - 1];
        const autoTransition = setTimeout(() => {
            setStatus(GAME_STATUS.CTA);
        }, lastMsg.delay + 800 + 3000);
        timers.push(autoTransition);

        return () => {
            clearInterval(grayscaleTimer);
            timers.forEach(t => clearTimeout(t));
        };
    }, [status, setStatus]);

    if (status !== GAME_STATUS.CRASH) return null;

    return (
        <motion.div
            className="absolute inset-0 z-[90] flex flex-col items-center justify-center p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Grayscale overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    transition: 'all 1s ease',
                    backdropFilter: `grayscale(${grayscaleAmount})`,
                    WebkitBackdropFilter: `grayscale(${grayscaleAmount})`,
                }}
            />

            <div className="relative z-10 space-y-8 max-w-[340px]">
                <AnimatePresence>
                    {visibleMessages.map((msg, index) => (
                        <motion.p
                            key={index}
                            className="text-white font-black drop-shadow-2xl"
                            style={{
                                fontSize: index === visibleMessages.length - 1 ? '28px' : '22px',
                                opacity: index === visibleMessages.length - 1 ? 1 : 0.5,
                                filter: index === visibleMessages.length - 1 ? 'none' : 'blur(1px)',
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {msg.text}
                        </motion.p>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GameOverOverlay;
