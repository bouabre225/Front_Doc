import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import { X } from 'lucide-react';

function AdminHome({ page }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-gray-50'>

      {/* Sidebar desktop */}
      <div className='flex-shrink-0 hidden lg:block'>
        <AdminSidebar />
      </div>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-50 flex lg:hidden'>
          <div className='fixed inset-0 bg-black/50' onClick={() => setSidebarOpen(false)} />
          <div className='relative z-50 flex-shrink-0'>
            <AdminSidebar />
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className='absolute z-50 p-2 bg-white rounded-full shadow-lg top-3 right-3'>
            <X className='w-4 h-4 text-gray-600' />
          </button>
        </div>
      )}

      {/* Contenu */}
      <div className='flex flex-col flex-1 min-w-0'>
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className='flex-1 overflow-y-auto'>
          {page || <Dashboard />}
        </main>
      </div>
    </div>
  );
}

export default AdminHome;