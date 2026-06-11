import React, { cloneElement, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Search, User, LogOut, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";
import WhatsAppButton from "./WhatsAppButton";

export default function AdminLayout({ children }) {
  const { user, logout, isAdmin, isPublisher } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const sidebarContent = (
    <>
      {/* Mobile header: logo + close button */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between lg:hidden">
        <Link to="/" className="block">
          <Logo size="text-2xl" />
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop header: logo + gold line */}
      <div className="hidden lg:block px-10 mb-12">
        <Link to="/" className="block mb-2">
          <Logo size="text-2xl" />
        </Link>
        <div className="h-1 w-12 bg-[#cca425] rounded-full"></div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <SidebarLink
          to={dashboardPath}
          icon={<LayoutDashboard />}
          label="Resumen"
          active={location.pathname === '/admin' || location.pathname === '/dashboard'}
          onClick={() => setSidebarOpen(false)}
        />
        {(isAdmin || isPublisher) && (
          <SidebarLink 
            to="/dashboard/properties/create" 
            icon={<PlusCircle />} 
            label="Publicar" 
            active={location.pathname === '/dashboard/properties/create'} 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <SidebarLink to="/search" icon={<Search />} label="Marketplace" onClick={() => setSidebarOpen(false)} />
        <SidebarLink to="/profile" icon={<User />} label="Mi Perfil" active={location.pathname === '/profile'} onClick={() => setSidebarOpen(false)} />
      </nav>
      <div className="px-6 pt-6 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
            {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="h-screen w-72 border-r border-slate-200 bg-white flex-col py-8 space-y-4 sticky top-0 hidden lg:flex shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 border-r border-slate-200 bg-white flex-col py-8 space-y-4 shadow-2xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile header with hamburger */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center gap-4 bg-white border-b border-slate-200 px-6 py-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Logo size="text-xl" />
      </div>

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">{children}</main>
      <WhatsAppButton />
    </div>
  );
}

function SidebarLink({ icon, label, to, active = false, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
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


