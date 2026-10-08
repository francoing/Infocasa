  import React, { useState, useEffect } from "react";
  import { Link, useLocation } from "react-router-dom";
  import { Menu, X } from "lucide-react";
  import { cn } from "../../lib/utils";
  import { useAuth } from "../../hooks/useAuth";
  import Logo from "./Logo";
  import FooterLogo from "./FooterLogo";
  import AdminLayout from "./AdminLayout";
  import UserMenu from "./UserMenu";
  import WhatsAppButton from "./WhatsAppButton";
  import EmailVerificationBanner from "./EmailVerificationBanner";

  // Paleta corporativa (según manual de marca)
  const BRAND = {
    red: "#ff0019",
    gold: "#ffda31",
    gray: "#1a1a1a",
  };
    
  // Rutas con fondo rojo → header con sombra reforzada
const RED_BACKGROUND_ROUTES = [
  "/",                    // ← Inicio
  "/sobre-nosotros",
  "/search",
  "/noticias",
  "/contacto",
  "/explore",             // ← Explorar mapa
];
  export default function Layout({ children }) {
    const location = useLocation();
    const isDashboardPath =
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/dashboard");
    const isHome = location.pathname === "/";

    if (isDashboardPath) {
      return <AdminLayout>{children}</AdminLayout>;
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Header isHome={isHome} />
        <main className="flex-grow pt-16 lg:pt-20">
          <EmailVerificationBanner />
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  /* ============================================================
    HEADER
    ============================================================ */
  function Header({ isHome = false }) {
    const location = useLocation();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }, [mobileOpen]);

    const navItems = [
      { name: "Marketplace", path: "/search" },
      { name: "Explorar mapa", path: "/explore" },
      { name: "Sobre nosotros", path: "/sobre-nosotros" },
      { name: "Noticias", path: "/noticias" },
      { name: "Contacto", path: "/contacto" },
    ];

    const hasRedBackground = RED_BACKGROUND_ROUTES.some(
      (p) => location.pathname === p || location.pathname.startsWith(p + "/")
    );

    return (
      <>
        <header
          className={cn(
            "fixed top-0 left-0 w-full z-50 transition-all duration-300",
            hasRedBackground
              ? "shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
              : "shadow-[0_4px_20px_rgba(74,74,73,0.15)]"
          )}
          style={{ background: BRAND.gold }}
        >
          <div className="relative flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-12 h-16 lg:h-20 max-w-7xl mx-auto w-full">
            {/* IZQUIERDA: mobile/tablet → hamburguesa | desktop → logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
              {/* Hamburguesa solo en mobile y tablet */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#4a4a49] hover:bg-white/30 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo SOLO en desktop, SIN BackButton al lado */}
              <Link
                to="/"
                className="hidden lg:flex items-center group"
                aria-label="Ir al inicio"
              >
                <Logo
                  size="text-2xl"
                  className="h-28 w-auto object-contain transition-transform group-hover:scale-[1.03]"
                />
              </Link>
            </div>

            {/* CENTRO: logo en mobile y tablet */}
            <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
              <Link to="/" className="flex items-center" aria-label="Ir al inicio">
                <Logo
                  size="text-3xl"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </Link>
            </div>

            {/* CENTRO: nav en desktop */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1">
              {navItems.map((item) => {
                const active =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "group relative px-4 py-2 rounded-full text-sm font-bold tracking-wide whitespace-nowrap transition-all duration-200",
                      active
                        ? "text-[#4a4a49] bg-white/40 hover:bg-[#ff0019] hover:text-white"
                        : "text-[#4a4a49]/85 hover:bg-[#ff0019] hover:text-white"
                    )}
                  >
                    {item.name}
                    {active && (
                      <span
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 bottom-0.5 h-[3px] w-6 rounded-full transition-colors duration-200",
                          "bg-[#ff0019] group-hover:bg-white"
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* DERECHA: acciones */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex text-sm font-bold text-[#4a4a49] px-4 py-2 rounded-full hover:bg-white/30 transition-all whitespace-nowrap"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex items-center text-white px-5 py-2.5 rounded-full text-sm font-black transition-all active:scale-95 whitespace-nowrap"
                    style={{
                      background: BRAND.red,
                      boxShadow: `0 10px 25px -8px ${BRAND.red}80`,
                    }}
                  >
                    Publicar propiedad
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* FRANJA ROJA DELGADA INFERIOR */}
          <div className="h-1 w-full" style={{ background: BRAND.red }} />
        </header>

        <MobileMenu
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          navItems={navItems}
          user={user}
        />
      </>
    );
  }

  
  /* ============================================================
  MOBILE MENU (HEADER ROJO + OPCIONES PULIDAS)
  ============================================================ */
function MobileMenu({ open, onClose, navItems, user }) {
  const location = useLocation();

  // Iconos SVG para cada opción del menú
  const menuIcons = {
    "Marketplace": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    "Explorar mapa": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
      </svg>
    ),
    "Sobre nosotros": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
    "Noticias": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
      </svg>
    ),
    "Contacto": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!open}
    >
      {/* Overlay oscuro con blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menú lateral */}
      <aside
        className={cn(
          "absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header rojo con "Menú" */}
        <div
          className="flex items-center justify-between px-6 h-20 border-b-4"
          style={{ 
            background: BRAND.red,
            borderColor: BRAND.gold
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-white text-2xl font-black tracking-wide">
              Menú
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items de navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1.5">
            {navItems.map((item, index) => {
              const active =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-4 px-5 py-4 rounded-xl text-base font-bold transition-all duration-300 overflow-hidden",
                    active
                      ? "text-white shadow-lg"
                      : "text-[#4a4a49] hover:text-[#4a4a49]"
                  )}
                  style={{
                    background: active 
                      ? `linear-gradient(135deg, ${BRAND.red} 0%, #ff334d 100%)`
                      : "transparent",
                    boxShadow: active ? `0 8px 20px -6px ${BRAND.red}60` : "none",
                    transform: active ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {/* Fondo hover sutil */}
                  {!active && (
                    <div className="absolute inset-0 bg-[#ffda31]/0 group-hover:bg-[#ffda31]/15 transition-colors duration-300 rounded-xl" />
                  )}
                  
                  {/* Icono */}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                    active 
                      ? "bg-white/20 text-white" 
                      : "bg-[#ffda31]/30 text-[#4a4a49] group-hover:bg-[#ffda31]/50 group-hover:scale-110"
                  )}>
                    {menuIcons[item.name]}
                  </div>

                  {/* Texto */}
                  <span className="relative z-10 flex-1 tracking-wide">
                    {item.name}
                  </span>

                  {/* Flecha indicadora */}
                  <svg 
                    className={cn(
                      "relative z-10 w-5 h-5 transition-all duration-300",
                      active 
                        ? "translate-x-0 opacity-100 text-white" 
                        : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                    )}
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>

                  {/* Borde izquierdo activo */}
                  {active && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{ background: BRAND.gold }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Separador decorativo */}
          <div className="my-6 flex items-center gap-3 px-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ffda31]/50 to-transparent" />
            <div className="w-2 h-2 rounded-full" style={{ background: BRAND.gold }} />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ffda31]/50 to-transparent" />
          </div>

          {/* Info de contacto rápida */}
          <div className="px-5 py-4 rounded-xl bg-[#ffda31]/10 border border-[#ffda31]/30">
            <p className="text-xs font-bold text-[#4a4a49] uppercase tracking-wider mb-1">
              ¿Necesitas ayuda?
            </p>
            <p className="text-xs text-[#4a4a49]/70">
              Escríbenos por WhatsApp o email
            </p>
          </div>
        </nav>

        {/* Botones de autenticación */}
        {!user && (
          <div className="p-5 border-t-2 border-slate-100 space-y-3 bg-gradient-to-t from-slate-50 to-white">
            <Link
              to="/login"
              onClick={onClose}
              className="group relative flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-bold text-[#4a4a49] bg-[#ffda31]/30 hover:bg-[#ffda31]/50 transition-all overflow-hidden"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="group relative flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-black text-white transition-all shadow-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${BRAND.red} 0%, #ff334d 100%)`,
                boxShadow: `0 10px 25px -8px ${BRAND.red}90`,
              }}
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
              </svg>
              Publicar propiedad
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

  /* ============================================================
    FOOTER
    ============================================================ */
  function Footer() {
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
      <footer
        className={cn(
          "w-full bg-[#1a1a1a] text-white",
          isHome ? "mt-0" : "mt-20"
        )}
      >
        <div className="h-1.5 w-full" style={{ background: BRAND.gold }} />
        <div className="h-1 w-full" style={{ background: BRAND.red }} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)] gap-12 px-12 py-16 max-w-7xl mx-auto w-full">
          <div className="md:col-span-2 lg:col-span-1 text-center lg:text-left">
            <div className="mb-4 flex justify-center lg:justify-start">
              <FooterLogo size="text-2xl" />
            </div>
            <p className="text-sm text-slate-300 font-medium mb-6">
              Más opciones, mejores decisiones.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <SocialIcon href="https://www.instagram.com/infocasa.com.ar/">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://www.facebook.com/profile.php?id=61594163471679">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BRAND.gold }}>
              Plataforma
            </h3>
            <ul className="space-y-4">
              <li><Link to="/search" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Comprar</Link></li>
              <li><Link to="/search" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Alquilar</Link></li>
              <li><Link to="/search" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Temporario</Link></li>
              <li><Link to="/register" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Publicar propiedad</Link></li>
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BRAND.gold }}>
              Empresa
            </h3>
            <ul className="space-y-4">
              <li><Link to="/sobre-nosotros" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Nosotros</Link></li>
              <li><Link to="/noticias" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Noticias</Link></li>
              <li><Link to="/contacto" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Contacto</Link></li>
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BRAND.gold }}>
              Legal
            </h3>
            <ul className="space-y-4">
              <li><Link to="/terminos-y-condiciones" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Términos y condiciones</Link></li>
              <li><Link to="/politica-de-privacidad" className="text-xs text-slate-300 font-medium hover:text-[#ffda31] hover:translate-x-0.5 transition-all block">Política de privacidad</Link></li>            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-12 py-6 max-w-7xl mx-auto w-full">
          <p className="text-xs text-slate-400 font-medium text-center">
            © 2026 Infocasa. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    );
  }

  function SocialIcon({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white/10 rounded-xl border border-white/10 text-white cursor-pointer transition-all hover:-translate-y-1 shadow-sm inline-flex items-center justify-center"
        onMouseEnter={(e) => (e.currentTarget.style.background = BRAND.red)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      >
        {children}
      </a>
    );
  } 