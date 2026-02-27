import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ScoreCard = ({ score, total }) => {
    const count = useMotionValue(0);
    const roundedCount = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, score, { duration: 2, ease: "easeOut" });
        return controls.stop;
    }, [score, count]);

    // Circle properties
    const radius = 75;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 20) * circumference;

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
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - Math.min(progress, circumference) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="flex flex-col items-center justify-center text-blue-500">
                        <motion.span className="text-6xl font-black leading-none tracking-tighter">
                            {roundedCount}
                        </motion.span>
                        <div className="uppercase tracking-widest text-[10px] font-black text-blue-400 mt-1">
                            {score === 1 ? 'Milestone' : 'Milestones'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreCard;
