import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut, ChevronDown, Wallet } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import WalletModal from "../../features/infocoins/components/WalletModal";

/**
 * Avatar del usuario logueado en el header. Al hacer click despliega un card con
 * accesos: Mi billetera, Tablero, Publicar (solo owner/agent) y Cerrar sesión.
 */
export default function UserMenu() {
  const navigate = useNavigate();
  const { user, logout, isPublisher } = useAuth();
  const [open, setOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const firstName = user?.name?.split(" ")[0] || "";

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  const handleOpenWallet = () => {
    setOpen(false);
    setWalletOpen(true);
  };

  const handleBuyPackages = () => {
    setWalletOpen(false);
    // Por ahora navegamos a una ruta de la tienda. La creamos en el 3.7.4.
    navigate("/infocoins/comprar");
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 group"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="hidden sm:block font-bold text-sm text-[#1a1a1a]/85 group-hover:text-[#1a1a1a] transition-colors">
            Hola, {firstName}
          </span>
          <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm overflow-hidden ring-2 ring-white/60 shadow-sm">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-[#1a1a1a]/60 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">
            <div className="flex items-center gap-3 p-4 bg-slate-50 border-b border-slate-100">
              <span className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <nav className="p-2">
              <MenuItem
                icon={<Wallet className="w-4 h-4" />}
                label="Mi billetera"
                onClick={handleOpenWallet}
              />
              <MenuItem
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Tablero"
                onClick={() => go("/dashboard")}
              />
              {isPublisher && (
                <MenuItem
                  icon={<PlusCircle className="w-4 h-4" />}
                  label="Publicar"
                  onClick={() => go("/dashboard/properties/create")}
                />
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </nav>
          </div>
        )}
      </div>

      <WalletModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        onBuyPackages={handleBuyPackages}
      />
    </>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
    >
      {icon} {label}
    </button>
  );
}
