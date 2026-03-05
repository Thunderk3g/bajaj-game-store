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

        // Show messages one by one with 2s stagger
        const timers = [];
        GAME_OVER_MESSAGES.forEach((msg, index) => {
            const t = setTimeout(() => {
                setVisibleMessages(prev => [...prev, msg]);
            }, msg.delay + 800); // +800ms to let grayscale build first
            timers.push(t);
        });

        // Auto-transition to result screen 2s after the last message appears
        const lastMsg = GAME_OVER_MESSAGES[GAME_OVER_MESSAGES.length - 1];
        const autoTransition = setTimeout(() => {
            setStatus(GAME_STATUS.CTA);
        }, lastMsg.delay + 800 + 4000); // last msg delay + initial wait + 4s pause as requested
        timers.push(autoTransition);

        return () => {
            clearInterval(grayscaleTimer);
            timers.forEach(t => clearTimeout(t));
        };
    }, [status, setStatus]);

    if (status !== GAME_STATUS.CRASH) return null;

    return (
        <motion.div
            className="absolute inset-0 z-[90] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Grayscale overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    transition: 'all 1s ease',
                    backdropFilter: `grayscale(${grayscaleAmount})`,
                    WebkitBackdropFilter: `grayscale(${grayscaleAmount})`,
                }}
            />

            {/* Message sequence — shown one by one, centered */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                padding: '0 32px',
                textAlign: 'center',
                maxWidth: '380px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
            }}>
                <AnimatePresence>
                    {visibleMessages.map((msg, index) => (
                        <motion.p
                            key={index}
                            style={{
                                fontFamily: "'Outfit', system-ui, sans-serif",
                                letterSpacing: '0.02em',
                                lineHeight: 1.4,
                                textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                                // Progressive emphasis: last message is biggest & boldest
                                fontSize: index === visibleMessages.length - 1 && index === 2
                                    ? '30px'
                                    : index >= 1
                                        ? '26px'
                                        : '22px',
                                fontWeight: index === 2 ? 900 : 700,
                                color: '#ffffff',
                            }}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
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
