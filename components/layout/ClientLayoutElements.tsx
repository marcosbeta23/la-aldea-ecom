'use client';

import { useEffect, useState } from 'react';
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
  const [enhancementsReady, setEnhancementsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const enableEnhancements = () => setEnhancementsReady(true);

    if ('requestIdleCallback' in window) {
      idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(enableEnhancements, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(enableEnhancements, 1200);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
    };
  }, []);

  // None of these belong in the admin panel
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <CartDrawer />
      {enhancementsReady && (
        <>
          <NavigationProgress />
          <WhatsAppClickTracker />
          <FloatingWhatsApp />
          <ScrollToTop />
          <CookieConsent />
        </>
      )}
    </>
  );
}