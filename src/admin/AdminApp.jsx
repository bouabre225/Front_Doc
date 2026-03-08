import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminAuth/AdminLogin';
import AdminHome from './pages/AdminHome';
import ManageEquipments from './pages/ManageEquipments';
import ManageUsers from './pages/ManageUsers';

const isAdminAuthenticated = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    return user.role === 'ADMIN' && !!token;
  } catch { return false; }
};

const ProtectedRoute = ({ children }) =>
  isAdminAuthenticated() ? children : <Navigate to='/admin/login' replace />;

const AdminLayout = ({ children }) => children;

function AdminApp() {
  return (
    <Routes>
      <Route path='/login' element={<AdminLogin />} />
      <Route path='/dashboard' element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
      <Route path='/equipments' element={
        <ProtectedRoute>
          <AdminHome page={<ManageEquipments />} />
        </ProtectedRoute>
      } />
      <Route path='/users' element={
        <ProtectedRoute>
          <AdminHome page={<ManageUsers />} />
        </ProtectedRoute>
      } />
      <Route path='*' element={<Navigate to='/admin/dashboard' replace />} />
    </Routes>
  );
}

export default AdminApp;