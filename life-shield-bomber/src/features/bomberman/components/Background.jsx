/**
 * Background — Cinematic dashboard background with grid texture and floating orbs.
 */
import { memo } from 'react';
import { motion } from 'framer-motion';

const Background = memo(function Background() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-cinematic">
            <div className="absolute inset-0 grid-texture opacity-20" />

            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], rotate: [0, 45, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute top-[-10%] left-[20%] w-[31.25rem] h-[31.25rem] bg-blue-600/10 blur-[7.5rem] rounded-full"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, -30, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
                className="absolute bottom-[-10%] right-[10%] w-[25rem] h-[25rem] bg-teal-500/10 blur-[6.25rem] rounded-full"
            />

            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        opacity: 0,
                    }}
                    animate={{
                        y: [null, `${Math.random() * -10}%`],
                        opacity: [0, 0.3, 0],
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full blur-[0.0625rem]"
                />
            ))}
        </div>
    );
});

export default Background;
