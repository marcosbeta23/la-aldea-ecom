'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase } from '@/components/Analytics';

interface PurchaseTrackerProps {
  transactionId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  shipping?: number;
}

export default function PurchaseTracker({ transactionId, items, total, shipping }: PurchaseTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackPurchase(transactionId, items, total, shipping);
    }
  }, [transactionId, items, total, shipping]);

  return null;
}
