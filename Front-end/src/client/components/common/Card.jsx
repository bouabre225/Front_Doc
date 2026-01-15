    import React from 'react';
    import { motion } from 'framer-motion';

    const Card = ({ 
    children, 
    hover = true, 
    className = '',
    onClick 
    }) => {
    return (
        <motion.div
        whileHover={hover ? { y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
        className={`
            bg-white rounded-xl shadow-md overflow-hidden
            transition-all duration-300
            ${onClick ? 'cursor-pointer' : ''}
            ${className}
        `}
        onClick={onClick}
        >
        {children}
        </motion.div>
    );
    };

    export default Card;