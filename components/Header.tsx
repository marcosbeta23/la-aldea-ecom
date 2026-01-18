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
        ${scrolled || !isHomepage
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
              scrolled || !isHomepage
                ? 'text-blue-600 bg-blue-50' 
                : 'text-white bg-white/10 hover:bg-white/20'
            }`}
          >
            Inicio
          </Link>
          <Link 
            href="/productos" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled || !isHomepage
                ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' 
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Productos
          </Link>
          <Link 
            href="/faq" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled || !isHomepage
                ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' 
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Preguntas Frecuentes
          </Link>
          <Link 
            href="/contacto" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled || !isHomepage
                ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' 
                : 'text-white/90 hover:bg-white/10'
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
              scrolled || !isHomepage
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
            iconClassName="h-5 w-5"
            scrolled={scrolled || !isHomepage}
          />

          {/* Cart Icon */}
          <CartWidget 
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled || !isHomepage
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
            iconClassName="h-5 w-5"
            scrolled={scrolled || !isHomepage}
          />

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/59892744725"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/25 transition-all hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/30"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled || !isHomepage
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40 lg:hidden">
          <nav className="flex flex-col p-4 space-y-2">
            <Link 
              href="/" 
              className="px-4 py-3 text-base font-medium rounded-lg transition-colors text-slate-900 hover:bg-slate-100"
            >
              Inicio
            </Link>
            <Link 
              href="/productos" 
              className="px-4 py-3 text-base font-medium rounded-lg transition-colors text-slate-900 hover:bg-slate-100"
            >
              Productos
            </Link>
            <Link 
              href="/cart" 
              className="px-4 py-3 text-base font-medium rounded-lg transition-colors text-slate-900 hover:bg-slate-100"
            >
              Carrito
            </Link>
            <Link 
              href="/wishlist" 
              className="px-4 py-3 text-base font-medium rounded-lg transition-colors text-slate-900 hover:bg-slate-100"
            >
              Lista de Deseos
            </Link>
            <Link 
              href="/faq" 
              className="px-4 py-3 text-base font-medium rounded-lg transition-colors text-slate-900 hover:bg-slate-100"
            >
              Preguntas Frecuentes
            </Link>
            <Link 
              href="/contacto" 
              className="px-4 py-3 text-base font-medium rounded-lg transition-colors text-slate-900 hover:bg-slate-100"
            >
              Contacto
            </Link>
            
            <div className="pt-4 border-t border-slate-200">
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
      )}
    </header>
  );
}
