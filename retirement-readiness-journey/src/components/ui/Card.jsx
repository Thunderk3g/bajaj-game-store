import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'bg-white border-2 border-slate-50 rounded-[1.5rem] p-8 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export { Card };
