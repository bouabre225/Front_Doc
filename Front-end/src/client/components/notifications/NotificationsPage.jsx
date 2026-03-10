import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, Filter,
  ShoppingBag, MessageSquare, Shield, AlertTriangle,
  Package, Info, ChevronRight, BellOff, ArrowLeft
} from 'lucide-react';
import {
  getNotifications, markNotificationRead,
  markAllNotificationsRead, deleteNotification
} from '../../../services/api';

// ─── Config types de notifications ──────────────────────────────────────────

const TYPE_CONFIG = {
  commande: {
    icon: ShoppingBag,
    color: 'bg-blue-100 text-blue-600',
    label: 'Commande',
  },
  message: {
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-600',
    label: 'Message',
  },
  kyc: {
    icon: Shield,
    color: 'bg-green-100 text-green-600',
    label: 'KYC',
  },
  litige: {
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-600',
    label: 'Litige',
  },
  annonce: {
    icon: Package,
    color: 'bg-pink-100 text-pink-600',
    label: 'Annonce',
  },
  systeme: {
    icon: Info,
    color: 'bg-gray-100 text-gray-600',
    label: 'Système',
  },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type] || TYPE_CONFIG.systeme;

// ─── Formatage date relative ─────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

// ─── Composant carte notification ────────────────────────────────────────────

const NotificationCard = ({ notif, onRead, onDelete }) => {
  const cfg = getTypeConfig(notif.type);
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative flex gap-4 p-4 rounded-2xl border transition-all group ${
        notif.lu
          ? 'bg-white border-gray-100'
          : 'bg-[#1DBF73]/5 border-[#1DBF73]/20'
      }`}
    >
      {/* Point non lu */}
      {!notif.lu && (
        <span className='absolute top-4 right-4 w-2 h-2 bg-[#1DBF73] rounded-full' />
      )}

      {/* Icône type */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
        <Icon className='w-5 h-5' />
      </div>

      {/* Contenu */}
      <div className='flex-1 min-w-0 pr-6'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-1 ${cfg.color}`}>
              {cfg.label}
            </span>
            <p className={`text-sm leading-snug ${notif.lu ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
              {notif.message || notif.contenu}
            </p>
            <p className='text-xs text-gray-400 mt-1'>{timeAgo(notif.created_at)}</p>
          </div>
        </div>

        {/* Lien vers la ressource si disponible */}
        {notif.reference_id && notif.type === 'commande' && (
          <Link
            to={`/commandes/${notif.reference_id}`}
            className='inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#1DBF73] hover:text-[#09B1BA] transition-colors'
          >
            Voir la commande <ChevronRight className='w-3 h-3' />
          </Link>
        )}
        {notif.reference_id && notif.type === 'litige' && (
          <Link
            to={`/litiges/${notif.reference_id}`}
            className='inline-flex items-center gap-1 mt-2 text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors'
          >
            Voir le litige <ChevronRight className='w-3 h-3' />
          </Link>
        )}
        {notif.reference_id && notif.type === 'message' && (
          <Link
            to={`/messages`}
            className='inline-flex items-center gap-1 mt-2 text-xs font-medium text-purple-500 hover:text-purple-600 transition-colors'
          >
            Ouvrir la conversation <ChevronRight className='w-3 h-3' />
          </Link>
        )}
      </div>

      {/* Actions (visibles au hover) */}
      <div className='absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
        {!notif.lu && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRead(notif.id)}
            title='Marquer comme lu'
            className='w-7 h-7 flex items-center justify-center rounded-full bg-[#1DBF73]/10 text-[#1DBF73] hover:bg-[#1DBF73]/20 transition-all'
          >
            <Check className='w-3.5 h-3.5' />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(notif.id)}
          title='Supprimer'
          className='w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition-all'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Composant principal ─────────────────────────────────────────────────────

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('toutes'); // toutes | non_lues | lues
  const [typeFilter, setTypeFilter] = useState('tous');
  const [filterOpen, setFilterOpen] = useState(false);

  const navigate = useNavigate();

  const nonLuesCount = notifications.filter(n => !n.lu).length;

  // ─── Chargement ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res  = await getNotifications();
      const list = res?.data?.data ?? res?.data ?? res ?? [];
      setNotifications(Array.isArray(list) ? list : []);  // ← plus de déduplication
    } catch (e) {
      console.error('NOTIF ERROR:', e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
    } catch {
        //
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch {
        //
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
        //
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Supprimer toutes les notifications lues ?')) return;
    const lues = notifications.filter(n => n.lu);
    await Promise.all(lues.map(n => deleteNotification(n.id).catch(() => {})));
    setNotifications(prev => prev.filter(n => !n.lu));
  };

  // ─── Filtrage ─────────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => {
    const luFilter =
      filter === 'toutes' ? true :
      filter === 'non_lues' ? !n.lu :
      n.lu;
    const tFilter = typeFilter === 'tous' ? true : n.type === typeFilter;
    return luFilter && tFilter;
  });

  const types = ['tous', ...Object.keys(TYPE_CONFIG)];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 hover:bg-gray-100 rounded-xl transition-colors'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center'>
            <Bell className='w-5 h-5 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Notifications</h1>
            {nonLuesCount > 0 && (
              <p className='text-xs text-[#1DBF73] font-medium'>
                {nonLuesCount} non lue{nonLuesCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Actions globales */}
        <div className='flex items-center gap-2'>
          {nonLuesCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReadAll}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1DBF73] bg-[#1DBF73]/10 hover:bg-[#1DBF73]/20 rounded-xl transition-all'
            >
              <CheckCheck className='w-3.5 h-3.5' />
              Tout lire
            </motion.button>
          )}
          {notifications.some(n => n.lu) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAll}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-all'
            >
              <Trash2 className='w-3.5 h-3.5' />
              Vider les lues
            </motion.button>
          )}
        </div>
      </div>

      {/* Filtres lecture */}
      <div className='flex items-center gap-2 mb-4'>
        {[
          { key: 'toutes',    label: 'Toutes' },
          { key: 'non_lues',  label: `Non lues${nonLuesCount > 0 ? ` (${nonLuesCount})` : ''}` },
          { key: 'lues',      label: 'Lues' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f.key
                ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1DBF73]/40'
            }`}
          >
            {f.label}
          </button>
        ))}

        {/* Filtre par type */}
        <div className='relative ml-auto'>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              typeFilter !== 'tous'
                ? 'border-[#1DBF73] text-[#1DBF73] bg-[#1DBF73]/5'
                : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
            }`}
          >
            <Filter className='w-3.5 h-3.5' />
            {typeFilter === 'tous' ? 'Type' : TYPE_CONFIG[typeFilter]?.label}
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className='absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-20'
              >
                {types.map(type => {
                  const cfg = type === 'tous' ? null : getTypeConfig(type);
                  const Icon = cfg?.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => { setTypeFilter(type); setFilterOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                        typeFilter === type
                          ? 'bg-[#1DBF73]/10 text-[#1DBF73] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {Icon ? <Icon className='w-3.5 h-3.5' /> : <Bell className='w-3.5 h-3.5' />}
                      {type === 'tous' ? 'Tous les types' : cfg?.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-col items-center justify-center py-20 text-center'
        >
          <div className='w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4'>
            <BellOff className='w-8 h-8 text-gray-300' />
          </div>
          <p className='text-gray-500 font-medium'>Aucune notification</p>
          <p className='text-gray-400 text-sm mt-1'>
            {filter === 'non_lues' ? 'Tout est lu !' : 'Vous êtes à jour.'}
          </p>
        </motion.div>
      ) : (
        <div className='space-y-2'>
          <AnimatePresence mode='popLayout'>
            {filtered.map(notif => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;