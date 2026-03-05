import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true }) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 20 } : false}
            animate={animate ? { opacity: 1, y: 0 } : false}
            className={`glass-panel p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
