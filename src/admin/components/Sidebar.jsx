import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Package, Stethoscope,
  ShoppingCart, AlertCircle, Settings, LogOut, Shield,
  FileText, TrendingUp, Heart
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const menuItems = [
    { title: 'Tableau de bord', icon: LayoutDashboard, path: '/admin/dashboard' },
    { title: 'Utilisateurs', icon: Users, path: '/admin/users' },
    { title: 'Vérification KYC', icon: UserCheck, path: '/admin/verification' },
    { title: 'Équipements', icon: Stethoscope, path: '/admin/equipments' },
    { title: 'Commandes', icon: ShoppingCart, path: '/admin/orders' },
    { title: 'Catégories', icon: Package, path: '/admin/categories' },
    { title: 'Modération', icon: Shield, path: '/admin/moderation' },
    { title: 'Signalements', icon: AlertCircle, path: '/admin/reports' },
    { title: 'Avis', icon: Heart, path: '/admin/reviews' },
    { title: 'Statistiques', icon: TrendingUp, path: '/admin/statistics' },
    { title: 'Factures', icon: FileText, path: '/admin/invoices' },
    { title: 'Paramètres', icon: Settings, path: '/admin/settings' },
  ];

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

  const isActive = (path) => location.pathname === path;

  return (
    <aside className='flex flex-col flex-shrink-0 w-64 min-h-screen bg-white border-r border-gray-100'>

      {/* Logo */}
      <div className='p-4 border-b border-gray-100'>
        <Link to='/admin/dashboard' className='flex items-center gap-2 group'>
          <img
            src='/images/docspace.png'
            alt='DocSpace'
            className='object-contain h-10 w-28'
          />
          <span className='px-2 py-0.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full'>
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className='flex-1 px-3 py-4 overflow-y-auto'>
        <ul className='space-y-0.5'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link to={item.path}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-[#1DBF73]/10 to-[#09B1BA]/10'
                      : 'hover:bg-gray-50'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      active ? 'text-[#1DBF73]' : 'text-gray-400 group-hover:text-[#1DBF73]'
                    }`} strokeWidth={active ? 2.5 : 2} />
                    <span className={`text-sm transition-colors ${
                      active ? 'font-semibold text-[#1DBF73]' : 'font-medium text-gray-600 group-hover:text-[#1DBF73]'
                    }`}>
                      {item.title}
                    </span>
                  </div>
                  {item.badge && (
                    <span className='px-1.5 py-0.5 text-xs font-bold text-white bg-[#1DBF73] rounded-full'>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer profil */}
      <div className='p-3 border-t border-gray-100'>
        <div className='flex items-center gap-3 p-3 mb-2 rounded-xl bg-gray-50'>
          <div className='flex items-center justify-center w-9 h-9 text-xs font-bold text-white rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex-shrink-0'>
            {(user.nom || 'AD').slice(0, 2).toUpperCase()}
          </div>
          <div className='overflow-hidden'>
            <p className='text-sm font-semibold text-gray-800 truncate'>{user.nom || 'Admin'}</p>
            <p className='text-xs text-gray-400 truncate'>{user.email || 'admin@docspace.com'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className='flex items-center w-full gap-2 px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all'>
          <LogOut className='w-4 h-4' />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}