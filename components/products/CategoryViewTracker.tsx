'use client';

import { useEffect } from 'react';
import { trackCategoryView } from '@/lib/analytics';

interface CategoryViewTrackerProps {
  category?: string;
  subcategory?: string;
  query?: string;
  resultCount: number;
  page: number;
}

export default function CategoryViewTracker({
  category,
  subcategory,
  query,
  resultCount,
  page,
}: CategoryViewTrackerProps) {
  useEffect(() => {
    trackCategoryView(category || 'all_products', subcategory || null, resultCount, query);
  }, [category, subcategory, query, resultCount, page]);

  return null;
}
