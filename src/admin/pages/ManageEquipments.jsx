import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, CheckCircle, XCircle, Filter, RefreshCw, MapPin, Package } from 'lucide-react';

const API_URL = 'https://medi-kado.com/api';
const getToken = () => localStorage.getItem('admin_token') || localStorage.getItem('auth_token');

export default function ManageEquipments() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEtat, setFilterEtat] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchAnnonces(); }, [page, search]);

  const fetchAnnonces = async () => {
    setLoading(true);
    try {
      const url = search
        ? `${API_URL}/annonces/search?q=${encodeURIComponent(search)}&page=${page}`
        : `${API_URL}/annonces?page=${page}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAnnonces(data.data || []);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      }
    } catch {
      // fallback vide
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/annonces/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setAnnonces(prev => prev.filter(a => a.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filterEtat
    ? annonces.filter(a => a.etat === filterEtat)
    : annonces;

  const etatStyle = (etat) => {
    if (etat === 'Neuf') return 'bg-emerald-100 text-emerald-700';
    if (etat === 'Occasion') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className='min-h-full p-4 sm:p-6 bg-gray-50'>
      <div className='mx-auto max-w-7xl'>

        {/* En-tête */}
        <div className='flex flex-col justify-between gap-3 mb-6 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-xl font-bold text-gray-800'>Gestion des équipements</h1>
            <p className='text-sm text-gray-500 mt-0.5'>{total} équipement(s) au total</p>
          </div>
          <button onClick={fetchAnnonces}
            className='flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl hover:shadow-md transition-all self-start sm:self-auto'>
            <RefreshCw className='w-4 h-4' />
            Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className='flex flex-col gap-3 mb-5 sm:flex-row'>
          <div className='relative flex-1'>
            <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
            <input type='text' value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder='Rechercher un équipement...'
              className='w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] bg-white' />
          </div>
          <div className='relative'>
            <Filter className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
            <select value={filterEtat} onChange={(e) => setFilterEtat(e.target.value)}
              className='pl-9 pr-8 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] bg-white appearance-none cursor-pointer'>
              <option value=''>Tous les états</option>
              <option value='Neuf'>Neuf</option>
              <option value='Occasion'>Occasion</option>
              <option value='Reconditionné'>Reconditionné</option>
              <option value='Comme neuf'>Comme neuf</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl'>
          {loading ? (
            <div className='flex justify-center py-20'>
              <div className='w-8 h-8 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <Package className='w-12 h-12 mb-3 text-gray-200' />
              <p className='font-medium text-gray-500'>Aucun équipement trouvé</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className='hidden overflow-x-auto sm:block'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-100 bg-gray-50'>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Équipement</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Vendeur</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Catégorie</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>État</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Prix</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filtered.map((a) => (
                      <tr key={a.id} className='transition-colors hover:bg-gray-50'>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-xl'>
                              {a.images?.[0] ? (
                                <img src={`http://localhost:8000/storage/${a.images[0].image_url}`}
                                  alt='' className='object-cover w-full h-full' />
                              ) : (
                                <div className='flex items-center justify-center w-full h-full text-lg'>🏥</div>
                              )}
                            </div>
                            <div className='min-w-0'>
                              <p className='text-sm font-semibold text-gray-800 truncate max-w-[180px]'>{a.titre}</p>
                              <p className='text-xs text-gray-400'>#{a.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <p className='text-sm text-gray-700'>{a.vendeur?.nom || '—'}</p>
                        </td>
                        <td className='px-4 py-3'>
                          <p className='text-sm text-gray-600'>{a.categorie || '—'}</p>
                        </td>
                        <td className='px-4 py-3'>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${etatStyle(a.etat)}`}>
                            {a.etat}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <p className='text-sm font-bold text-[#1DBF73]'>
                            {Number(a.prix_vendeur).toLocaleString()} FCFA
                          </p>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-2'>
                            <a href={`/equipment/${a.id}`} target='_blank' rel='noreferrer'
                              className='p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors'>
                              <Eye className='w-4 h-4 text-blue-600' />
                            </a>
                            <button onClick={() => handleDelete(a.id)}
                              disabled={actionLoading === a.id}
                              className='p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50'>
                              {actionLoading === a.id
                                ? <div className='w-4 h-4 border-2 border-red-400 rounded-full border-t-transparent animate-spin' />
                                : <Trash2 className='w-4 h-4 text-red-500' />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className='divide-y sm:hidden divide-gray-50'>
                {filtered.map((a) => (
                  <div key={a.id} className='p-4 transition-colors hover:bg-gray-50'>
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-100 rounded-xl'>
                        {a.images?.[0] ? (
                          <img src={`http://localhost:8000/storage/${a.images[0].image_url}`}
                            alt='' className='object-cover w-full h-full' />
                        ) : (
                          <div className='flex items-center justify-center w-full h-full text-xl'>🏥</div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-gray-800 truncate'>{a.titre}</p>
                        <p className='text-xs text-gray-400 mt-0.5'>{a.categorie} · {a.vendeur?.nom}</p>
                        <div className='flex items-center justify-between mt-2'>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${etatStyle(a.etat)}`}>
                            {a.etat}
                          </span>
                          <p className='text-sm font-bold text-[#1DBF73]'>
                            {Number(a.prix_vendeur).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col gap-1.5'>
                        <a href={`/equipment/${a.id}`} target='_blank' rel='noreferrer'
                          className='p-1.5 rounded-lg bg-blue-50'>
                          <Eye className='w-4 h-4 text-blue-600' />
                        </a>
                        <button onClick={() => handleDelete(a.id)} disabled={actionLoading === a.id}
                          className='p-1.5 rounded-lg bg-red-50 disabled:opacity-50'>
                          {actionLoading === a.id
                            ? <div className='w-4 h-4 border-2 border-red-400 rounded-full border-t-transparent animate-spin' />
                            : <Trash2 className='w-4 h-4 text-red-500' />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className='flex items-center justify-between px-4 py-3 border-t border-gray-100'>
              <p className='text-xs text-gray-500'>Page {page} sur {lastPage}</p>
              <div className='flex gap-2'>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className='px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-all'>
                  Précédent
                </button>
                <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                  className='px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-lg disabled:opacity-40 transition-all'>
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}