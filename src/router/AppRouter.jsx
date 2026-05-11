import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../features/home/pages/HomePage';
import SearchPage from '../features/search/pages/SearchPage';
import PropertyDetailPage from '../features/property/pages/PropertyDetailPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import AdminPage from '../features/admin/pages/AdminPage';
import CreatePropertyPage from '../features/property/pages/CreatePropertyPage';
import EditPropertyPage from '../features/property/pages/EditPropertyPage';
import ProfilePage from '../features/auth/pages/ProfilePage';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Protegidas - General (Cualquier usuario logueado) */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Rutas Protegidas - Publisher & Admin */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['publisher', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/properties/create" 
          element={
            <ProtectedRoute allowedRoles={['publisher', 'admin']}>
              <CreatePropertyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/properties/edit/:id" 
          element={
            <ProtectedRoute allowedRoles={['publisher', 'admin']}>
              <EditPropertyPage />
            </ProtectedRoute>
          } 
        />

        {/* Rutas Protegidas - Admin Only */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
