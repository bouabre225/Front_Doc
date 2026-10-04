import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react';

const ICONS = {
  danger: { Icon: Trash2, bg: 'bg-red-100', color: 'text-red-500', btn: 'bg-red-500 hover:bg-red-600' },
  warning: { Icon: AlertTriangle, bg: 'bg-yellow-100', color: 'text-yellow-500', btn: 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]' },
  success: { Icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-500', btn: 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]' },
  info: { Icon: Info, bg: 'bg-blue-100', color: 'text-blue-500', btn: 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]' },
};

// Popup de confirmation réutilisable (remplace window.confirm)
const ConfirmDialog = ({
  open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler',
  tone = 'warning', loading = false, onConfirm, onCancel,
}) => {
  if (!open) return null;
  const { Icon, bg, color, btn } = ICONS[tone] || ICONS.warning;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className='bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6'
        >
          <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <h3 className='text-lg font-bold text-gray-900 text-center mb-2'>{title}</h3>
          {message && <p className='text-sm text-gray-500 text-center mb-5'>{message}</p>}
          <div className='flex gap-3'>
            <button onClick={onCancel} disabled={loading} className='flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm disabled:opacity-50'>
              {cancelLabel}
            </button>
            <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 ${btn} text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2`}>
              {loading && <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
