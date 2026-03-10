import React from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <AdminSidebar />
      <div className='flex flex-col flex-1 min-w-0'>
        <AdminHeader />
        <main className='flex-1 overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  );
}