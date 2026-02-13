'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * A link back to /productos that preserves the most recent filter params.
 * Falls back to plain /productos if no saved filters exist.
 */
export default function BackToProductsLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState('/productos');

  useEffect(() => {
    const saved = sessionStorage.getItem('la-aldea-product-filters');
    if (saved) {
      setHref(`/productos${saved}`);
    }
  }, []);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
