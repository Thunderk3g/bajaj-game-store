import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onDismiss }) => {
    const icons = {
        info: <Info className="text-blue w-5 h-5" />,
        success: <CheckCircle2 className="text-growth w-5 h-5" />,
        error: <AlertCircle className="text-risk w-5 h-5" />,
        warning: <AlertCircle className="text-gold w-5 h-5" />,
    };

    const variants = {
        info: 'border-blue/30 bg-blue/10',
        success: 'border-growth/30 bg-growth/10',
        error: 'border-risk/30 bg-risk/10',
        warning: 'border-gold/30 bg-gold/10',
    };

    return (
        <div className="fixed top-8 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl
              pointer-events-auto max-w-sm w-full
              ${variants[type]}
            `}
                    >
                        {icons[type]}
                        <p className="text-sm font-medium text-white/90">{message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
