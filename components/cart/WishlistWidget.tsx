'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';

interface WishlistWidgetProps {
  className?: string;
  iconClassName?: string;
  scrolled?: boolean;
}

export default function WishlistWidget({ 
  className = '', 
  iconClassName = '',
  scrolled = false 
}: WishlistWidgetProps) {
  const items = useWishlistStore((state) => state.items);
  const itemCount = items.length;

  return (
    <Link 
      href="/wishlist"
      className={`relative ${className}`}
      aria-label={`Ver lista de deseos (${itemCount} productos)`}
    >
      <Heart className={iconClassName} />
      
      {itemCount > 0 && (
        <span 
          className={`absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-bold transition-colors ${
            scrolled 
              ? 'bg-pink-500 text-white' 
              : 'bg-white text-pink-500'
          }`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
