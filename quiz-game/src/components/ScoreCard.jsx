import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const ScoreCard = ({ score, total }) => {
    const count = useMotionValue(0);
    const roundedCount = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, score, { duration: 2, ease: "easeOut" });
        return controls.stop;
    }, [score, count]);

    // Circle properties
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / total) * circumference;

    return (
        <div className="flex justify-center items-center py-1">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="12"
                        className="drop-shadow-sm"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="#1CB0F6" // brand-blue
                        strokeWidth="12"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="uppercase tracking-widest text-[10px] font-black text-gray-400 mb-1">
                        Your Score
                    </div>
                    <div className="flex items-baseline justify-center text-brand-blue gap-0.5">
                        <motion.span className="text-5xl font-black leading-none">
                            {roundedCount}
                        </motion.span>
                        <span className="text-2xl font-bold opacity-70">/{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreCard;
