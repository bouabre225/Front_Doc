import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  ShoppingCart,
  AlertCircle,
  LogOut,
  Shield,
} from 'lucide-react';

export default function AdminSidebar({ kycCount = 0, litigeCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon:  LayoutDashboard,
      path:  '/admin/dashboard',
    },
    {
      title: 'Utilisateurs',
      icon:  Users,
      path:  '/admin/users',
    },
    {
      title: 'Vérification KYC',
      icon:  UserCheck,
      path:  '/admin/kyc',
      badge: kycCount,
      badgeColor: '#1DBF73',
    },
    {
      title: 'Annonces',
      icon:  Stethoscope,
      path:  '/admin/annonces',
    },
    {
      title: 'Commandes',
      icon:  ShoppingCart,
      path:  '/admin/commandes',
    },
    {
      title: 'Litiges',
      icon:  AlertCircle,
      path:  '/admin/litiges',
      badge: litigeCount,
      badgeColor: '#ef4444',
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/admin/login');
  };

  // Récupérer l'user depuis localStorage
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const getInitials = (nom) => {
    if (!nom) return 'AD';
    return nom.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <aside className='flex flex-col w-64 min-h-screen bg-white border-r border-gray-200 shrink-0'>

      {/* Logo */}
      <Link to='/admin/dashboard' className='flex items-center gap-3 px-6 py-5 border-b border-gray-100 group'>
        <div className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow shrink-0'>
          <Stethoscope className='w-5 h-5 text-white' strokeWidth={2.5} />
        </div>
        <div>
          <h1 className='text-lg font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent leading-tight'>
            DocSpace
          </h1>
          <div className='flex items-center gap-1'>
            <Shield className='w-3 h-3 text-gray-400' />
            <p className='text-xs font-medium text-gray-400'>Admin Panel</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4 overflow-y-auto'>
        <p className='px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
          Navigation
        </p>
        <ul className='space-y-0.5'>
          {menuItems.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center justify-between gap-3 px-3 py-2.5
                    rounded-xl transition-all group
                    ${active
                      ? 'bg-gradient-to-r from-[#1DBF73]/10 to-[#09B1BA]/10'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className='flex items-center gap-3'>
                    <Icon
                      className={`w-5 h-5 transition-colors shrink-0 ${
                        active
                          ? 'text-[#1DBF73]'
                          : 'text-gray-400 group-hover:text-[#1DBF73]'
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className={`text-sm transition-colors ${
                      active
                        ? 'font-semibold text-[#1DBF73]'
                        : 'font-medium text-gray-600 group-hover:text-[#1DBF73]'
                    }`}>
                      {item.title}
                    </span>
                  </div>

                  {item.badge > 0 && (
                    <span
                      className='px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0'
                      style={{ backgroundColor: item.badgeColor || '#1DBF73' }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil + Logout */}
      <div className='px-3 py-4 border-t border-gray-100'>
        <div className='flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5'>
          <div className='w-9 h-9 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0'>
            {getInitials(currentUser.nom)}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-800 truncate'>
              {currentUser.nom || 'Administrateur'}
            </p>
            <p className='text-xs text-gray-400 truncate'>
              {currentUser.email || ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className='flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all group'
        >
          <LogOut className='w-4 h-4 group-hover:scale-110 transition-transform' />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}