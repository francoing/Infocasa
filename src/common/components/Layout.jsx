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
        <main className="flex-grow pt-20 lg:pt-32">
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
              : scrolled
              ? "shadow-[0_4px_20px_rgba(74,74,73,0.15)]"
              : "shadow-none"
          )}
          style={{ background: BRAND.gold }}
        >
          <div className="relative flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-12 h-20 lg:h-32 max-w-7xl mx-auto w-full">
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
                  size="text-3xl"
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
    MOBILE MENU
    ============================================================ */
  function MobileMenu({ open, onClose, navItems, user }) {
    const location = useLocation();

    return (
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-[#4a4a49]/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <aside
          className={cn(
            "absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl",
            "flex flex-col transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div
            className="flex items-center justify-between px-5 h-20 border-b border-[#ffda31]"
            style={{ background: BRAND.gold }}
          >
            <Link to="/" onClick={onClose} className="flex items-center">
              <Logo size="text-xl" className="h-12 w-auto object-contain" />
            </Link>
            <button
              onClick={onClose}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[#4a4a49] hover:bg-white/40 transition"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-bold transition-colors border-l-4",
                    active
                      ? "bg-[#ffda31]/60 text-[#4a4a49] border-[#ff0019]"
                      : "text-[#4a4a49] hover:bg-[#ffda31]/30 border-transparent"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {!user && (
            <div className="p-4 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="block text-center w-full px-4 py-3 rounded-xl text-sm font-bold text-[#4a4a49] bg-[#ffda31]/50 hover:bg-[#ffda31]/70 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block text-center w-full px-4 py-3 rounded-xl text-sm font-black text-white transition-colors shadow-lg"
                style={{
                  background: BRAND.red,
                  boxShadow: `0 10px 25px -8px ${BRAND.red}80`,
                }}
              >
                Publicar propiedad
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
              <SocialIcon href="#">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
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
            © {new Date().getFullYear()} Infocasa. Todos los derechos reservados.
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