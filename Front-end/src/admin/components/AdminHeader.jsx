import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Settings, User, LogOut, Shield,
  AlertCircle, CheckCircle, Info, Package, ChevronDown,
  ShoppingBag, MessageSquare, AlertTriangle, BellOff
} from 'lucide-react';
import {
  getNotifications, markAllNotificationsRead, getNotificationsCount
} from '../../services/api';

// ─── Config types notifs ──────────────────────────────────────────────────────

const TYPE_CONFIG = {
  commande: { icon: ShoppingBag,    color: 'text-blue-500',   bg: 'bg-blue-50'   },
  message:  { icon: MessageSquare,  color: 'text-purple-500', bg: 'bg-purple-50' },
  kyc:      { icon: CheckCircle,    color: 'text-green-500',  bg: 'bg-green-50'  },
  litige:   { icon: AlertTriangle,  color: 'text-orange-500', bg: 'bg-orange-50' },
  annonce:  { icon: Package,        color: 'text-pink-500',   bg: 'bg-pink-50'   },
  systeme:  { icon: Info,           color: 'text-gray-500',   bg: 'bg-gray-100'  },
};

const getTypeCfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.systeme;

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)     return "À l'instant";
  if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(d).toLocaleDateString('fr-FR');
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminHeader({ onSearch }) {
  const navigate    = useNavigate();
  const notifRef    = useRef(null);
  const profileRef  = useRef(null);

  const [currentUser,        setCurrentUser]        = useState(null);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const [showProfile,        setShowProfile]        = useState(false);
  const [notifications,      setNotifications]      = useState([]);
  const [notifCount,         setNotifCount]         = useState(0);
  const [searchQuery,        setSearchQuery]        = useState('');

  // ─── Charger user depuis localStorage ──────────────────────────────────
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem('user');
        setCurrentUser(stored ? JSON.parse(stored) : null);
      } catch { setCurrentUser(null); }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  // ─── Charger compteur notifs ────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchCount = async () => {
      try {
        const data = await getNotificationsCount();
        setNotifCount(data.count ?? data.non_lues ?? 0);
      } catch { /**/ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // ─── Charger notifs quand dropdown ouvert ──────────────────────────────
  useEffect(() => {
    if (!showNotifications) return;
    const fetchNotifs = async () => {
      try {
        const res  = await getNotifications();
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        const arr  = Array.isArray(list) ? list : [];
        // Dédoublonner
        const seen = new Set();
        const deduped = arr.filter(n => {
          const key = `${n.type}-${n.reference_id}-${n.contenu}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setNotifications(deduped.slice(0, 8)); // max 8 dans le dropdown
      } catch { /**/ }
    };
    fetchNotifs();
  }, [showNotifications]);

  // ─── Click outside ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))    setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/admin/login');
  };

  // ─── Tout marquer lu ───────────────────────────────────────────────────
  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setNotifCount(0);
    } catch { /**/ }
  };

  // ─── Search ────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) onSearch(searchQuery.trim());
  };

  // ─── Initiales ─────────────────────────────────────────────────────────
  const getInitials = (nom) => {
    if (!nom) return 'A';
    return nom.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between px-6 py-3'>

        {/* Logo + Search */}
        <div className='flex items-center flex-1 gap-6'>
          <div className='flex items-center gap-2 shrink-0'>
            <div className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md'>
              <Shield className='w-5 h-5 text-white' />
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-bold text-gray-800'>Admin Panel</span>
              <span className='text-xs text-gray-500'>DocSpace</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className='flex-1 max-w-2xl'>
            <div className='relative'>
              <Search className='absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-4 top-1/2' />
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Rechercher utilisateurs, commandes, litiges...'
                className='w-full py-2.5 pl-11 pr-4 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 bg-gray-50 hover:bg-white transition-all'
              />
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2 ml-6'>

          {/* Notifications */}
          <div className='relative' ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className='relative p-2.5 transition-all rounded-xl hover:bg-gray-100 group'
            >
              <Bell className='w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
              {notifCount > 0 && (
                <span className='absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className='absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50'
                >
                  {/* Header */}
                  <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5'>
                    <h3 className='text-sm font-bold text-gray-800'>Notifications</h3>
                    <div className='flex items-center gap-2'>
                      {notifCount > 0 && (
                        <span className='px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full'>
                          {notifCount}
                        </span>
                      )}
                      {notifications.some(n => !n.lu) && (
                        <button
                          onClick={handleReadAll}
                          className='text-xs text-[#1DBF73] hover:text-[#09B1BA] font-semibold transition-colors'
                        >
                          Tout lire
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Liste */}
                  <div className='overflow-y-auto max-h-96'>
                    {notifications.length === 0 ? (
                      <div className='flex flex-col items-center justify-center py-10 text-center'>
                        <BellOff className='w-8 h-8 text-gray-200 mb-2' />
                        <p className='text-sm text-gray-400'>Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const cfg  = getTypeCfg(notif.type);
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.lu ? 'bg-[#1DBF73]/3' : ''}`}
                          >
                            <div className='flex items-start gap-3'>
                              <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className={`text-sm leading-snug ${!notif.lu ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                  {notif.contenu}
                                </p>
                                <p className='text-xs text-gray-400 mt-0.5'>{timeAgo(notif.created_at)}</p>
                              </div>
                              {!notif.lu && (
                                <span className='w-2 h-2 bg-[#1DBF73] rounded-full shrink-0 mt-1' />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className='px-4 py-3 text-center bg-gray-50 border-t border-gray-100'>
                    <button
                      onClick={() => { navigate('/admin/notifications'); setShowNotifications(false); }}
                      className='text-sm font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'
                    >
                      Voir toutes les notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <button className='p-2.5 transition-all rounded-xl hover:bg-gray-100 group'>
            <Settings className='w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
          </button>

          <div className='w-px h-8 bg-gray-200 mx-1' />

          {/* Profil */}
          <div className='relative' ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className='flex items-center gap-2.5 p-2 pr-3 rounded-xl hover:bg-gray-100 transition-all'
            >
              <div className='w-9 h-9 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0'>
                {getInitials(currentUser?.nom)}
              </div>
              <div className='hidden lg:block text-left'>
                <p className='text-sm font-semibold text-gray-800 leading-tight'>
                  {currentUser?.nom?.split(' ')[0] || 'Admin'}
                </p>
                <p className='text-xs text-gray-400'>Administrateur</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className='absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50'
                >
                  {/* Header profil */}
                  <div className='px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md'>
                        {getInitials(currentUser?.nom)}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-bold text-gray-900 truncate'>{currentUser?.nom}</p>
                        <p className='text-xs text-gray-500 truncate'>{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-lg'>
                      <Shield className='w-3.5 h-3.5 text-white' />
                      <span className='text-xs font-bold text-white'>Administrateur</span>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className='py-1'>
                    <button className='flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 group transition-colors'>
                      <User className='w-4 h-4 text-gray-400 group-hover:text-[#1DBF73] transition-colors' />
                      <span className='text-gray-700 group-hover:text-[#1DBF73] font-medium transition-colors'>Mon profil</span>
                    </button>
                    <button className='flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 group transition-colors'>
                      <Settings className='w-4 h-4 text-gray-400 group-hover:text-[#1DBF73] transition-colors' />
                      <span className='text-gray-700 group-hover:text-[#1DBF73] font-medium transition-colors'>Paramètres</span>
                    </button>
                  </div>

                  <div className='border-t border-gray-100 py-1'>
                    <button
                      onClick={handleLogout}
                      className='flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left hover:bg-red-50 group transition-colors'
                    >
                      <LogOut className='w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors' />
                      <span className='text-gray-700 group-hover:text-red-500 font-medium transition-colors'>Déconnexion</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}