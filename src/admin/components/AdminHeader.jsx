import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search, Settings, User, Stethoscope, LogOut,
  Shield, AlertCircle, CheckCircle, Info, Package, Menu
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function AdminHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const userName = user.nom || 'Admin DocSpace';
  const userEmail = user.email || 'admin@docspace.com';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user');
      navigate('/admin/login');
    }
  };

  const notifications = [
    { id: 1, message: 'Nouvel équipement en attente de vérification', time: '5 min', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, message: '3 nouveaux signalements à traiter', time: '15 min', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 3, message: 'Nouveau vendeur vérifié avec succès', time: '1h', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 4, message: "12 nouvelles commandes aujourd'hui", time: '2h', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <header className='sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm'>
      <div className='flex items-center justify-between px-3 py-3 sm:px-6'>

        {/* Gauche : burger mobile + logo + search */}
        <div className='flex items-center flex-1 min-w-0 gap-3'>

          {/* Burger mobile */}
          <button onClick={onMenuClick}
            className='flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 lg:hidden'>
            <Menu className='w-5 h-5 text-gray-600' />
          </button>

          {/* Logo */}
          <div className='items-center flex-shrink-0 hidden gap-2 sm:flex'>
            <img
              src='/images/docspace.png'
              alt='DocSpace'
              className='object-contain h-10 w-28'
            />
            <span className='hidden md:inline-flex px-2 py-0.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full'>
              Admin
            </span>
          </div>

          {/* Search */}
          <div className='flex-1 max-w-lg'>
            <div className='relative'>
              <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Rechercher...'
                className='w-full py-2 pl-9 pr-4 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] bg-gray-50 hover:bg-white transition-all'
              />
            </div>
          </div>
        </div>

        {/* Droite : notifs + profil */}
        <div className='flex items-center flex-shrink-0 gap-1 ml-2 sm:gap-2'>

          {/* Notifications */}
          <div className='relative' ref={notifRef}>
            <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className='relative p-2 rounded-xl hover:bg-gray-100 group'>
              <Bell className='w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
              <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse' />
            </button>

            {showNotifications && (
              <div className='absolute right-0 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl w-72 sm:w-80 rounded-xl'>
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5'>
                  <h3 className='text-sm font-bold text-gray-800'>Notifications</h3>
                  <span className='px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-full'>
                    {notifications.length}
                  </span>
                </div>
                <div className='overflow-y-auto max-h-80'>
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id}
                        className='flex items-start gap-3 px-4 py-3 transition-colors border-b cursor-pointer border-gray-50 hover:bg-gray-50'>
                        <div className={`p-2 rounded-lg flex-shrink-0 ${n.bg}`}>
                          <Icon className={`w-4 h-4 ${n.color}`} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-medium leading-snug text-gray-800'>{n.message}</p>
                          <p className='text-xs text-gray-400 mt-0.5'>Il y a {n.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className='px-4 py-2.5 text-center bg-gray-50'>
                  <button className='text-xs font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'>
                    Voir tout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings desktop seulement */}
          <button className='hidden p-2 sm:block rounded-xl hover:bg-gray-100 group'>
            <Settings className='w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
          </button>

          <div className='hidden w-px h-6 bg-gray-200 sm:block' />

          {/* Profil */}
          <div className='relative' ref={profileRef}>
            <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className='flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-gray-100 transition-all'>
              <div className='w-8 h-8 flex items-center justify-center text-xs font-bold text-white rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] shadow-sm flex-shrink-0'>
                {initials}
              </div>
              <div className='hidden text-left md:block'>
                <p className='text-xs font-semibold leading-none text-gray-800'>{userName}</p>
                <p className='text-xs text-gray-400 mt-0.5'>Administrateur</p>
              </div>
            </button>

            {showProfile && (
              <div className='absolute right-0 w-56 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-xl'>
                {/* Header profil */}
                <div className='px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 flex items-center justify-center text-sm font-bold text-white rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex-shrink-0'>
                      {initials}
                    </div>
                    <div className='overflow-hidden'>
                      <p className='text-sm font-bold text-gray-800 truncate'>{userName}</p>
                      <p className='text-xs text-gray-400 truncate'>{userEmail}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1 mt-2 px-2 py-1 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-lg w-fit'>
                    <Shield className='w-3 h-3 text-white' />
                    <span className='text-xs font-semibold text-white'>Administrateur</span>
                  </div>
                </div>

                <div className='py-1'>
                  {[
                    { icon: User, label: 'Mon profil' },
                    { icon: Settings, label: 'Paramètres' },
                    { icon: Stethoscope, label: 'Équipements' },
                  ].map(({ icon: Icon, label }) => (
                    <button key={label}
                      className='flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 group transition-colors'>
                      <Icon className='w-4 h-4 text-gray-400 group-hover:text-[#1DBF73] transition-colors' />
                      <span className='font-medium text-gray-700 group-hover:text-[#1DBF73] transition-colors'>{label}</span>
                    </button>
                  ))}
                  <div className='my-1 border-t border-gray-100' />
                  <button onClick={handleLogout}
                    className='flex items-center w-full gap-3 px-4 py-2.5 text-sm hover:bg-red-50 group transition-colors'>
                    <LogOut className='w-4 h-4 text-gray-400 transition-colors group-hover:text-red-500' />
                    <span className='font-medium text-gray-700 transition-colors group-hover:text-red-500'>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}