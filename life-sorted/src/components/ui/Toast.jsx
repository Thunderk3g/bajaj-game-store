import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, Clock } from 'lucide-react';

const Toast = ({ message, type = 'info', onDismiss }) => {
    const icons = {
        info: <Info className="text-blue-400 w-5 h-5" />,
        success: <CheckCircle2 className="text-emerald-400 w-5 h-5" />,
        error: <AlertCircle className="text-red-400 w-5 h-5" />,
        warning: <Clock className="text-amber-400 w-5 h-5 animate-pulse" />,
    };

    const styles = {
        info: 'border-blue-500/40 bg-blue-950/60 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
        success: 'border-emerald-500/40 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
        error: 'border-red-500/40 bg-red-950/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
        warning: 'border-amber-500/40 bg-amber-950/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    };

    const textColors = {
        info: 'text-blue-100',
        success: 'text-emerald-100',
        error: 'text-red-100',
        warning: 'text-amber-100',
    };

    return (
        <div className="fixed top-[82px] left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92, y: -8 }}
                        transition={{
                            type: 'spring',
                            stiffness: 600,
                            damping: 32,
                            mass: 0.7
                        }}
                        className={`
                            flex items-center gap-4 px-6 py-4 rounded-[26px] border border-white/20
                            backdrop-blur-3xl pointer-events-auto max-w-sm w-full
                            shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(255,255,255,0.05)_inset]
                            ${styles[type]}
                        `}
                    >
                        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 shrink-0`}>
                            {icons[type]}
                        </div>
                        <p className={`text-[0.9rem] font-bold tracking-tight ${textColors[type]}`}>
                            {message}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
