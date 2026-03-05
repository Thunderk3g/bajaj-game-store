import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    fullWidth = false,
    size = 'md'
}) => {
    const variants = {
        primary: 'bg-gold text-bg font-bold shadow-[0_0_15px_rgba(245,200,66,0.5)]',
        secondary: 'bg-teal/20 text-teal border border-teal/50 hover:bg-teal/30',
        outline: 'bg-transparent text-white border border-white/30 hover:bg-white/10',
        ghost: 'bg-transparent text-white hover:bg-white/5',
        danger: 'bg-risk text-white font-bold',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            onClick={disabled ? undefined : onClick}
            className={`
        relative overflow-hidden rounded-xl transition-all duration-300
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            disabled={disabled}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </motion.button>
    );
};

export default Button;
