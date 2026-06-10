import React, { cloneElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Search, User, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";

export default function AdminLayout({ children }) {
  const { user, logout, isAdmin, isPublisher } = useAuth();
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
          />
          
          {(isAdmin || isPublisher) && (
            <SidebarLink 
              to="/dashboard/properties/create" 
              icon={<PlusCircle />} 
              label="Publicar" 
              active={location.pathname === '/dashboard/properties/create'} 
            />
          )}

          <SidebarLink to="/search" icon={<Search />} label="Marketplace" />
          <SidebarLink to="/profile" icon={<User />} label="Mi Perfil" active={location.pathname === '/profile'} />
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
