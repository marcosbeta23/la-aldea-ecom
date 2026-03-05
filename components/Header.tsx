'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Droplets, MessageCircle, Menu, X } from 'lucide-react';
import CartWidget from '@/components/cart/CartWidget';
import WishlistWidget from '@/components/cart/WishlistWidget';

export default function Header() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      // Navbar background change
      setScrolled(currentScroll > 50);
      
      // Hide/show logic
      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down & past threshold
        setHidden(true);
      } else {
        // Scrolling up
        setHidden(false);
      }
      
      setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-300 ease-in-out
        ${scrolled || !isHomepage || mobileMenuOpen
          ? 'bg-white shadow-sm border-b border-slate-200' 
          : 'bg-transparent border-b border-transparent'
        }
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" aria-label="La Aldea - Ir a página de inicio">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className={`text-xl font-bold transition-colors ${scrolled || !isHomepage ? 'text-slate-900' : 'text-white'}`}>
              La Aldea
            </span>
            <p className={`text-xs transition-colors ${scrolled || !isHomepage ? 'text-slate-500' : 'text-white/80'}`}>
              Tala, Uruguay
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link 
            href="/" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/'
                ? (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-white bg-white/10')
                : (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    : 'text-white/90 hover:bg-white/10')
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname.startsWith('/productos')
                ? (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-white bg-white/10')
                : (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    : 'text-white/90 hover:bg-white/10')
            }`}
          >
            Tienda
          </Link>
          <Link
            href="/faq"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/faq'
                ? (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-white bg-white/10')
                : (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    : 'text-white/90 hover:bg-white/10')
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/blog"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/blog' || pathname.startsWith('/guias')
                ? (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-white bg-white/10')
                : (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    : 'text-white/90 hover:bg-white/10')
            }`}
          >
            Blog
          </Link>
          <Link
            href="/contacto"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === '/contacto'
                ? (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-white bg-white/10')
                : (scrolled || !isHomepage || mobileMenuOpen
                    ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    : 'text-white/90 hover:bg-white/10')
            }`}
          >
            Contacto
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Wishlist Icon */}
          <WishlistWidget 
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled || !isHomepage || mobileMenuOpen
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
            iconClassName="h-5 w-5"
            scrolled={scrolled || !isHomepage || mobileMenuOpen}
          />

          {/* Cart Icon */}
          <CartWidget 
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled || !isHomepage || mobileMenuOpen
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
            iconClassName="h-5 w-5"
            scrolled={scrolled || !isHomepage || mobileMenuOpen}
          />

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/59892744725"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-700/25 transition-all hover:bg-green-800 hover:shadow-xl hover:shadow-green-700/30"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled || !isHomepage || mobileMenuOpen
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`
          lg:hidden absolute left-0 right-0 top-full w-full
          bg-white shadow-lg border-t border-slate-200
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }
        `}
        style={{ maxHeight: mobileMenuOpen ? 'calc(100vh - 64px)' : '0' }}
      >
        <nav className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <Link 
            href="/" 
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname === '/' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Inicio
          </Link>
          <Link 
            href="/productos" 
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname.startsWith('/productos')
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tienda
          </Link>
          <Link
            href="/cart" 
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname === '/cart'
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Carrito
          </Link>
          <Link 
            href="/wishlist" 
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname === '/wishlist'
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Lista de Deseos
          </Link>
          <Link
            href="/blog"
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname === '/blog' || pathname.startsWith('/guias')
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Blog
          </Link>
          <Link
            href="/faq"
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname === '/faq'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Preguntas Frecuentes
          </Link>
          <Link
            href="/contacto"
            className={`px-6 py-4 text-base font-medium transition-colors border-b border-slate-100 ${
              pathname === '/contacto'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-900 hover:bg-slate-50'
            }`}
          >
            Contacto
          </Link>
          
          <div className="p-6">
            <a
              href="https://wa.me/59892744725"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-green-600"
            >
              <MessageCircle className="h-5 w-5" />
              Contactar por WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
