import React from 'react';
import { Heart } from 'lucide-react';
import { useLang } from '../../context/LangContext';

// Bouton cœur accessible : toujours visible sur tactile,
// hover-reveal sur desktop, 44px, aria-pressed.
const FavoriteButton = ({
  active, onToggle, size = 'md', className = '',
}) => {
  const { t } = useLang();
  const dims = size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const icon = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type='button'
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle?.(); }}
      aria-pressed={!!active}
      aria-label={t.favoris.toggle}
      title={t.favoris.toggle}
      className={`${dims} shrink-0 flex items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DBF73] focus-visible:ring-offset-2 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 focus:opacity-100 ${active ? '!opacity-100' : ''} ${className}`}
    >
      <Heart className={`${icon} transition-colors ${active ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
    </button>
  );
};

export default FavoriteButton;
