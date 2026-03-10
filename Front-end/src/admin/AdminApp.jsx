import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminAuth/AdminLogin';
import AdminHome from './pages/AdminHome';
import AdminKyc from './components/AdminKyc';
import AdminLitiges from './components/AdminLitiges';
import AdminUsers from './components/AdminUsers';
import AdminAnnonces from './components/AdminAnnonces';
import AdminCommandes from './components/AdminCommandes';

function AdminApp() {
  // Vérifier si l'admin est connecté
  const isAdminAuthenticated = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  };

  // Composant pour protéger les routes admin
  const ProtectedRoute = ({ children }) => {
    return isAdminAuthenticated() ? children : <Navigate to="/admin/login" replace />;
  };

  return (
    <Routes>
      {/* Route de connexion admin */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Routes protégées */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminHome />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/kyc"
        element={
          <ProtectedRoute>
            <AdminKyc />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/litiges"
        element={
          <ProtectedRoute>
            <AdminLitiges />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/annonces"
        element={
          <ProtectedRoute>
            <AdminAnnonces />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/commandes"
        element={
          <ProtectedRoute>
            <AdminCommandes />
          </ProtectedRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default AdminApp;