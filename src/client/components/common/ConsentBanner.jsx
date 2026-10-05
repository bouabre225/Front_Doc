import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useLang } from '../../context/LangContext';

export default function ConsentBanner() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('docspace_tracking')) setVisible(true);
    } catch { /* ignore */ }
  }, []);

  const choisir = (valeur) => {
    try { localStorage.setItem('docspace_tracking', valeur); } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          className='fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 p-4 bg-white border border-gray-200 rounded-2xl shadow-2xl'
        >
          <div className='flex items-start gap-3'>
            <div className='w-9 h-9 bg-[#1DBF73]/10 rounded-xl flex items-center justify-center shrink-0'>
              <Cookie className='w-4 h-4 text-[#1DBF73]' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-bold text-gray-900'>{t.consent.title}</p>
              <p className='text-xs text-gray-500 mt-0.5'>{t.consent.text}</p>
              <div className='flex gap-2 mt-3'>
                <button onClick={() => choisir('accepte')} className='flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl'>{t.consent.accept}</button>
                <button onClick={() => choisir('refuse')} className='flex-1 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50'>{t.consent.decline}</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
