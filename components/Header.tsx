'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Droplets, ShoppingCart, MessageCircle, Menu } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

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

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-300 ease-in-out
        ${scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200' 
          : 'bg-transparent border-b border-transparent'
        }
        ${hidden ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              La Aldea
            </span>
            <p className={`text-xs transition-colors ${scrolled ? 'text-slate-500' : 'text-white/80'}`}>
              Tala, Uruguay
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link 
            href="/" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-white bg-white/10 hover:bg-white/20'
            }`}
          >
            Inicio
          </Link>
          <Link 
            href="/productos" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled 
                ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' 
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Productos
          </Link>
          <Link 
            href="/faq" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled 
                ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' 
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Preguntas Frecuentes
          </Link>
          <Link 
            href="/contacto" 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              scrolled 
                ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' 
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Contacto
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link 
            href="/carrito" 
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled 
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
              0
            </span>
          </Link>

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
            className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              scrolled 
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
