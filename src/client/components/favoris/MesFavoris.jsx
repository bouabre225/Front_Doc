import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, RefreshCw } from 'lucide-react';
import { getFavoris, toggleFavori, getImageUrl, parseList } from '../../../services/api';
import { useLang } from '../../context/LangContext';
import { getLocale } from '../../i18n/format';

const fmt = (n) => Number(n || 0).toLocaleString(getLocale());

export default function MesFavoris() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavoris = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getFavoris();
      const raw = res?.data?.data ?? res?.data ?? res;
      setItems(parseList(raw, ['data']));
    } catch (e) {
      setError(e.message || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavoris(); }, [fetchFavoris]);

  const retirer = async (annonceId) => {
    setItems((prev) => prev.filter((f) => (f.annonce?.id || f.annonce_id) !== annonceId));
    try { await toggleFavori(annonceId); } catch { fetchFavoris(); }
  };

  if (loading) {
    return <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse'>{[1, 2, 3, 4].map((i) => <div key={i} className='h-32 bg-white border border-gray-100 rounded-2xl' />)}</div>;
  }
  if (error) return <div className='p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>{error}</div>;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
          <Heart className='w-5 h-5 fill-red-500 text-red-500' /> {t.profil.tabs.favoris} ({items.length})
        </h3>
        <button onClick={fetchFavoris} className='p-2 text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl'>
          <RefreshCw className='w-4 h-4' />
        </button>
      </div>
      {items.length === 0 ? (
        <div className='py-16 text-center bg-white border border-gray-100 rounded-2xl'>
          <Heart className='w-12 h-12 mx-auto mb-3 text-gray-200' />
          <p className='font-semibold text-gray-600'>{t.favoris.empty}</p>
          <p className='text-sm text-gray-400 mt-1'>{t.favoris.emptyHint}</p>
          <Link to='/explore' className='inline-block mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl'>{t.cart.explore}</Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {items.map((f) => {
            const a = f.annonce || {};
            const id = a.id || f.annonce_id;
            return (
              <div key={f.id || id} className='flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all'>
                <Link to={`/equipment/${id}`} className='w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0'>
                  {a.images?.[0] ? <img src={getImageUrl(a.images[0]?.image_url ?? a.images[0])} alt={a.titre} className='w-full h-full object-cover' /> : <div className='w-full h-full flex items-center justify-center text-2xl'>🏥</div>}
                </Link>
                <div className='flex-1 min-w-0'>
                  <Link to={`/equipment/${id}`} className='font-semibold text-sm text-gray-900 line-clamp-2'>{a.titre || 'Annonce'}</Link>
                  <p className='text-sm font-bold text-[#1DBF73] mt-1'>{a.prix_total != null ? `${fmt(a.prix_total)} FCFA` : ''}</p>
                  <p className='text-xs text-gray-400'>{a.vendeur?.nom || ''}</p>
                </div>
                <button onClick={() => retirer(id)} title='Retirer' className='self-start p-2 text-gray-300 hover:text-red-500 transition-colors'>
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
