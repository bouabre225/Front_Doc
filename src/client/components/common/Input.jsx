    import React from 'react';
    import { motion } from 'framer-motion';
import { useLang } from '../../context/LangContext';

    const Input = ({ 
    label, 
    icon: Icon, 
    error, 
    className = '',
    ...props 
    }) => {
    return (
        <div className='w-full'>
        {label && (
            <label className='block text-sm font-medium text-gray-700 mb-2'>
            {label}
            </label>
        )}
        <div className='relative'>
            {Icon && (
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                <Icon className='w-5 h-5' />
            </div>
            )}
            <motion.input
            whileFocus={{ scale: 1.01 }}
            className={`
                w-full px-4 py-3 ${Icon ? 'pl-12' : ''} 
                border-2 border-gray-200 rounded-lg
                focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20
                transition-all duration-300
                ${error ? 'border-red-500' : ''}
                ${className}
            `}
            {...props}
            />
        </div>
        {error && (
            <p className='mt-1 text-sm text-red-500'>{error}</p>
        )}
        </div>
    );
    };

    export default Input;