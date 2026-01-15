import React from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';

function AdminHome() {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar fixe à gauche */}
      <AdminSidebar />
      
      {/* Contenu principal */}
      <div className='flex flex-col flex-1'>
        {/* Header en haut */}
        <AdminHeader />
        
        {/* Dashboard avec les stats */}
        <main className='flex-1 overflow-y-auto'>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default AdminHome;