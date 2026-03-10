import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, AlertCircle, CheckCircle,
  Mail, Phone, MapPin, Shield, Star, Package,
  UserCheck, UserX, ChevronDown, ChevronUp
} from 'lucide-react';
import { getAnnonces } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const getInitials = (nom) =>
  nom?.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

// ─── Carte utilisateur ────────────────────────────────────────────────────────

const UserCard = ({ user, annoncesCount }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className='bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden'>

      <div className='flex items-center gap-4 p-5'>
        {/* Avatar */}
        <div className='w-11 h-11 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm'>
          {getInitials(user.nom)}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='font-bold text-gray-900 truncate'>{user.nom}</p>
            {user.verifie_kyc && (
              <CheckCircle className='w-4 h-4 text-green-500 shrink-0' title='KYC vérifié' />
            )}
            {user.badge_verifie && (
              <Shield className='w-4 h-4 text-blue-500 shrink-0' title='Badge vérifié' />
            )}
          </div>
          <p className='text-xs text-gray-400 truncate'>{user.email}</p>
          <div className='flex items-center gap-2 mt-1'>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              user.role === 'vendeur'
                ? 'bg-[#09B1BA]/10 text-[#09B1BA]'
                : 'bg-[#1DBF73]/10 text-[#1DBF73]'
            }`}>
              {user.role === 'vendeur' ? 'Vendeur' : user.role}
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              user.statut === 'actif'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {user.statut}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-4 shrink-0'>
          {user.note_moyenne > 0 && (
            <div className='flex items-center gap-1 text-sm'>
              <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
              <span className='font-bold text-gray-700'>{Number(user.note_moyenne).toFixed(1)}</span>
            </div>
          )}
          <div className='text-center'>
            <p className='text-lg font-black text-[#1DBF73]'>{annoncesCount}</p>
            <p className='text-[10px] text-gray-400'>annonce{annoncesCount > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className='p-2 hover:bg-gray-100 rounded-xl transition-colors'>
            {expanded
              ? <ChevronUp className='w-4 h-4 text-gray-400' />
              : <ChevronDown className='w-4 h-4 text-gray-400' />
            }
          </button>
        </div>
      </div>

      {/* Détails */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className='overflow-hidden'>
            <div className='px-5 pb-5 border-t border-gray-100 pt-4'>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  { icon: Mail,    label: 'Email',      value: user.email },
                  { icon: Phone,   label: 'Téléphone',  value: user.telephone || '—' },
                  { icon: MapPin,  label: 'Pays',       value: user.pays || '—' },
                  { icon: Shield,  label: 'Type',       value: user.type_compte || '—' },
                  { icon: Package, label: 'Inscrit le', value: formatDate(user.created_at) },
                  { icon: Star,    label: 'Note',       value: user.note_moyenne > 0 ? `${Number(user.note_moyenne).toFixed(1)}/5` : 'Aucune note' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className='flex items-start gap-2 p-3 bg-gray-50 rounded-xl'>
                    <Icon className='w-4 h-4 text-[#1DBF73] mt-0.5 shrink-0' />
                    <div>
                      <p className='text-[10px] text-gray-400 font-medium'>{label}</p>
                      <p className='text-sm font-semibold text-gray-800 truncate'>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges KYC */}
              <div className='flex gap-2 mt-3'>
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
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('tous');
  const [error,   setError]   = useState('');

  // On déduplique les vendeurs depuis /annonces
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await getAnnonces({ per_page: 100 });
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : data?.data ?? [];

      // Dédupliquer par vendeur_id
      const map = {};
      list.forEach(a => {
        if (a.vendeur && !map[a.vendeur.id]) {
          map[a.vendeur.id] = { ...a.vendeur, _annoncesCount: 0 };
        }
        if (a.vendeur) map[a.vendeur.id]._annoncesCount++;
      });
      setUsers(Object.values(map));
    } catch {
      setError('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const FILTERS = [
    { key: 'tous',      label: 'Tous'              },
    { key: 'verifie',   label: 'KYC vérifié'       },
    { key: 'non_verifie', label: 'KYC non vérifié' },
  ];

  const filtered = users.filter(u => {
    const matchFilter =
      filter === 'tous' ||
      (filter === 'verifie'     && u.verifie_kyc)  ||
      (filter === 'non_verifie' && !u.verifie_kyc);
    const matchSearch =
      !search ||
      u.nom?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Utilisateurs</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {users.length} vendeur{users.length > 1 ? 's' : ''} identifié{users.length > 1 ? 's' : ''} via les annonces
            </p>
          </div>
          <button onClick={fetchUsers} disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] hover:text-[#1DBF73] transition-all'>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-3 mb-6'>
          <div className='p-4 bg-white border border-gray-100 rounded-xl text-center'>
            <p className='text-2xl font-black text-gray-800'>{users.length}</p>
            <p className='text-xs text-gray-400 mt-0.5'>Vendeurs</p>
          </div>
          <div className='p-4 bg-green-50 border border-green-100 rounded-xl text-center'>
            <p className='text-2xl font-black text-green-600'>{users.filter(u => u.verifie_kyc).length}</p>
            <p className='text-xs text-gray-400 mt-0.5'>KYC vérifié</p>
          </div>
          <div className='p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-center'>
            <p className='text-2xl font-black text-yellow-600'>{users.filter(u => !u.verifie_kyc).length}</p>
            <p className='text-xs text-gray-400 mt-0.5'>Non vérifié</p>
          </div>
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

        {/* Note */}
        <div className='flex items-start gap-3 p-3 mb-5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700'>
          <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
          Les utilisateurs affichés sont les vendeurs extraits des annonces. Une route <code className='bg-blue-100 px-1 rounded'>/api/admin/users</code> permettrait de voir tous les utilisateurs.
        </div>

        {/* Search + Filtres */}
        <div className='flex flex-col sm:flex-row gap-3 mb-5'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input type='text' value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher par nom ou email...'
              className='w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all' />
          </div>
          <div className='flex gap-2'>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className='space-y-3'>
            {[1,2,3].map(i => (
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
            {filtered.map(user => (
              <UserCard key={user.id} user={user} annoncesCount={user._annoncesCount} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}