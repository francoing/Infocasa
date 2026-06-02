import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const SearchPage = lazy(() => import('../features/search/pages/SearchPage'));
const PropertyDetailPage = lazy(() => import('../features/property/pages/PropertyDetailPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const AdminPage = lazy(() => import('../features/admin/pages/AdminPage'));
const CreatePropertyPage = lazy(() => import('../features/property/pages/CreatePropertyPage'));
const EditPropertyPage = lazy(() => import('../features/property/pages/EditPropertyPage'));
const ProfilePage = lazy(() => import('../features/auth/pages/ProfilePage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
    <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Cargando InfoCasa...</p>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
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

          {/* Rutas Protegidas - Owner, Agent & Admin */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['owner', 'agent', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/properties/create" 
            element={
              <ProtectedRoute allowedRoles={['owner', 'agent', 'admin']}>
                <CreatePropertyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/properties/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['owner', 'agent', 'admin']}>
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
