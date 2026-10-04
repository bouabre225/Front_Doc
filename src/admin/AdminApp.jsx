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
import { getMe } from '../services/api';

function AdminApp() {
  const [checking, setChecking] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) { if (!cancelled) { setIsAdmin(false); setChecking(false); } return; }
        const me = await getMe();
        const user = me?.user ?? me?.data ?? me;
        if (!cancelled) setIsAdmin(user?.role === 'admin');
      } catch { if (!cancelled) setIsAdmin(false); }
      finally { if (!cancelled) setChecking(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (checking) return <div className='p-10 text-center'>Vérification...</div>;
    return isAdmin
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