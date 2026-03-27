'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_PHONE } from '@/lib/constants';

export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const isProductPage = pathname.startsWith('/productos/');

  // Hide on product detail pages — they already have WhatsApp CTAs
  useEffect(() => {
    if (isProductPage) {
      setVisible(false);
      return;
    }

    if (!isHomepage) {
      const handleScroll = () => {
        setVisible(window.scrollY > 100);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      const handleScroll = () => {
        setVisible(window.scrollY > window.innerHeight * 0.85);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isHomepage, isProductPage]);

  return (
    <a
      href={`https://wa.me/${WHATSAPP_PHONE}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-600 hover:scale-110 hover:shadow-xl ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
