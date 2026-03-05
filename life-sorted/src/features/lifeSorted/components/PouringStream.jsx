import React from 'react';
import { motion } from 'framer-motion';

const PouringStream = ({ sourceX, sourceY, targetX, targetY, color, isStreaming }) => {
    if (!isStreaming) return null;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: Math.abs(targetY - sourceY) + 40, opacity: 1 }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.1 } }}
            style={{
                position: 'fixed',
                left: sourceX,
                top: sourceY,
                width: '12px',
                height: Math.abs(targetY - sourceY) + 20,
                background: `linear-gradient(to bottom, transparent, ${color} 10%, ${color} 90%, transparent)`,
                zIndex: 45,
                borderRadius: '20px',
                boxShadow: `0 0 15px ${color}88`,
                pointerEvents: 'none',
                transform: 'translateX(-50%)' // Center the stream on sourceX
            }}
            className="animate-flow"
        />
    );
};

export default PouringStream;
