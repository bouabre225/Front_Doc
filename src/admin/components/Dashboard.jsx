import React, { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingCart, Stethoscope, TrendingUp,
  UserCheck, AlertCircle, DollarSign, Heart, Clock
} from 'lucide-react';
import StatCard from './Stats';

const API_URL = 'http://localhost:8000/api';

const getToken = () =>
  localStorage.getItem('admin_token') || localStorage.getItem('auth_token');

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      };

      // Fetch annonces et commandes en parallèle
      const [annoncesRes, commandesRes] = await Promise.all([
        fetch(`${API_URL}/annonces?page=1`, { headers }),
        fetch(`${API_URL}/commandes`, { headers }),
      ]);

      const annoncesData = annoncesRes.ok ? await annoncesRes.json() : null;
      const commandesData = commandesRes.ok ? await commandesRes.json() : null;

      const totalAnnonces = annoncesData?.total || annoncesData?.meta?.total || 0;
      const totalCommandes = commandesData?.total || (Array.isArray(commandesData?.data) ? commandesData.data.length : 0);

      // Activité récente depuis les annonces
      if (annoncesData?.data?.length > 0) {
        const recent = annoncesData.data.slice(0, 4).map(a => ({
          id: a.id,
          message: `Équipement publié : ${a.titre}`,
          time: new Date(a.created_at).toLocaleDateString('fr-FR'),
          type: 'equipment'
        }));
        setRecentActivity(recent);
      }

      setStats({
        totalEquipements: totalAnnonces,
        totalCommandes,
        // Données non disponibles via API actuelle → indicatifs
        totalUsers: '—',
        totalVendeurs: '—',
        revenusTotal: '—',
        totalAvis: '—',
        vendeursEnAttente: 0,
        equipementsEnAttente: 0,
        commandesAujourdhui: '—',
      });

    } catch {
      // Fallback mockdata si API non disponible
      setStats({
        totalUsers: 2450, totalVendeurs: 486,
        totalEquipements: 1850, totalCommandes: 3264,
        revenusTotal: '245.8K', totalAvis: 2142,
        vendeursEnAttente: 8, equipementsEnAttente: 15,
        commandesAujourdhui: 34
      });
      setRecentActivity([
        { id: 1, message: 'Nouveau vendeur vérifié', time: '5 min', type: 'user' },
        { id: 2, message: 'Nouvel équipement publié', time: '12 min', type: 'equipment' },
        { id: 3, message: 'Nouvelle commande passée', time: '18 min', type: 'order' },
        { id: 4, message: 'Nouveau signalement reçu', time: '25 min', type: 'alert' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activityIcon = (type) => {
    const map = {
      user: { bg: 'bg-green-50', icon: <UserCheck className='w-4 h-4 text-green-600' /> },
      equipment: { bg: 'bg-blue-50', icon: <Stethoscope className='w-4 h-4 text-blue-600' /> },
      order: { bg: 'bg-orange-50', icon: <ShoppingCart className='w-4 h-4 text-orange-600' /> },
      alert: { bg: 'bg-red-50', icon: <AlertCircle className='w-4 h-4 text-red-600' /> },
    };
    return map[type] || map.alert;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-full p-4 sm:p-6 bg-gray-50'>
      <div className='mx-auto max-w-7xl'>

        {/* En-tête */}
        <div className='mb-6'>
          <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>Tableau de bord</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Vue d'ensemble de la plateforme DocSpace</p>
        </div>

        {/* Alertes */}
        {(stats.vendeursEnAttente > 0 || stats.equipementsEnAttente > 0) && (
          <div className='mb-5 space-y-2'>
            {stats.vendeursEnAttente > 0 && (
              <div className='flex items-center gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-xl'>
                <AlertCircle className='flex-shrink-0 w-4 h-4 text-yellow-600' />
                <p className='text-sm font-medium text-gray-800'>
                  {stats.vendeursEnAttente} vendeur{stats.vendeursEnAttente > 1 ? 's' : ''} en attente de vérification
                </p>
              </div>
            )}
            {stats.equipementsEnAttente > 0 && (
              <div className='flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 rounded-xl'>
                <Stethoscope className='flex-shrink-0 w-4 h-4 text-blue-600' />
                <p className='text-sm font-medium text-gray-800'>
                  {stats.equipementsEnAttente} équipement{stats.equipementsEnAttente > 1 ? 's' : ''} en attente
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats principales */}
        <div className='grid grid-cols-2 gap-3 mb-5 lg:grid-cols-4 sm:gap-4'>
          <StatCard icon={Users} title='Utilisateurs' value={stats.totalUsers}
            color='#1DBF73' bgColor='rgba(29,191,115,0.1)' trend='up' trendValue={15} />
          <StatCard icon={UserCheck} title='Vendeurs' value={stats.totalVendeurs}
            color='#09B1BA' bgColor='rgba(9,177,186,0.1)' trend='up' trendValue={10} />
          <StatCard icon={Stethoscope} title='Équipements' value={stats.totalEquipements}
            color='#22c55e' bgColor='rgba(34,197,94,0.1)' trend='up' trendValue={8} />
          <StatCard icon={ShoppingCart} title='Commandes' value={stats.totalCommandes}
            color='#f59e0b' bgColor='rgba(245,158,11,0.1)' trend='up' trendValue={12} />
        </div>

        {/* Stats secondaires */}
        <div className='grid grid-cols-1 gap-3 mb-5 sm:grid-cols-3 sm:gap-4'>
          {[
            { icon: DollarSign, color: 'text-[#1DBF73]', label: 'Revenus Total', value: `${stats.revenusTotal} FCFA`, trend: '+18%' },
            { icon: Clock, color: 'text-[#09B1BA]', label: "Commandes aujourd'hui", value: stats.commandesAujourdhui },
            { icon: Heart, color: 'text-red-500', label: 'Total Avis', value: stats.totalAvis },
          ].map(({ icon: Icon, color, label, value, trend }) => (
            <div key={label} className='p-4 bg-white border border-gray-100 shadow-sm sm:p-5 rounded-xl'>
              <div className='flex items-center gap-2 mb-3'>
                <Icon className={`w-4 h-4 ${color}`} />
                <h3 className='text-sm font-semibold text-gray-700'>{label}</h3>
              </div>
              <p className='text-2xl font-bold text-gray-800'>{value}</p>
              {trend && (
                <div className='flex items-center gap-1 mt-1'>
                  <TrendingUp className='w-3.5 h-3.5 text-green-500' />
                  <span className='text-xs font-semibold text-green-500'>{trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Activité + Catégories */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>

          {/* Activité récente */}
          <div className='p-4 bg-white border border-gray-100 shadow-sm sm:p-5 rounded-xl'>
            <h3 className='mb-4 text-sm font-bold text-gray-800'>Activité récente</h3>
            <div className='space-y-2'>
              {recentActivity.map((item) => {
                const { bg, icon } = activityIcon(item.type);
                return (
                  <div key={item.id}
                    className='flex items-center gap-3 p-3 transition-colors cursor-pointer rounded-xl hover:bg-gray-50'>
                    <div className={`p-2 rounded-lg flex-shrink-0 ${bg}`}>{icon}</div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-800 truncate'>{item.message}</p>
                      <p className='text-xs text-gray-400'>
                        {item.time.includes('/') ? item.time : `Il y a ${item.time}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catégories populaires */}
          <div className='p-4 bg-white border border-gray-100 shadow-sm sm:p-5 rounded-xl'>
            <h3 className='mb-4 text-sm font-bold text-gray-800'>Catégories populaires</h3>
            <div className='space-y-2'>
              {[
                { name: 'Cardiologie', count: 324, pct: 35, color: 'from-[#1DBF73] to-[#09B1BA]' },
                { name: 'Imagerie Médicale', count: 256, pct: 28, color: 'from-[#09B1BA] to-[#1DBF73]' },
                { name: 'Chirurgie', count: 198, pct: 21, color: 'from-gray-400 to-gray-500' },
                { name: 'Laboratoire', count: 142, pct: 16, color: 'from-gray-300 to-gray-400' },
              ].map((cat) => (
                <div key={cat.name}
                  className='flex items-center justify-between p-3 transition-colors rounded-xl bg-gray-50 hover:bg-gray-100'>
                  <div className='flex items-center gap-3'>
                    <div className={`w-8 h-8 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Package className='w-4 h-4 text-white' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-800'>{cat.name}</p>
                      <p className='text-xs text-gray-400'>{cat.count} équipements</p>
                    </div>
                  </div>
                  <span className='text-sm font-bold text-gray-600'>{cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}