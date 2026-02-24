import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MilestoneOverlay = ({ isVisible, message, onDismiss }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onDismiss, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onDismiss]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-6"
                >
                    <div className="bg-blue-600 bg-opacity-95 backdrop-blur-md p-8 rounded-2xl border-4 border-white shadow-xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-20">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4, ease: "linear" }}
                                className="h-full bg-white"
                            />
                        </div>

                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="inline-block mb-4"
                        >
                            <Sparkles className="w-12 h-12 text-blue-200 drop-shadow-md" />
                        </motion.div>

                        <h2 className="text-white text-xl font-black uppercase tracking-widest mb-1">Milestone Reached!</h2>



                        <p className="text-white font-extrabold text-lg leading-tight uppercase italic drop-shadow-sm">
                            {message}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MilestoneOverlay;
