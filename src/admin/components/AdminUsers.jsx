import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, AlertCircle, CheckCircle,
  Mail, Phone, MapPin, Shield, Star, Package,
  UserCheck, UserX, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Trash2, Ban, Play
} from 'lucide-react';
import { getAdminUsers, suspendUser, reactivateUser, deleteAdminUser } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const getInitials = (nom) =>
  nom?.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

// ─── Modal confirmation ───────────────────────────────────────────────────────

const ConfirmModal = ({ type, user, onConfirm, onCancel, loading }) => {
  const config = {
    suspend:    { icon: Ban,    color: 'bg-orange-100', iconColor: 'text-orange-500', btn: 'bg-orange-500 hover:bg-orange-600', label: 'Suspendre',   msg: `Le compte de ${user.nom} sera suspendu. Il ne pourra plus se connecter.` },
    reactivate: { icon: Play,   color: 'bg-green-100',  iconColor: 'text-green-500',  btn: 'bg-green-500 hover:bg-green-600',   label: 'Réactiver',   msg: `Le compte de ${user.nom} sera réactivé.` },
    delete:     { icon: Trash2, color: 'bg-red-100',    iconColor: 'text-red-500',    btn: 'bg-red-500 hover:bg-red-600',       label: 'Supprimer',   msg: `Le compte de ${user.nom} sera définitivement supprimé. Cette action est irréversible.` },
  }[type];

  const Icon = config.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className='bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6'>
        <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <h3 className='text-lg font-bold text-gray-900 text-center mb-2'>{config.label} l'utilisateur ?</h3>
        <p className='text-sm text-gray-500 text-center mb-5'>{config.msg}</p>
        <div className='flex gap-3'>
          <button onClick={onCancel} disabled={loading}
            className='flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-all disabled:opacity-50'>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 ${config.btn} text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50`}>
            {loading ? 'En cours...' : config.label}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Carte utilisateur ────────────────────────────────────────────────────────

const UserCard = ({ user, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const isVendeur  = user.role === 'vendeur';
  const isSuspendu = user.statut === 'suspendu';

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden ${isSuspendu ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>

      <div className='flex items-center gap-4 p-5'>
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm bg-gradient-to-br ${
          isSuspendu ? 'from-gray-400 to-gray-500' :
          isVendeur  ? 'from-[#1DBF73] to-[#09B1BA]' : 'from-[#09B1BA] to-[#1DBF73]'
        }`}>
          {getInitials(user.nom)}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='font-bold text-gray-900 truncate'>{user.nom}</p>
            {user.verifie_kyc   && <CheckCircle className='w-4 h-4 text-green-500 shrink-0' title='KYC vérifié' />}
            {user.badge_verifie && <Shield className='w-4 h-4 text-blue-500 shrink-0' title='Badge vérifié' />}
          </div>
          <p className='text-xs text-gray-400 truncate'>{user.email}</p>
          <div className='flex items-center gap-2 mt-1 flex-wrap'>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              isVendeur ? 'bg-[#09B1BA]/10 text-[#09B1BA]' : 'bg-[#1DBF73]/10 text-[#1DBF73]'
            }`}>
              {isVendeur ? 'Vendeur' : 'Acheteur'}
            </span>
            <span className='px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 capitalize'>
              {user.type_compte}
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              isSuspendu ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'
            }`}>
              {isSuspendu ? 'Suspendu' : 'Actif'}
            </span>
          </div>
        </div>

        {/* Actions rapides */}
        <div className='flex items-center gap-1 shrink-0'>
          {isSuspendu ? (
            <button onClick={() => onAction('reactivate', user)} title='Réactiver'
              className='p-2 hover:bg-green-50 rounded-xl transition-colors group'>
              <Play className='w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors' />
            </button>
          ) : (
            <button onClick={() => onAction('suspend', user)} title='Suspendre'
              className='p-2 hover:bg-orange-50 rounded-xl transition-colors group'>
              <Ban className='w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors' />
            </button>
          )}
          <button onClick={() => onAction('delete', user)} title='Supprimer'
            className='p-2 hover:bg-red-50 rounded-xl transition-colors group'>
            <Trash2 className='w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors' />
          </button>
          <button onClick={() => setExpanded(!expanded)}
            className='p-2 hover:bg-gray-100 rounded-xl transition-colors'>
            {expanded ? <ChevronUp className='w-4 h-4 text-gray-400' /> : <ChevronDown className='w-4 h-4 text-gray-400' />}
          </button>
        </div>
      </div>

      {/* Détails expandables */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className='overflow-hidden'>
            <div className='px-5 pb-5 border-t border-gray-100 pt-4'>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  { icon: Mail,    label: 'Email',      value: user.email },
                  { icon: Phone,   label: 'Téléphone',  value: user.telephone || '—' },
                  { icon: MapPin,  label: 'Pays',       value: user.pays     || '—' },
                  { icon: MapPin,  label: 'Adresse',    value: user.adresse  || '—' },
                  { icon: Package, label: 'Inscrit le', value: formatDate(user.created_at) },
                  { icon: Star,    label: 'Note',       value: Number(user.note_moyenne) > 0 ? `${Number(user.note_moyenne).toFixed(1)}/5` : 'Aucune note' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className='flex items-start gap-2 p-3 bg-gray-50 rounded-xl'>
                    <Icon className='w-4 h-4 text-[#1DBF73] mt-0.5 shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-[10px] text-gray-400 font-medium'>{label}</p>
                      <p className='text-sm font-semibold text-gray-800 truncate'>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex flex-wrap gap-2 mt-3'>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  user.verifie_kyc ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {user.verifie_kyc
                    ? <><UserCheck className='w-3.5 h-3.5' /> KYC vérifié</>
                    : <><UserX className='w-3.5 h-3.5' /> KYC non vérifié</>
                  }
                </div>
                {user.badge_verifie && (
                  <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700'>
                    <Shield className='w-3.5 h-3.5' /> Badge vérifié
                  </div>
                )}
                {user.two_factor_enable_at && (
                  <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700'>
                    <Shield className='w-3.5 h-3.5' /> 2FA activé
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('tous');
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total,    setTotal]    = useState(0);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // Modal confirmation
  const [confirm,  setConfirm]  = useState(null); // { type, user }
  const [actLoading, setActLoading] = useState(false);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminUsers({ page: p, per_page: 30 });
      setUsers(res?.data?.data ?? res?.data ?? []);
      setLastPage(res?.data?.last_page ?? 1);
      setTotal(res?.data?.total ?? 0);
      setPage(p);
    } catch {
      setError('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleAction = (type, user) => setConfirm({ type, user });

  const handleConfirm = async () => {
    if (!confirm) return;
    setActLoading(true);
    const { type, user } = confirm;
    try {
      if (type === 'suspend') {
        await suspendUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, statut: 'suspendu' } : u));
        setSuccess(`${user.nom} a été suspendu.`);
      } else if (type === 'reactivate') {
        await reactivateUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, statut: 'actif' } : u));
        setSuccess(`${user.nom} a été réactivé.`);
      } else if (type === 'delete') {
        await deleteAdminUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setTotal(prev => prev - 1);
        setSuccess(`${user.nom} a été supprimé.`);
      }
      setConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
      setConfirm(null);
    } finally {
      setActLoading(false);
    }
  };

  const FILTERS = [
    { key: 'tous',        label: 'Tous'            },
    { key: 'vendeur',     label: 'Vendeurs'        },
    { key: 'acheteur',    label: 'Acheteurs'       },
    { key: 'verifie',     label: 'KYC vérifié'     },
    { key: 'non_verifie', label: 'KYC non vérifié' },
    { key: 'suspendu',    label: 'Suspendus'       },
  ];

  const filtered = users.filter(u => {
    const matchFilter =
      filter === 'tous'        ||
      (filter === 'vendeur'     && u.role === 'vendeur')   ||
      (filter === 'acheteur'    && u.role === 'acheteur')  ||
      (filter === 'verifie'     && u.verifie_kyc)          ||
      (filter === 'non_verifie' && !u.verifie_kyc)         ||
      (filter === 'suspendu'    && u.statut === 'suspendu');
    const matchSearch =
      !search ||
      u.nom?.toLowerCase().includes(search.toLowerCase())   ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.pays?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total:     users.length,
    vendeurs:  users.filter(u => u.role === 'vendeur').length,
    acheteurs: users.filter(u => u.role === 'acheteur').length,
    suspendus: users.filter(u => u.statut === 'suspendu').length,
  };

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Utilisateurs</h1>
            <p className='text-sm text-gray-500 mt-0.5'>{total} utilisateur{total > 1 ? 's' : ''} au total</p>
          </div>
          <button onClick={() => fetchUsers(page)} disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] hover:text-[#1DBF73] transition-all'>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6'>
          {[
            { label: 'Total',     value: stats.total,     color: 'text-gray-800',  bg: 'bg-white'       },
            { label: 'Vendeurs',  value: stats.vendeurs,  color: 'text-[#09B1BA]', bg: 'bg-[#09B1BA]/5' },
            { label: 'Acheteurs', value: stats.acheteurs, color: 'text-[#1DBF73]', bg: 'bg-[#1DBF73]/5' },
            { label: 'Suspendus', value: stats.suspendus, color: 'text-orange-600', bg: 'bg-orange-50'  },
          ].map(s => (
            <div key={s.label} className={`p-4 ${s.bg} border border-gray-100 rounded-xl text-center shadow-sm`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className='text-xs text-gray-400 mt-0.5'>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alertes */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700'>
              <CheckCircle className='w-4 h-4 shrink-0' />{success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'>
              <AlertCircle className='w-4 h-4 shrink-0' />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filtres */}
        <div className='flex flex-col sm:flex-row gap-3 mb-5'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input type='text' value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher par nom, email, pays...'
              className='w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all' />
          </div>
          <div className='flex gap-2 overflow-x-auto'>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
                }`}>{f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className='space-y-3'>
            {[1,2,3,4,5].map(i => (
              <div key={i} className='bg-white rounded-2xl border border-gray-100 p-5 animate-pulse'>
                <div className='flex items-center gap-4'>
                  <div className='w-11 h-11 bg-gray-200 rounded-xl shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-1/3' />
                    <div className='h-3 bg-gray-100 rounded w-1/2' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100'>
            <Users className='w-12 h-12 text-gray-200 mb-3' />
            <p className='text-sm text-gray-400 font-medium'>Aucun utilisateur trouvé</p>
          </motion.div>
        ) : (
          <div className='space-y-3'>
            <AnimatePresence>
              {filtered.map(user => (
                <UserCard key={user.id} user={user} onAction={handleAction} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className='flex items-center justify-center gap-3 mt-6'>
            <button onClick={() => fetchUsers(page - 1)} disabled={page <= 1 || loading}
              className='flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
              <ChevronLeft className='w-4 h-4' /> Précédent
            </button>
            <span className='text-sm text-gray-500 font-medium'>Page {page} / {lastPage}</span>
            <button onClick={() => fetchUsers(page + 1)} disabled={page >= lastPage || loading}
              className='flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
              Suivant <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>

      {/* Modal confirmation */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            type={confirm.type}
            user={confirm.user}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(null)}
            loading={actLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}