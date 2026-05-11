import React, { cloneElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, User, Globe, Home, LogOut, LayoutDashboard, PlusCircle, MessageSquare } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";

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
    <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200 shadow-sm">
      <div className="flex justify-between items-center px-6 lg:px-12 h-20 max-w-7xl mx-auto w-full">
        <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900">
          Estate<span className="text-blue-600">Pro</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "font-bold text-sm tracking-wide transition-all pb-1 border-b-4 hover:text-blue-600",
                location.pathname === item.path 
                  ? "text-blue-600 border-blue-600" 
                  : "text-slate-600 border-transparent"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={dashboardPath} className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-bold text-sm">
                <LayoutDashboard className="w-5 h-5" /> Tablero
              </Link>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-all">
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
    <footer className="w-full border-t border-slate-200 bg-slate-50 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 max-w-7xl mx-auto w-full gap-8">
        <div className="text-center md:text-left">
          <div className="text-2xl font-black tracking-tighter text-slate-900 mb-4">Estate<span className="text-blue-600">Pro</span></div>
          <p className="text-xs text-slate-500 font-medium">© 2024 EstatePro Premium. Elevando el estándar inmobiliario.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 text-xs font-bold text-slate-500 uppercase tracking-widest">
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
    <div className="p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-600 hover:text-white transition-all hover:-translate-y-1 shadow-sm">
       {cloneElement(icon, { className: "w-5 h-5" })}
    </div>
  );
}

function AdminLayout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  return (
    <div className="flex min-h-screen bg-slate-50">
       <aside className="h-screen w-72 border-r border-slate-200 bg-white flex flex-col py-8 space-y-4 sticky top-0 hidden lg:flex shadow-2xl">
        <div className="px-10 mb-12">
          <Link to="/" className="text-2xl font-black text-slate-900 tracking-tighter block mb-1">Estate<span className="text-blue-600">Pro</span></Link>
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink 
            to={dashboardPath} 
            icon={<LayoutDashboard />} 
            label="Resumen" 
            active={location.pathname === '/admin' || location.pathname === '/dashboard'} 
          />
          
          {!isAdmin && (
            <>
              <SidebarLink 
                to="/dashboard/properties/create" 
                icon={<PlusCircle />} 
                label="Publicar" 
                active={location.pathname === '/dashboard/properties/create'} 
              />
            </>
          )}

          <SidebarLink to="/search" icon={<Search />} label="Marketplace" />
          <SidebarLink to="/profile" icon={<User />} label="Mi Perfil" active={location.pathname === '/profile'} />
        </nav>
        <div className="px-6 pt-6 border-t border-slate-100 mt-auto">
           <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-900 truncate">{user?.name || "Usuario Pro"}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user?.role || 'user'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-4 text-slate-400 hover:text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" /> Salir de sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

function SidebarLink({ icon, label, to, active = false }) {
  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-4 px-6 py-4 font-bold transition-all rounded-2xl text-sm",
        active 
          ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2" 
          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
      )}
    >
      {cloneElement(icon, { className: "w-5 h-5" })}
      {label}
    </Link>
  );
}
