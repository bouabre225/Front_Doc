import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, RefreshCw, Eye, AlertCircle,
  CheckCircle, ChevronLeft, ChevronRight, Calendar,
  User, Package, Info
} from 'lucide-react';
import { getAdminCommandes } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (p) => Number(p || 0).toLocaleString('fr-FR') + ' FCFA';

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const STATUT_CONFIG = {
  en_attente: { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  payee:      { label: 'Payée',       color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400'   },
  livree:     { label: 'Livrée',      color: 'bg-green-100 text-green-700',   dot: 'bg-green-400'  },
  annulee:    { label: 'Annulée',     color: 'bg-red-100 text-red-600',       dot: 'bg-red-400'    },
  litige:     { label: 'Litige',      color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminCommandes() {
  const navigate = useNavigate();

  const [commandes,  setCommandes]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('tous');
  const [page,       setPage]       = useState(1);
  const [lastPage,   setLastPage]   = useState(1);
  const [total,      setTotal]      = useState(0);
  const [error,      setError]      = useState('');

  const fetchCommandes = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, per_page: 20 };
      if (filter !== 'tous') params.statut = filter;

      const res  = await getAdminCommandes(params);
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      setCommandes(Array.isArray(data) ? data : []);
      setLastPage(res?.data?.last_page ?? res?.last_page ?? 1);
      setTotal(res?.data?.total ?? res?.total ?? 0);
      setPage(p);
    } catch {
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchCommandes(1); }, [filter]);

  const FILTERS = [
    { key: 'tous',       label: 'Toutes'      },
    { key: 'en_attente', label: 'En attente'  },
    { key: 'payee',      label: 'Payées'      },
    { key: 'livree',     label: 'Livrées'     },
    { key: 'annulee',    label: 'Annulées'    },
    { key: 'litige',     label: 'Litiges'     },
  ];

  // Filtre local par search
  const filtered = commandes.filter(c =>
    !search ||
    c.annonce?.titre?.toLowerCase().includes(search.toLowerCase()) ||
    c.acheteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.vendeur?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats rapides
  const stats = {
    total:      commandes.length,
    en_attente: commandes.filter(c => c.statut === 'en_attente').length,
    payee:      commandes.filter(c => c.statut === 'payee').length,
    litige:     commandes.filter(c => c.statut === 'litige').length,
  };

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Commandes</h1>
            <p className='text-sm text-gray-500 mt-0.5'>{total} commande{total > 1 ? 's' : ''} au total</p>
          </div>
          <button onClick={() => fetchCommandes(page)} disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] hover:text-[#1DBF73] transition-all'>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Stats rapides */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6'>
          {[
            { label: 'Total',      value: stats.total,      color: 'text-gray-800',   bg: 'bg-gray-50'    },
            { label: 'En attente', value: stats.en_attente, color: 'text-yellow-700', bg: 'bg-yellow-50'  },
            { label: 'Payées',     value: stats.payee,      color: 'text-blue-700',   bg: 'bg-blue-50'    },
            { label: 'Litiges',    value: stats.litige,     color: 'text-orange-700', bg: 'bg-orange-50'  },
          ].map(s => (
            <div key={s.label} className={`p-4 ${s.bg} rounded-xl border border-gray-100 text-center`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className='text-xs text-gray-500 mt-0.5'>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'>
              <AlertCircle className='w-4 h-4 shrink-0' />{error}
            </motion.div>
          )}
        </AnimatePresence>
  
        {/* Search + Filtres */}
        <div className='flex flex-col sm:flex-row gap-3 mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input type='text' value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher par annonce, acheteur, vendeur...'
              className='w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all' />
          </div>
          <div className='flex gap-2 overflow-x-auto'>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
          {/* Header table */}
          <div className='hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider'>
            <div className='col-span-4'>Annonce</div>
            <div className='col-span-2'>Acheteur</div>
            <div className='col-span-2'>Vendeur</div>
            <div className='col-span-1'>Montant</div>
            <div className='col-span-2'>Statut</div>
            <div className='col-span-1'>Action</div>
          </div>

          {loading ? (
            <div className='divide-y divide-gray-50'>
              {[1,2,3,4,5].map(i => (
                <div key={i} className='px-5 py-4 animate-pulse flex gap-4'>
                  <div className='h-4 bg-gray-200 rounded flex-1' />
                  <div className='h-4 bg-gray-100 rounded w-24' />
                  <div className='h-4 bg-gray-100 rounded w-20' />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <ShoppingCart className='w-12 h-12 text-gray-200 mb-3' />
              <p className='text-sm text-gray-400 font-medium'>Aucune commande</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-50'>
              {filtered.map(c => {
                const cfg = STATUT_CONFIG[c.statut] || STATUT_CONFIG.en_attente;
                return (
                  <div key={c.id}
                    className='grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-gray-50 transition-colors items-center'>

                    {/* Annonce */}
                    <div className='md:col-span-4'>
                      <p className='font-semibold text-gray-900 text-sm truncate'>
                        {c.annonce?.titre ?? 'Équipement'}
                      </p>
                      <p className='text-xs text-gray-400 mt-0.5 flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {formatDate(c.created_at)}
                      </p>
                    </div>

                    {/* Acheteur */}
                    <div className='md:col-span-2'>
                      <p className='text-sm text-gray-700 font-medium truncate flex items-center gap-1'>
                        <User className='w-3 h-3 text-gray-400 shrink-0' />
                        {c.acheteur?.nom ?? '—'}
                      </p>
                    </div>

                    {/* Vendeur */}
                    <div className='md:col-span-2'>
                      <p className='text-sm text-gray-700 font-medium truncate flex items-center gap-1'>
                        <Package className='w-3 h-3 text-gray-400 shrink-0' />
                        {c.vendeur?.nom ?? '—'}
                      </p>
                    </div>

                    {/* Montant */}
                    <div className='md:col-span-1'>
                      <p className='text-sm font-bold text-[#1DBF73]'>{formatPrice(c.montant)}</p>
                    </div>

                    {/* Statut */}
                    <div className='md:col-span-2'>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Action */}
                    <div className='md:col-span-1'>
                      <button
                        onClick={() => navigate(`/commandes/${c.id}`)}
                        className='p-2 hover:bg-[#1DBF73]/10 rounded-xl transition-colors group'
                        title='Voir le détail'
                      >
                        <Eye className='w-4 h-4 text-gray-400 group-hover:text-[#1DBF73] transition-colors' />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className='flex items-center justify-center gap-3 mt-6'>
            <button onClick={() => fetchCommandes(page - 1)} disabled={page <= 1 || loading}
              className='flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
              <ChevronLeft className='w-4 h-4' /> Précédent
            </button>
            <span className='text-sm text-gray-500 font-medium'>Page {page} / {lastPage}</span>
            <button onClick={() => fetchCommandes(page + 1)} disabled={page >= lastPage || loading}
              className='flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
              Suivant <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}