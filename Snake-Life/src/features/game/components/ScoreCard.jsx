import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ScoreCard = ({ score, total = 20 }) => {
    const count = useMotionValue(0);
    const roundedCount = useTransform(count, (latest) => Math.round(latest));
    
    // Dynamic color transition: Red until 10, then Green
    const strokeColor = useTransform(
        count,
        [0, 10, 10.1, total],
        ["#ef4444", "#ef4444", "#22c55e", "#22c55e"]
    );

    // Glow effect (Drop shadow color)
    const glowColor = useTransform(
        count,
        [0, 10, 10.1, total],
        ["rgba(239, 68, 68, 0.5)", "rgba(239, 68, 68, 0.5)", "rgba(34, 197, 94, 0.5)", "rgba(34, 197, 94, 0.5)"]
    );

    useEffect(() => {
        const controls = animate(count, score, { duration: 2, ease: "easeOut" });
        return controls.stop;
    }, [score, count]);

    // Circle properties
    const radius = 75;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / total) * circumference;

    return (
        <div className="flex justify-center items-center py-1 sh:py-0">
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="10"
                    />
                    {/* Ring Border Decor */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius + 6}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1"
                        opacity="0.3"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        style={{ 
                            filter: `drop-shadow(0 0 8px ${glowColor.get()})`
                        }}
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - Math.min(progress, circumference) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="flex items-baseline justify-center text-white">
                        <motion.span className="text-6xl font-black leading-none tracking-tighter drop-shadow-md">
                            {roundedCount}
                        </motion.span>
                    </div>
                    <div className="text-xs font-black text-gray-200 mt-1 uppercase tracking-widest text-center drop-shadow-sm">
                        {score === 1 ? 'Milestone' : 'Milestones'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreCard;
