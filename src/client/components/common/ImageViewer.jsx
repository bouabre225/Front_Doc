// src/components/common/ImageViewer.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../../../services/api';

const ImageViewer = ({ images, initialIndex = 0, titre = '', onClose }) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    // Empêche le scroll du body
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') setCurrent(i => Math.min(images.length - 1, i + 1));
      if (e.key === 'ArrowLeft')  setCurrent(i => Math.max(0, i - 1));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

    const clickHandler = (e) => {
        e.stopPropagation();
        onClose();
    };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={clickHandler}
        className='fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4'
      >
        {/* Fermer */}
        <button
          onClick={clickHandler}
          className='absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all z-10'
        >
          <X className='w-5 h-5 text-white' />
        </button>

        {/* Compteur */}
        <div className='absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-sm font-medium'>
          {current + 1} / {images.length}
        </div>

        {/* Image */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className='relative w-full max-w-4xl flex items-center justify-center'
        >
          <img
            src={getImageUrl(images[current]?.image_url ?? images[current])}
            alt={`${titre} - ${current + 1}`}
            className='max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl'
          />

          {current > 0 && (
            <button
              type='button'
              onClick={e => { e.stopPropagation(); setCurrent(i => i - 1); }}
              className='absolute left-2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all backdrop-blur-sm'
            >
              <ChevronLeft className='w-6 h-6 text-white' />
            </button>
          )}

          {current < images.length - 1 && (
            <button
              type='button'
              onClick={e => { e.stopPropagation(); setCurrent(i => i + 1); }}
              className='absolute right-2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all backdrop-blur-sm'
            >
              <ChevronRight className='w-6 h-6 text-white' />
            </button>
          )}
        </motion.div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div
            onClick={e => e.stopPropagation()}
            className='flex gap-2 mt-4 overflow-x-auto max-w-full px-4 pb-2'
          >
            {images.map((img, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setCurrent(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? 'border-[#1DBF73] opacity-100 scale-105'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={getImageUrl(img?.image_url ?? img)}
                  alt=''
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        )}

        {titre && (
          <p className='mt-3 text-white/60 text-sm text-center max-w-md truncate px-4'>
            {titre}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;