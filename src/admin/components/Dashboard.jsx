import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Stethoscope, ShoppingCart, AlertCircle,
  TrendingUp, UserCheck, Clock, RefreshCw,
  CheckCircle, XCircle, Eye
} from 'lucide-react';
import {
  getAdminLitiges, getKycPending, getAdminCommandes, getAnnonces
} from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (p) => Number(p || 0).toLocaleString('fr-FR') + ' FCFA';

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(d).toLocaleDateString('fr-FR');
};

const LITIGE_STATUT = {
  en_attente:      { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  en_cours:        { label: 'En cours',    color: 'bg-blue-100 text-blue-700'    },
  resolu:          { label: 'Résolu',      color: 'bg-green-100 text-green-700'  },
  rejete:          { label: 'Rejeté',      color: 'bg-red-100 text-red-700'      },
};

const COMMANDE_STATUT = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  payee:      { label: 'Payée',      color: 'bg-blue-100 text-blue-700'    },
  livree:     { label: 'Livrée',     color: 'bg-green-100 text-green-700'  },
  annulee:    { label: 'Annulée',    color: 'bg-red-100 text-red-700'      },
  litige:     { label: 'Litige',     color: 'bg-orange-100 text-orange-700'},
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, title, value, color, bgColor, sub, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className='p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all'
  >
    <div className='flex items-start justify-between'>
      <div>
        <p className='text-sm font-medium text-gray-500 mb-1'>{title}</p>
        {loading ? (
          <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
        ) : (
          <h3 className='text-3xl font-bold text-gray-800'>
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </h3>
        )}
        {sub && <p className='text-xs text-gray-400 mt-1'>{sub}</p>}
      </div>
      <div className='p-3 rounded-xl shrink-0' style={{ backgroundColor: bgColor }}>
        <Icon className='w-6 h-6' style={{ color }} />
      </div>
    </div>
  </motion.div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [kycPending,  setKycPending]  = useState([]);
  const [litiges,     setLitiges]     = useState([]);
  const [commandes,   setCommandes]   = useState([]);
  const [annonces,    setAnnonces]    = useState([]);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [kycRes, litigesRes, commandesRes, annoncesRes] = await Promise.allSettled([
        getKycPending(),
        getAdminLitiges(),
        getAdminCommandes({ per_page: 100 }),
        getAnnonces({ per_page: 100 }),
      ]);

      // KYC
      if (kycRes.status === 'fulfilled') {
        const d = kycRes.value;
        setKycPending(d.kyc_pending ?? d.data ?? d ?? []);
      }

      // Litiges
      if (litigesRes.status === 'fulfilled') {
        const d = litigesRes.value;
        setLitiges(d?.data?.data ?? d?.data ?? d ?? []);
      }

      // Commandes
      if (commandesRes.status === 'fulfilled') {
        const d = commandesRes.value;
        const list = d?.data?.data ?? d?.data ?? d ?? [];
        setCommandes(Array.isArray(list) ? list : []);
      }

      // Annonces
      if (annoncesRes.status === 'fulfilled') {
        const d = annoncesRes.value;
        const list = d?.data?.data ?? d?.data ?? d ?? [];
        setAnnonces(Array.isArray(list) ? list : []);
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Stats calculées ──────────────────────────────────────────────────────────
  const litigesOuverts   = litiges.filter(l => ['en_attente', 'en_cours'].includes(l.statut)).length;
  const litigesResolus   = litiges.filter(l => l.statut === 'resolu').length;
  const commandesPayees  = commandes.filter(c => c.statut === 'payee').length;
  const commandesLivrees = commandes.filter(c => c.statut === 'livree').length;
  const commandesAttente = commandes.filter(c => c.statut === 'en_attente').length;

  // ✅ Volume = payées + livrées
  const montantTotal = commandes
    .filter(c => ['payee', 'livree'].includes(c.statut))
    .reduce((sum, c) => sum + Number(c.montant || 0), 0);

  const annoncesActives = annonces.filter(a =>
    ['active', 'publiee', 'disponible'].includes(a.statut)
  ).length;

  // Dernières commandes (5)
  const dernieresCommandes = [...commandes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Derniers litiges (5)
  const derniersLitiges = [...litiges]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Tableau de bord</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Vue d'ensemble de la plateforme DocSpace
            </p>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] hover:text-[#1DBF73] transition-all'
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Alertes */}
        <div className='space-y-3 mb-6'>
          {kycPending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className='flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl'
            >
              <div className='flex items-center gap-3'>
                <UserCheck className='w-5 h-5 text-yellow-600 shrink-0' />
                <p className='text-sm font-medium text-gray-800'>
                  <span className='font-bold text-yellow-700'>{kycPending.length}</span> vendeur{kycPending.length > 1 ? 's' : ''} en attente de vérification KYC
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/kyc')}
                className='px-3 py-1.5 bg-yellow-100 text-yellow-700 font-semibold text-xs rounded-lg hover:bg-yellow-200 transition-colors shrink-0'
              >
                Traiter →
              </button>
            </motion.div>
          )}

          {litigesOuverts > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className='flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl'
            >
              <div className='flex items-center gap-3'>
                <AlertCircle className='w-5 h-5 text-red-500 shrink-0' />
                <p className='text-sm font-medium text-gray-800'>
                  <span className='font-bold text-red-600'>{litigesOuverts}</span> litige{litigesOuverts > 1 ? 's' : ''} ouvert{litigesOuverts > 1 ? 's' : ''} à traiter
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/litiges')}
                className='px-3 py-1.5 bg-red-100 text-red-600 font-semibold text-xs rounded-lg hover:bg-red-200 transition-colors shrink-0'
              >
                Traiter →
              </button>
            </motion.div>
          )}

          {commandesAttente > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className='flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl'
            >
              <div className='flex items-center gap-3'>
                <Clock className='w-5 h-5 text-blue-500 shrink-0' />
                <p className='text-sm font-medium text-gray-800'>
                  <span className='font-bold text-blue-600'>{commandesAttente}</span> commande{commandesAttente > 1 ? 's' : ''} en attente de paiement
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/commandes')}
                className='px-3 py-1.5 bg-blue-100 text-blue-600 font-semibold text-xs rounded-lg hover:bg-blue-200 transition-colors shrink-0'
              >
                Voir →
              </button>
            </motion.div>
          )}
        </div>

        {/* Stats principales */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <StatCard
            icon={UserCheck}
            title='KYC en attente'
            value={kycPending.length}
            color='#f59e0b'
            bgColor='rgba(245,158,11,0.1)'
            sub='Vendeurs à vérifier'
            loading={loading}
          />
          <StatCard
            icon={Stethoscope}
            title='Annonces'
            value={annonces.length}
            color='#09B1BA'
            bgColor='rgba(9,177,186,0.1)'
            sub={`${annoncesActives} actives`}
            loading={loading}
          />
          <StatCard
            icon={ShoppingCart}
            title='Commandes'
            value={commandes.length}
            color='#1DBF73'
            bgColor='rgba(29,191,115,0.1)'
            sub={`${commandesPayees} payées · ${commandesLivrees} livrées`}
            loading={loading}
          />
          <StatCard
            icon={AlertCircle}
            title='Litiges'
            value={litiges.length}
            color='#ef4444'
            bgColor='rgba(239,68,68,0.1)'
            sub={`${litigesOuverts} ouverts · ${litigesResolus} résolus`}
            loading={loading}
          />
        </div>

        {/* Montant total */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div className='md:col-span-1 p-6 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl shadow-lg text-white'>
            <div className='flex items-center gap-2 mb-3'>
              <TrendingUp className='w-5 h-5 opacity-80' />
              <p className='text-sm font-semibold opacity-80'>Volume des transactions</p>
            </div>
            {loading ? (
              <div className='h-9 w-32 bg-white/20 rounded animate-pulse' />
            ) : (
              <p className='text-3xl font-black'>{formatPrice(montantTotal)}</p>
            )}
            <p className='text-xs opacity-60 mt-1'>Commandes payées + livrées</p>
          </div>

          <div className='p-6 bg-white border border-gray-100 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-2 mb-3'>
              <CheckCircle className='w-5 h-5 text-green-500' />
              <p className='text-sm font-semibold text-gray-600'>Litiges résolus</p>
            </div>
            {loading ? (
              <div className='h-9 w-16 bg-gray-200 rounded animate-pulse' />
            ) : (
              <p className='text-3xl font-bold text-gray-800'>{litigesResolus}</p>
            )}
            <p className='text-xs text-gray-400 mt-1'>Sur {litiges.length} au total</p>
          </div>

          <div className='p-6 bg-white border border-gray-100 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-2 mb-3'>
              <Users className='w-5 h-5 text-[#09B1BA]' />
              <p className='text-sm font-semibold text-gray-600'>KYC traités</p>
            </div>
            {loading ? (
              <div className='h-9 w-16 bg-gray-200 rounded animate-pulse' />
            ) : (
              <p className='text-3xl font-bold text-gray-800'>{kycPending.length}</p>
            )}
            <p className='text-xs text-gray-400 mt-1'>En attente de décision</p>
          </div>
        </div>

        {/* Tables */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

          {/* Dernières commandes */}
          <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <h3 className='text-base font-bold text-gray-800'>Dernières commandes</h3>
              <button
                onClick={() => navigate('/admin/commandes')}
                className='text-xs font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'
              >
                Voir tout →
              </button>
            </div>
            <div className='divide-y divide-gray-50'>
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className='px-6 py-4 animate-pulse flex items-center gap-3'>
                    <div className='h-4 bg-gray-200 rounded flex-1' />
                    <div className='h-4 bg-gray-100 rounded w-20' />
                  </div>
                ))
              ) : dernieresCommandes.length === 0 ? (
                <div className='px-6 py-8 text-center text-sm text-gray-400'>Aucune commande</div>
              ) : (
                dernieresCommandes.map(c => {
                  const cfg = COMMANDE_STATUT[c.statut] || COMMANDE_STATUT.en_attente;
                  return (
                    <div key={c.id} className='px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-gray-800 truncate'>
                          {c.annonce?.titre ?? 'Équipement'}
                        </p>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {c.acheteur?.nom} → {c.vendeur?.nom} · {timeAgo(c.created_at)}
                        </p>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='text-sm font-bold text-[#1DBF73]'>{formatPrice(c.montant)}</p>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mt-0.5 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Derniers litiges */}
          <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <h3 className='text-base font-bold text-gray-800'>Derniers litiges</h3>
              <button
                onClick={() => navigate('/admin/litiges')}
                className='text-xs font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'
              >
                Voir tout →
              </button>
            </div>
            <div className='divide-y divide-gray-50'>
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className='px-6 py-4 animate-pulse flex items-center gap-3'>
                    <div className='h-4 bg-gray-200 rounded flex-1' />
                    <div className='h-4 bg-gray-100 rounded w-20' />
                  </div>
                ))
              ) : derniersLitiges.length === 0 ? (
                <div className='px-6 py-8 text-center text-sm text-gray-400'>Aucun litige</div>
              ) : (
                derniersLitiges.map(l => {
                  const cfg = LITIGE_STATUT[l.statut] || LITIGE_STATUT.en_attente;
                  return (
                    <div key={l.id} className='px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-gray-800 truncate'>
                          {l.commande?.annonce?.titre ?? 'Commande'}
                        </p>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {l.commande?.acheteur?.nom} · {l.motif} · {timeAgo(l.created_at)}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <button
                          onClick={() => navigate('/admin/litiges')}
                          className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                          <Eye className='w-3.5 h-3.5 text-gray-400' />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}