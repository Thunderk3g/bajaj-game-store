import React from 'react';
import { motion } from 'framer-motion';

const Segment = React.forwardRef(({
    element,
    isBottom,
    heightPct = 25
}, ref) => {
    return (
        <motion.div
            ref={ref}
            layout
            className={`relative w-full flex-shrink-0
                ${isBottom ? 'rounded-b-[2rem]' : 'rounded-none'}
            `}
            style={{
                backgroundColor: element.color,
                height: `${heightPct}%`,
                marginBottom: '-1px'
            }}
        />
    );
});

Segment.displayName = 'Segment';

export default Segment;
