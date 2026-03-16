'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Footer from '@/components/Footer';

function ConditionalFooterInner() {
  const pathname = usePathname();
  if (!pathname || pathname.startsWith('/admin')) return null;
  return <Footer />;
}

export default function ConditionalFooter() {
  return (
    <Suspense fallback={null}>
      <ConditionalFooterInner />
    </Suspense>
  );
}