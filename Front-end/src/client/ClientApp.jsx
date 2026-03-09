import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import Home from './pages/Home';
import Explore from './pages/headercontains/Explore';
import Equipment from './pages/headercontains/Equipment';
import Categories from './pages/headercontains/Categories';
import Profile from './pages/auth/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PublishEquipement from './pages/sellers/PublishEquipement';
import Notifications from './components/notifications/Notifications';
import Cart from './components/cart/Cart';

function ClientApp() {
  return (
    <LangProvider>
      <div className='min-h-screen bg-gray-50'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/explore' element={<Explore />} />
          <Route path='/equipment/:id' element={<Equipment />} />
          <Route path='/categories' element={<Categories />} />
          <Route path='/categories/:slug' element={<Categories />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/publish-equipment' element={<PublishEquipement />} />
          <Route path='/notifications' element={<Notifications />} />
        </Routes>
      </div>
    </LangProvider>
  );
}

export default ClientApp;