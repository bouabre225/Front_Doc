import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Stethoscope, 
  TrendingUp,
  UserCheck,
  AlertCircle,
  DollarSign,
  Heart,
  Clock
} from 'lucide-react';

// Composant StatCard
const StatCard = ({ icon, title, value, color, bgColor, trend }) => {
  const Icon = icon;
  return (
    <div className="p-6 transition-all bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-500">
                +{trend}%
              </span>
              <span className="text-xs text-gray-500">
                ce mois
              </span>
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendeurs: 0,
    totalEquipements: 0,
    totalCommandes: 0,
    revenusTotal: 0,
    totalAvis: 0,
    vendeursEnAttente: 0,
    equipementsEnAttente: 0,
    commandesAujourdhui: 0
  });

  const fetchStats = async () => {
    // TODO: Appeler l'API pour récupérer les stats
    // Données mockées
    setStats({
      totalUsers: 2450,
      totalVendeurs: 486,
      totalEquipements: 1850,
      totalCommandes: 3264,
      revenusTotal: '245.8K',
      totalAvis: 2142,
      vendeursEnAttente: 8,
      equipementsEnAttente: 15,
      commandesAujourdhui: 34
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Tableau de bord
          </h1>
          <p className="text-sm text-gray-600">
            Vue d'ensemble de la plateforme DocSpace - Équipements Médicaux
          </p>
        </div>

        {/* Alertes */}
        <div className="mb-6 space-y-3">
          {stats.vendeursEnAttente > 0 && (
            <div className="flex items-center gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-medium text-gray-800">
                {stats.vendeursEnAttente} vendeur{stats.vendeursEnAttente > 1 ? 's' : ''} en attente de vérification
              </p>
            </div>
          )}
          
          {stats.equipementsEnAttente > 0 && (
            <div className="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50 rounded-xl">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-800">
                {stats.equipementsEnAttente} équipement{stats.equipementsEnAttente > 1 ? 's' : ''} en attente de validation
              </p>
            </div>
          )}
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            title="Total Utilisateurs"
            value={stats.totalUsers}
            color="#1DBF73"
            bgColor="rgba(29, 191, 115, 0.1)"
            trend={15}
          />
          <StatCard
            icon={UserCheck}
            title="Vendeurs Actifs"
            value={stats.totalVendeurs}
            color="#09B1BA"
            bgColor="rgba(9, 177, 186, 0.1)"
            trend={10}
          />
          <StatCard
            icon={Stethoscope}
            title="Équipements"
            value={stats.totalEquipements}
            color="#22c55e"
            bgColor="rgba(34, 197, 94, 0.1)"
            trend={8}
          />
          <StatCard
            icon={ShoppingCart}
            title="Commandes"
            value={stats.totalCommandes}
            color="#f59e0b"
            bgColor="rgba(245, 158, 11, 0.1)"
            trend={12}
          />
        </div>

        {/* Statistiques secondaires */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-[#1DBF73]" />
              <h3 className="font-semibold text-gray-800">
                Revenus Total
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.revenusTotal} FCFA
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-500">+18%</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-[#09B1BA]" />
              <h3 className="font-semibold text-gray-800">
                Commandes aujourd'hui
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.commandesAujourdhui}
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-800">
                Total Avis
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalAvis}
            </p>
          </div>
        </div>

        {/* Graphiques et tableaux */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Activité récente */}
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Activité récente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 transition-colors rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Nouveau vendeur vérifié</p>
                  <p className="text-xs text-gray-500">Il y a 5 minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 transition-colors rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Nouvel équipement publié</p>
                  <p className="text-xs text-gray-500">Il y a 12 minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 transition-colors rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Nouvelle commande passée</p>
                  <p className="text-xs text-gray-500">Il y a 18 minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 transition-colors rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Nouveau signalement reçu</p>
                  <p className="text-xs text-gray-500">Il y a 25 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Équipements populaires */}
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Catégories populaires
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#1DBF73]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Cardiologie</p>
                    <p className="text-xs text-gray-500">324 équipements</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#1DBF73]">35%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#09B1BA]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#09B1BA] to-[#1DBF73] rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Radiologie</p>
                    <p className="text-xs text-gray-500">256 équipements</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#09B1BA]">28%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Chirurgie</p>
                    <p className="text-xs text-gray-500">198 équipements</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-600">21%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Laboratoire</p>
                    <p className="text-xs text-gray-500">142 équipements</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-600">16%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}