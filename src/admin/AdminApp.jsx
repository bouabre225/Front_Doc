import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin    from './AdminAuth/AdminLogin';
import AdminLayout   from './components/AdminLayout';
import AdminDashboard from './components/Dashboard';
import AdminKyc      from './components/AdminKyc';
import AdminLitiges  from './components/AdminLitiges';
import AdminUsers    from './components/AdminUsers';
import AdminAnnonces from './components/AdminAnnonces';
import AdminCommandes from './components/AdminCommandes';

function AdminApp() {
  const isAdminAuthenticated = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'admin';
    } catch { return false; }
  };

  const ProtectedRoute = ({ children }) => {
    return isAdminAuthenticated()
      ? <AdminLayout>{children}</AdminLayout>
      : <Navigate to="/admin/login" replace />;
  };

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/kyc"       element={<ProtectedRoute><AdminKyc /></ProtectedRoute>} />
      <Route path="/litiges"   element={<ProtectedRoute><AdminLitiges /></ProtectedRoute>} />
      <Route path="/users"     element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="/annonces"  element={<ProtectedRoute><AdminAnnonces /></ProtectedRoute>} />
      <Route path="/commandes" element={<ProtectedRoute><AdminCommandes /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default AdminApp;