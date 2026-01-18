'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useEffect, useState } from 'react';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function WishlistButton({ 
  productId, 
  className = '', 
  size = 'md',
  showLabel = false 
}: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? isInWishlist(productId) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    toggleItem(productId);
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full
        transition-all duration-200
        hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${isAnimating ? 'scale-125' : 'scale-100'}
        ${className}
      `}
      aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        className={`
          ${sizeClasses[size]}
          transition-colors duration-200
          ${inWishlist 
            ? 'fill-red-500 text-red-500' 
            : 'fill-transparent text-gray-400 hover:text-red-400'
          }
        `}
      />
      {showLabel && (
        <span className="ml-2 text-sm">
          {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
        </span>
      )}
    </button>
  );
}
