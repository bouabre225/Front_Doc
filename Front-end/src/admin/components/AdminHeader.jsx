import React, { useState } from 'react';
import { Bell, Search, Settings, User, Stethoscope, LogOut, Shield, AlertCircle, CheckCircle, Info, Package } from 'lucide-react';

export default function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Simuler un utilisateur admin
  const user = {
    prenom: 'Admin',
    nom: 'DocSpace',
    email: 'admin@docspace.com'
  };

  const notifications = [
    { 
      id: 1, 
      type: 'info', 
      message: 'Nouvel équipement en attente de vérification', 
      time: '5 min',
      icon: Info,
      color: 'text-blue-500'
    },
    { 
      id: 2, 
      type: 'warning', 
      message: '3 nouveaux signalements à traiter', 
      time: '15 min',
      icon: AlertCircle,
      color: 'text-orange-500'
    },
    { 
      id: 3, 
      type: 'success', 
      message: 'Nouveau vendeur vérifié avec succès', 
      time: '1h',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    { 
      id: 4, 
      type: 'info', 
      message: '12 nouvelles commandes aujourd\'hui', 
      time: '2h',
      icon: Package,
      color: 'text-purple-500'
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo Admin + Barre de recherche */}
        <div className="flex items-center flex-1 gap-6">
          {/* Mini Logo Admin */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">Admin Panel</span>
              <span className="text-xs text-gray-500">DocSpace</span>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
              <input
                type="text"
                placeholder="Rechercher équipements, vendeurs, commandes..."
                className="w-full py-2.5 pl-12 pr-4 text-sm border-2 border-gray-200 rounded-xl 
                focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20
                bg-gray-50 hover:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2.5 transition-all rounded-xl hover:bg-gray-100 group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl w-80 rounded-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5">
                  <h3 className="text-sm font-bold text-gray-800">
                    Notifications
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white">
                    {notifications.length}
                  </span>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                  {notifications.map((notif) => {
                    const IconComponent = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className="px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 transition-colors bg-gray-100 rounded-lg group-hover:bg-gray-200">
                            <IconComponent className={`w-4 h-4 ${notif.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="mb-1 text-sm font-medium text-gray-800 group-hover:text-[#1DBF73] transition-colors">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              Il y a {notif.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="px-4 py-3 text-center bg-gray-50">
                  <button className="text-sm font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paramètres */}
          <button className="p-2.5 transition-all rounded-xl hover:bg-gray-100 group">
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors" />
          </button>

          {/* Séparateur */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Profil */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 pr-3 transition-all rounded-xl hover:bg-gray-100"
            >
              <div className="flex items-center justify-center w-9 h-9 text-sm font-bold text-white rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] shadow-md">
                {user.prenom[0]}{user.nom[0]}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-gray-500">
                  Administrateur
                </p>
              </div>
            </button>

            {/* Dropdown Profil */}
            {showProfile && (
              <div className="absolute right-0 w-64 mt-2 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-xl">
                {/* Header du profil */}
                <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 text-base font-bold text-white rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] shadow-md">
                      {user.prenom[0]}{user.nom[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 mt-2 rounded-lg bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]">
                    <Shield className="w-3 h-3 text-white" />
                    <span className="text-xs font-semibold text-white">Administrateur</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 group">
                    <User className="w-4 h-4 text-gray-500 group-hover:text-[#1DBF73] transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-[#1DBF73] transition-colors">Mon profil</span>
                  </button>
                  
                  <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 group">
                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-[#1DBF73] transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-[#1DBF73] transition-colors">Paramètres</span>
                  </button>

                  <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 group">
                    <Stethoscope className="w-4 h-4 text-gray-500 group-hover:text-[#1DBF73] transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-[#1DBF73] transition-colors">Équipements médicaux</span>
                  </button>

                  <div className="my-2 border-t border-gray-200"></div>

                  <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-red-50 group">
                    <LogOut className="w-4 h-4 text-gray-500 transition-colors group-hover:text-red-500" />
                    <span className="font-medium text-gray-700 transition-colors group-hover:text-red-500">Déconnexion</span>
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