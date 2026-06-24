import React, { cloneElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, User, Globe, Home, LogOut, MessageSquare, LayoutDashboard } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";
import AdminLayout from "./AdminLayout";
import WhatsAppButton from "./WhatsAppButton";

export default function Layout({ children }) {
  const location = useLocation();
  const isDashboardPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  if (isDashboardPath) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isPublisher } = useAuth();

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Buscar', path: '/search' },
  ];

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  // Determinar la ruta del tablero según el rol
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  return (
    <header className="bg-[#edd446] fixed top-0 w-full z-50 border-b border-[#cca425] shadow-sm">
      <div className="flex justify-between items-center px-6 lg:px-12 h-20 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center">
          <Logo size="text-2xl" />
        </Link>
        <nav className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "font-bold text-sm tracking-wide transition-all pb-1 border-b-4 hover:text-[#1a1a1a]",
                location.pathname === item.path
                  ? "text-[#1a1a1a] border-[#1a1a1a]"
                  : "text-[#1a1a1a]/70 border-transparent hover:border-[#1a1a1a]/40"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={dashboardPath} className="text-[#1a1a1a]/85 hover:text-[#1a1a1a] transition-colors flex items-center gap-2 font-bold text-sm">
                <LayoutDashboard className="w-5 h-5" /> Tablero
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#1a1a1a]/60 hover:text-red-600 transition-colors p-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-[#1a1a1a]/80 hover:text-black transition-all">
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t-4 border-blue-600 bg-[#111111] text-white mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 max-w-7xl mx-auto w-full gap-8">
        <div className="text-center md:text-left">
          <div className="mb-4">
            <Logo size="text-2xl" />
          </div>
          <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} InfoCasa. Todos los derechos reservados. Más opciones, mejores decisiones.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Agentes</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Ayuda</a>
        </div>
        <div className="flex gap-4">
          <SocialIcon icon={<Globe />} />
          <SocialIcon icon={<Home />} />
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }) {
  return (
    <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-white cursor-pointer hover:bg-blue-600 transition-all hover:-translate-y-1 shadow-sm">
      {cloneElement(icon, { className: "w-5 h-5" })}
    </div>
  );
}
