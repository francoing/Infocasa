import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const SearchPage = lazy(() => import('../features/search/pages/SearchPage'));
const PropertyDetailPage = lazy(() => import('../features/property/pages/PropertyDetailPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const AdminPage = lazy(() => import('../features/admin/pages/AdminPage'));
const CreatePropertyPage = lazy(() => import('../features/property/pages/CreatePropertyPage'));
const EditPropertyPage = lazy(() => import('../features/property/pages/EditPropertyPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const EmailVerifiedPage = lazy(() => import('../features/auth/pages/EmailVerifiedPage'));
const SharePage = lazy(() => import('../features/share/pages/SharePage'));
const ExplorePage = lazy(() => import('../features/explore/pages/ExplorePage'));

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />

          {/* Ruta de Compartir - Pública */}
          <Route path="/share/:propertyId?" element={<SharePage />} />

          {/* Exploración por mapa */}
          <Route path="/explore/:operation" element={<ExplorePage />} />

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
              <ProtectedRoute allowedRoles={['owner', 'agent', 'admin', 'buyer']}>
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
              <Navigate to="/dashboard" replace />
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
