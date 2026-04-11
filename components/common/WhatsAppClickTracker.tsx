'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';

function resolveSource(anchor: HTMLAnchorElement, pathname: string, channel: 'whatsapp' | 'phone'): string {
  const explicitSource =
    channel === 'whatsapp'
      ? anchor.dataset.whatsappSource ||
        anchor.closest<HTMLElement>('[data-whatsapp-source]')?.dataset.whatsappSource
      : anchor.dataset.phoneSource ||
        anchor.closest<HTMLElement>('[data-phone-source]')?.dataset.phoneSource;

  if (explicitSource) return explicitSource;

  if (channel === 'phone') {
    if (pathname === '/contacto') return 'contact_page';
    if (pathname === '/servicios') return 'services_page';
    if (pathname === '/') return 'homepage';
    if (pathname.startsWith('/nosotros')) return 'about_page';
    if (pathname.startsWith('/pendiente')) return 'pending_page';
    if (pathname.startsWith('/faq')) return 'faq_page';
    return 'phone_link';
  }

  if (pathname === '/') return 'homepage';
  if (pathname.startsWith('/productos/')) return 'product_page';
  if (pathname.startsWith('/servicios')) return 'services_page';
  if (pathname.startsWith('/checkout')) return 'checkout_page';

  return pathname === '/productos' ? 'products_page' : 'unknown';
}

export default function WhatsAppClickTracker() {
  const pathname = usePathname();
  const lastTrackedAt = useRef(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const isWhatsApp = href.includes('wa.me/');
      const isPhone = href.startsWith('tel:');
      if (!isWhatsApp && !isPhone) return;

      const now = Date.now();
      if (now - lastTrackedAt.current < 400) return;

      const page = pathname || window.location.pathname;
      const label = (link.textContent || '').trim().slice(0, 80);

      if (isWhatsApp) {
        trackWhatsAppClick(
          resolveSource(link, page, 'whatsapp'),
          page,
          href,
          label
        );
      }

      if (isPhone) {
        trackPhoneClick(
          resolveSource(link, page, 'phone'),
          page,
          href,
          label
        );
      }

      lastTrackedAt.current = now;
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  return null;
}
