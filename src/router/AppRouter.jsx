import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../common/components/Layout';
import loadingIcon from '../assets/img/Icono.png';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const SearchPage = lazy(() => import('../features/search/pages/SearchPage'));
const PropertyDetailPage = lazy(() => import('../features/property/pages/PropertyDetailPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const CreatePropertyPage = lazy(() => import('../features/property/pages/CreatePropertyPage'));
const EditPropertyPage = lazy(() => import('../features/property/pages/EditPropertyPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const EmailVerifiedPage = lazy(() => import('../features/auth/pages/EmailVerifiedPage'));
const SharePage = lazy(() => import('../features/share/pages/SharePage'));
const ExplorePage = lazy(() => import('../features/explore/pages/ExplorePage'));
const TermsPage = lazy(() => import('../features/legal/pages/TermsPage'));
const PrivacyPage = lazy(() => import('../features/legal/pages/PrivacyPage'));
const SobreNosotrosPage = lazy(() => import('../features/legal/pages/SobreNosotrosPage'));
const NoticiasPage = lazy(() => import('../features/legal/pages/NoticiasPage'));
const ContactoPage = lazy(() => import('../features/legal/pages/ContactoPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
    <img
      src={loadingIcon}
      alt="Cargando..."
      className="w-20 h-20 object-contain animate-heartbeat mb-4"
    />
    <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">
      Cargando InfoCasa...
    </p>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* RUTAS CON LAYOUT PÚBLICO (header + footer) */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/email-verified" element={<EmailVerifiedPage />} />
            <Route path="/terminos-y-condiciones" element={<TermsPage />} />
            <Route path="/politica-de-privacidad" element={<PrivacyPage />} />
            <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/share/:propertyId?" element={<SharePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/explore/:operation" element={<ExplorePage />} />

            {/* Rutas protegidas que usan el mismo Layout */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
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
          </Route>

          {/* Admin redirige al dashboard */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;