import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, ShoppingBag, Filter
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getCommandes } from '../../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
  en_attente: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon:  Clock,
    dot:   'bg-yellow-400',
  },
  payee: {
    label: 'Payée',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon:  CheckCircle,
    dot:   'bg-blue-400',
  },
  livree: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon:  CheckCircle,
    dot:   'bg-green-400',
  },
  annulee: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon:  XCircle,
    dot:   'bg-red-400',
  },
  litige: {
    label: 'Litige',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon:  AlertCircle,
    dot:   'bg-orange-400',
  },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatPrice = (p) =>
  Number(p).toLocaleString('fr-FR') + ' FCFA';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className='bg-white rounded-2xl border border-gray-100 p-5 animate-pulse'>
    <div className='flex items-center gap-4'>
      <div className='w-14 h-14 bg-gray-200 rounded-xl shrink-0' />
      <div className='flex-1 space-y-2'>
        <div className='h-4 bg-gray-200 rounded w-2/3' />
        <div className='h-3 bg-gray-100 rounded w-1/3' />
      </div>
      <div className='w-20 h-6 bg-gray-200 rounded-full' />
    </div>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const Commandes = () => {
  const navigate    = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('tous');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [lastPage,  setLastPage]  = useState(1);

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) { navigate('/login'); return; }
    fetchCommandes();
  }, [page, filter]);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filter !== 'tous') params.statut = filter;
      const res  = await getCommandes(params);
      const data = res.data ?? res;
      setCommandes(data.data ?? []);
      setTotal(data.total ?? 0);
      setLastPage(data.last_page ?? 1);
    } catch {
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  const FILTERS = [
    { key: 'tous',        label: 'Toutes' },
    { key: 'en_attente',  label: 'En attente' },
    { key: 'payee',       label: 'Payées' },
    { key: 'livree',      label: 'Livrées' },
    { key: 'annulee',     label: 'Annulées' },
    { key: 'litige',      label: 'Litiges' },
  ];

  const isVendeur  = currentUser.role === 'vendeur';

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Header />

      {/* Hero */}
      <div className='bg-white border-b border-gray-100'>
        <div className='container px-4 py-6 mx-auto max-w-4xl'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1DBF73] transition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Retour
          </button>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Mes commandes</h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                {total} commande{total > 1 ? 's' : ''} au total
              </p>
            </div>
            <div className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl flex items-center justify-center shadow-lg'>
              <ShoppingBag className='w-6 h-6 text-white' />
            </div>
          </div>
        </div>
      </div>

      <div className='container px-4 py-8 mx-auto max-w-4xl flex-grow'>

        {/* Filtres */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide'>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                filter === f.key
                  ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className='space-y-3'>
          {loading ? (
            [1,2,3].map(i => <Skeleton key={i} />)
          ) : commandes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100'
            >
              <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4'>
                <Package className='w-8 h-8 text-gray-300' />
              </div>
              <p className='font-semibold text-gray-600 mb-1'>Aucune commande</p>
              <p className='text-sm text-gray-400 mb-6'>
                {filter === 'tous' ? 'Vous n\'avez pas encore passé de commande.' : `Aucune commande avec le statut "${STATUT_CONFIG[filter]?.label}".`}
              </p>
              {filter !== 'tous' ? (
                <button
                  onClick={() => setFilter('tous')}
                  className='px-5 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm'
                >
                  Voir toutes les commandes
                </button>
              ) : (
                <Link
                  to='/explore'
                  className='px-5 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm'
                >
                  Explorer les équipements
                </Link>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {commandes.map((commande, idx) => {
                const cfg        = STATUT_CONFIG[commande.statut] || STATUT_CONFIG.en_attente;
                const Icon       = cfg.icon;
                const interlocuteur = isVendeur ? commande.acheteur : commande.vendeur;

                return (
                  <motion.div
                    key={commande.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={`/commandes/${commande.id}`}>
                      <div className='bg-white rounded-2xl border border-gray-100 hover:border-[#1DBF73]/30 hover:shadow-md transition-all p-5 group'>
                        <div className='flex items-center gap-4'>

                          {/* Icône */}
                          <div className='w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:from-[#1DBF73]/10 group-hover:to-[#09B1BA]/10 transition-all'>
                            <Package className='w-7 h-7 text-gray-400 group-hover:text-[#1DBF73] transition-colors' />
                          </div>

                          {/* Infos */}
                          <div className='flex-1 min-w-0'>
                            <p className='font-bold text-gray-900 truncate mb-0.5'>
                              {commande.annonce?.titre ?? 'Équipement'}
                            </p>
                            <p className='text-xs text-gray-400'>
                              {isVendeur ? 'Acheteur' : 'Vendeur'} : <span className='font-medium text-gray-600'>{interlocuteur?.nom}</span>
                              {' · '}Qté : <span className='font-medium text-gray-600'>{commande.quantite}</span>
                              {' · '}{formatDate(commande.created_at)}
                            </p>
                            <p className='text-sm font-bold text-[#1DBF73] mt-1'>
                              {formatPrice(commande.montant)}
                            </p>
                          </div>

                          {/* Statut + flèche */}
                          <div className='flex flex-col items-end gap-2 shrink-0'>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                            <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-[#1DBF73] transition-colors' />
                          </div>

                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className='flex items-center justify-center gap-2 mt-8'>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className='px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'
            >
              Précédent
            </button>
            <span className='text-sm text-gray-500 px-2'>
              Page {page} / {lastPage}
            </span>
            <button
              onClick={() => setPage(p => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className='px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'
            >
              Suivant
            </button>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default Commandes;