import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";
import FooterLogo from "./FooterLogo";
import AdminLayout from "./AdminLayout";
import UserMenu from "./UserMenu";
import BackButton from "./BackButton";
import WhatsAppButton from "./WhatsAppButton";
import EmailVerificationBanner from "./EmailVerificationBanner";

export default function Layout({ children }) {
  const location = useLocation();
  const isDashboardPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');
  const isHome = location.pathname === "/";

  if (isDashboardPath) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header isHome={isHome} />
      <main className="flex-grow pt-20">
        <EmailVerificationBanner />
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Header({ isHome = false }) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [];

  return (
    <header className="bg-[#edd446] fixed top-0 w-full z-50 border-b border-[#cca425] shadow-sm">
      <div className="flex justify-between items-center px-6 lg:px-12 h-20 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-1 sm:gap-3">
          {!isHome && <BackButton className="text-[#1a1a1a] -ml-2" />}
          <Link to="/" className="flex items-center gap-2">
            <img src="/img/Icono.png" alt="Infocasa" className="h-9 w-auto object-contain" />
            <Logo size="text-2xl" className="hidden sm:block" />
          </Link>
        </div>
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
            <UserMenu />
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
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <footer className={cn(
      "w-full border-t-4 border-[#ff0019] bg-[#111111] text-white",
      isHome ? "mt-0" : "mt-20"
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)] gap-12 px-12 py-16 max-w-7xl mx-auto w-full">
        {/* Brand column */}
        <div className="md:col-span-2 lg:col-span-1 text-center lg:text-left">
          <div className="mb-4 flex justify-center lg:justify-start">
            <FooterLogo size="text-2xl" />
          </div>
          <p className="text-sm text-slate-400 font-medium mb-6">Más opciones, mejores decisiones.</p>
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

        {/* Plataforma column */}
        <div className="text-center lg:text-left">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Plataforma</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Comprar</a></li>
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Alquilar</a></li>
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Temporario</a></li>
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Publicar propiedad</a></li>
          </ul>
        </div>

        {/* Empresa column */}
        <div className="text-center lg:text-left">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Empresa</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Nosotros</a></li>
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Blog</a></li>
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Trabaja con nosotros</a></li>
          </ul>
        </div>

        {/* Legal column */}
        <div className="text-center lg:text-left">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Legal</h3>
          <ul className="space-y-4">
            <li><Link to="/terminos-y-condiciones" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Términos y condiciones</Link></li>
            <li><Link to="/politica-de-privacidad" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Política de privacidad</Link></li>
            <li><a href="#" className="text-xs text-slate-400 font-medium hover:text-[#ff0019] hover:translate-x-0.5 transition-all block">Defensa al consumidor</a></li>
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
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
      className="p-2 bg-white/10 rounded-xl border border-white/10 text-white cursor-pointer hover:bg-[#ff0019] transition-all hover:-translate-y-1 shadow-sm inline-flex items-center justify-center"
    >
      {children}
    </a>
  );
}
