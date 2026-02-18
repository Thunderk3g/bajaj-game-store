import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20',
        secondary: 'bg-accent-orange text-white hover:bg-accent-darkOrange shadow-lg shadow-accent-orange/20',
        outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
        ghost: 'bg-transparent hover:bg-slate-50 text-slate-600',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});

Button.displayName = 'Button';

export { Button };
