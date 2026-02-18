import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Progress = ({ value, max = 100, className }) => {
    const percentage = (value / max) * 100;

    return (
        <div className={cn("w-full h-1.5 bg-slate-100 overflow-hidden", className)}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-primary-500"
            />
        </div>
    );
};

export { Progress };
