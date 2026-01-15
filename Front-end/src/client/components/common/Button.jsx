    import React from 'react';
    import { motion } from 'framer-motion';

    const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    icon: Icon,
    onClick,
    className = '',
    ...props 
    }) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white hover:shadow-lg hover:scale-105',
        secondary: 'bg-white border-2 border-[#1DBF73] text-[#1DBF73] hover:bg-[#1DBF73] hover:text-white',
        outline: 'border-2 border-gray-300 text-gray-700 hover:border-[#09B1BA] hover:text-[#09B1BA]',
        ghost: 'text-gray-700 hover:bg-gray-100'
    };
    
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };
    
    return (
        <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        {...props}
        >
        {Icon && <Icon className='w-5 h-5' />}
        {children}
        </motion.button>
    );
    };

    export default Button;