import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLogin    from './AdminAuth/AdminLogin';
import AdminLayout   from './components/AdminLayout';
import AdminDashboard from './components/Dashboard';
import AdminKyc      from './components/AdminKyc';
import AdminLitiges  from './components/AdminLitiges';
import AdminUsers    from './components/AdminUsers';
import AdminAnnonces from './components/AdminAnnonces';
import AdminCommandes from './components/AdminCommandes';
import AdminStats from './components/AdminStats';
import { getMe } from '../services/api';

function AdminApp() {
  const location = useLocation();
  const [checking, setChecking] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const checkAdmin = React.useCallback(async (signal) => {
    try {
      const token = localStorage.getItem('auth_token');
      const cached = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
      if (!token) { if (!signal?.aborted) { setIsAdmin(false); setChecking(false); } return; }
      // Réponse rapide via cache, puis validation serveur
      if (cached?.role === 'admin' && !signal?.aborted) setIsAdmin(true);
      const me = await getMe();
      const user = me?.user ?? me?.data ?? me;
      if (!signal?.aborted) setIsAdmin(user?.role === 'admin');
    } catch { if (!signal?.aborted) {
      const cached = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
      setIsAdmin(cached?.role === 'admin');
    } }
    finally { if (!signal?.aborted) setChecking(false); }
  }, []);

  // Re-vérifie à chaque navigation (login → dashboard) + changement de token
  React.useEffect(() => {
    const controller = new AbortController();
    setChecking(true);
    checkAdmin(controller.signal);
    const onStorage = () => checkAdmin(controller.signal);
    window.addEventListener('storage', onStorage);
    return () => { controller.abort(); window.removeEventListener('storage', onStorage); };
  }, [location.pathname, checkAdmin]);

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
      <Route path="/stats" element={<ProtectedRoute><AdminStats /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default AdminApp;