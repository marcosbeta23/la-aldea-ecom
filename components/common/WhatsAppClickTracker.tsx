'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPhoneClick, trackWhatsAppClick, trackEmailClick } from '@/lib/analytics';

function resolveSource(anchor: HTMLAnchorElement, pathname: string, channel: 'whatsapp' | 'phone' | 'email'): string {
  const dataAttr = {
    whatsapp: 'whatsappSource',
    phone: 'phoneSource',
    email: 'emailSource',
  }[channel];
  const containerAttr = `[data-${channel === 'whatsapp' ? 'whatsapp' : channel}-source]`;

  const explicitSource =
    (anchor.dataset as Record<string, string | undefined>)[dataAttr] ||
    anchor.closest<HTMLElement>(containerAttr)?.dataset[dataAttr];

  if (explicitSource) return explicitSource;

  // Fallback: derive source from page path
  if (pathname === '/contacto') return 'contact_page';
  if (pathname === '/') return 'homepage';
  if (pathname.startsWith('/productos/')) return 'product_page';
  if (pathname === '/productos') return 'products_page';
  if (pathname.startsWith('/servicios')) return 'services_page';
  if (pathname.startsWith('/checkout')) return 'checkout_page';
  if (pathname.startsWith('/nosotros')) return 'about_page';
  if (pathname.startsWith('/faq')) return 'faq_page';
  if (pathname.startsWith('/blog') || pathname.startsWith('/guias')) return 'blog_page';
  if (pathname.startsWith('/pendiente')) return 'pending_page';

  return `${channel}_link`;
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
      const isEmail = href.startsWith('mailto:');
      if (!isWhatsApp && !isPhone && !isEmail) return;

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

      if (isEmail) {
        trackEmailClick(
          resolveSource(link, page, 'email'),
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
