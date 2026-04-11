'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), {
  ssr: false,
});

const FloatingWhatsApp = dynamic(() => import('@/components/common/FloatingWhatsApp'), {
  ssr: false,
});

const CookieConsent = dynamic(() => import('@/components/common/CookieConsent'), {
  ssr: false,
});

const ScrollToTop = dynamic(() => import('@/components/common/ScrollToTop'), {
  ssr: false,
});

const NavigationProgress = dynamic(() => import('@/components/common/NavigationProgress'), {
  ssr: false,
});

const WhatsAppClickTracker = dynamic(() => import('@/components/common/WhatsAppClickTracker'), {
  ssr: false,
});

export default function ClientLayoutElements() {
  const pathname = usePathname();

  // None of these belong in the admin panel
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <NavigationProgress />
      <WhatsAppClickTracker />
      <CartDrawer />
      <FloatingWhatsApp />
      <ScrollToTop />
      <CookieConsent />
    </>
  );
}