import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Maximize,
    Keyboard,
    Smartphone,
    Hand,
    MousePointer2,
    MoveLeft,
    MoveRight,
    ArrowDown
} from 'lucide-react';

const TutorialOverlay = ({ isVisible, onStart }) => {
    const [shouldShow, setShouldShow] = useState(isVisible);

    useEffect(() => {
        if (!isVisible) return;

        setShouldShow(true);

        const handleDismiss = () => {
            setShouldShow(false);
            if (onStart) setTimeout(onStart, 300);
        };

        const timer = setTimeout(handleDismiss, 6000);

        const events = ['touchstart', 'keydown', 'mousedown'];
        events.forEach(event => window.addEventListener(event, handleDismiss, { once: true }));

        return () => {
            clearTimeout(timer);
            events.forEach(event => window.removeEventListener(event, handleDismiss));
        };
    }, [isVisible, onStart]);

    const handAnimation = {
        x: [-40, 40, -40],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    const tapAnimation = {
        scale: [1, 0.8, 1],
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    const downAnimation = {
        y: [-20, 20, -20],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-black/85 backdrop-blur-lg p-8 rounded-[2.5rem] border border-white/20 flex flex-col items-center text-center shadow-[0_0_50px_rgba(37,99,235,0.3)] max-w-[300px]">

                        <h3 className="text-white text-2xl font-black mb-8 tracking-tighter">QUICK GUIDE</h3>

                        <div className="w-full space-y-10">
                            {/* Mobile View */}
                            <div className="md:hidden space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-20 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                                        <motion.div animate={handAnimation} className="text-blue-400">
                                            <Hand className="w-8 h-8 fill-blue-400/20" />
                                        </motion.div>
                                    </div>
                                    <p className="text-sm text-blue-100 font-bold uppercase tracking-wide">Swipe Left/Right to Move</p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                                        <motion.div animate={tapAnimation} className="text-cyan-400">
                                            <Hand className="w-8 h-8 fill-cyan-400/20" />
                                        </motion.div>
                                    </div>
                                    <p className="text-sm text-blue-100 font-bold uppercase tracking-wide">Tap Center to Rotate</p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-10 h-20 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                                        <motion.div animate={downAnimation} className="text-purple-400">
                                            <Hand className="w-8 h-8 fill-purple-400/20" />
                                        </motion.div>
                                    </div>
                                    <p className="text-sm text-blue-100 font-bold uppercase tracking-wide">Swipe Down to Drop</p>
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:flex flex-col items-center gap-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-full">
                                    <div className="flex justify-center gap-2 mb-4">
                                        <KeyCap icon={<MoveLeft size={14} />} />
                                        <KeyCap icon={<ArrowDown size={14} />} />
                                        <KeyCap icon={<MoveRight size={14} />} />
                                    </div>
                                    <p className="text-sm text-blue-100 font-bold uppercase tracking-wide">Arrow Keys to Move/Drop</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-full">
                                    <div className="flex justify-center mb-4">
                                        <KeyCap label="UP" />
                                    </div>
                                    <p className="text-sm text-blue-100 font-bold uppercase tracking-wide">Up Arrow to Rotate</p>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="mt-10 pt-6 border-t border-white/10 w-full"
                        >
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] animate-pulse">
                                {window.innerWidth < 768 ? 'Tap anywhere to start' : 'Press any key to start'}
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const KeyCap = ({ icon, label }) => (
    <div className="w-10 h-10 bg-gradient-to-b from-white/20 to-white/5 rounded-lg border border-white/20 flex items-center justify-center shadow-lg">
        {icon || <span className="text-[10px] text-white font-black">{label}</span>}
    </div>
);

export default TutorialOverlay;
