'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  // Hide footer on all admin routes
  if (pathname?.startsWith('/admin')) return null;
  return <Footer />;
}
