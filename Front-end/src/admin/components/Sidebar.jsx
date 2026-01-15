import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Package, 
  Stethoscope,
  Heart,
  ShoppingCart,
  AlertCircle,
  Settings,
  LogOut,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      title: 'Utilisateurs',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Vérification vendeurs',
      icon: UserCheck,
      path: '/admin/verification',
      badge: 5
    },
    {
      title: 'Équipements',
      icon: Stethoscope,
      path: '/admin/equipments',
    },
    {
      title: 'Commandes',
      icon: ShoppingCart,
      path: '/admin/orders',
      badge: 12,
      badgeColor: '#09B1BA'
    },
    {
      title: 'Catégories',
      icon: Package,
      path: '/admin/categories',
    },
    {
      title: 'Modération',
      icon: Shield,
      path: '/admin/moderation',
      badge: 4,
      badgeColor: '#ef4444'
    },
    {
      title: 'Signalements',
      icon: AlertCircle,
      path: '/admin/reports',
      badge: 3,
      badgeColor: '#f59e0b'
    },
    {
      title: 'Avis',
      icon: Heart,
      path: '/admin/reviews',
    },
    {
      title: 'Statistiques',
      icon: TrendingUp,
      path: '/admin/statistics',
    },
    {
      title: 'Factures',
      icon: FileText,
      path: '/admin/invoices',
    },
    {
      title: 'Paramètres',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col w-64 min-h-screen p-6 bg-white border-r border-gray-200">
      {/* Logo */}
      <Link to="/admin/dashboard" className="flex items-center gap-3 mb-8 group">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] shadow-lg group-hover:shadow-xl transition-shadow">
          <Stethoscope className="text-white w-7 h-7" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent">
            DocSpace
          </h1>
          <p className="text-xs font-medium text-gray-500">
            Admin Panel
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center justify-between gap-3 px-4 py-3 
                    transition-all rounded-xl group
                    ${active 
                      ? 'bg-gradient-to-r from-[#1DBF73]/10 to-[#09B1BA]/10 shadow-sm' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className={`w-5 h-5 transition-colors ${
                        active 
                          ? 'text-[#1DBF73]' 
                          : 'text-gray-500 group-hover:text-[#1DBF73]'
                      }`}
                      strokeWidth={active ? 2.5 : 2} 
                    />
                    <span 
                      className={`text-sm transition-colors ${
                        active 
                          ? 'font-semibold text-[#1DBF73]' 
                          : 'font-medium text-gray-700 group-hover:text-[#1DBF73]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  {item.badge && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: item.badgeColor || '#1DBF73' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil admin */}
      <div className="pt-6 mt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 mb-3 transition-all rounded-xl bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5 hover:shadow-md">
          <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] shadow-md">
            AD
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              Admin DocSpace
            </p>
            <p className="text-xs text-gray-500">
              admin@docspace.com
            </p>
          </div>
        </div>
        
        <button
          className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-500 transition-all rounded-xl hover:bg-red-50 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}