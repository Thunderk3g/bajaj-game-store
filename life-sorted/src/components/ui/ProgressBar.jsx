import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress, isUrgent = false }) => {
    return (
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{
                    width: `${progress}%`,
                    backgroundColor: isUrgent ? 'var(--risk)' : 'var(--teal)'
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"
            />
        </div>
    );
};

export default ProgressBar;
