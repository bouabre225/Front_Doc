import React from 'react';
import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { useLang } from '../../context/LangContext';

// ★ 4.5 (12) • Vendeur vérifié • Cotonou
const TrustRow = ({ note, avisCount, vendeurNom, verifie, ville, size = 'xs' }) => {
  const { t } = useLang();
  const text = size === 'sm' ? 'text-sm' : 'text-xs';
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${text} text-gray-500`}>
      {note > 0 && (
        <span className='inline-flex items-center gap-1 font-semibold text-gray-700'>
          <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' aria-hidden='true' />
          {Number(note).toFixed(1)}
          {avisCount > 0 && <span className='font-normal text-gray-400'>({avisCount})</span>}
        </span>
      )}
      {verifie && (
        <span className='inline-flex items-center gap-1 font-semibold text-[#1DBF73]'>
          <ShieldCheck className='w-3.5 h-3.5' aria-hidden='true' />
          {t.home.verified}
        </span>
      )}
      {(ville || vendeurNom) && (
        <span className='inline-flex items-center gap-1 truncate'>
          <MapPin className='w-3.5 h-3.5 text-[#1DBF73] shrink-0' aria-hidden='true' />
          <span className='truncate'>{[vendeurNom, ville].filter(Boolean).join(' • ')}</span>
        </span>
      )}
    </div>
  );
};

export default TrustRow;
