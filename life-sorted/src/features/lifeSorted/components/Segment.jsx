import React from 'react';
import { motion } from 'framer-motion';

const Segment = ({
    element,
    isTop,
    isBottom,
    isBeingPoured = false,
    isFilling = false,
    tiltAngle = 0,
    heightPct = 25 // Default for 4 slots
}) => {
    const baseColor = element.color;

    // Calculate counter-rotation to keep liquid surface level with horizon
    const surfaceRotation = -tiltAngle;

    return (
        <motion.div
            layout
            initial={isFilling ? { height: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={{
                // FIXED: Use heightPct for consistent volume. Drainage shrinks to 0.
                height: isBeingPoured ? 0 : `${heightPct}%`,
                opacity: (isBeingPoured && !isFilling) ? 0 : 1,
                transition: {
                    height: {
                        duration: 0.5,
                        delay: isFilling ? 0.3 : 0,
                        ease: "easeInOut"
                    },
                    opacity: { duration: 0.3 }
                }
            }}
            className={`relative w-full flex-shrink-0 flex items-center justify-center
        ${isBottom ? 'rounded-b-[2rem]' : 'rounded-none'}
      `}
            style={{
                backgroundColor: baseColor,
                marginBottom: '-1px', // close sub-pixel gap between segments
            }}
        >


            {/* Label - Hidden during animation/tilt for clarity */}
            {!isBeingPoured && !isFilling && tiltAngle === 0 && (
                <span className="relative z-10 text-[0.45rem] font-bold text-white/50 uppercase tracking-tighter select-none leading-none">
                    {element.label}
                </span>
            )}
        </motion.div>
    );
};

export default Segment;
