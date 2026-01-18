'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useEffect, useState } from 'react';

interface CartWidgetProps {
  className?: string;
  iconClassName?: string;
  scrolled?: boolean;
}

export default function CartWidget({ className = '', iconClassName = '', scrolled = true }: CartWidgetProps) {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className={`relative flex items-center justify-center transition-colors ${className}`}
      aria-label={`Carrito de compras (${mounted ? itemCount : 0} productos)`}
    >
      <ShoppingCart className={`h-6 w-6 ${iconClassName}`} />
      
      {/* Badge - only show when mounted and has items */}
      {mounted && itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-green-600 rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
