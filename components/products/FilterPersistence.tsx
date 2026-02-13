'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Saves the current product filter search params to sessionStorage,
 * so the product detail page can link back with filters preserved.
 */
export default function FilterPersistence() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    sessionStorage.setItem('la-aldea-product-filters', params ? `?${params}` : '');
  }, [searchParams]);

  return null; // No visual output
}
