'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryPath } from '@/lib/category-slugs';

interface CategoryConfig {
  value: string;
  count?: number;
}

interface CategoryPillsProps {
  categories: CategoryConfig[];
  currentCategory?: string | null;
}

export default function CategoryPills({ categories, currentCategory }: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // Give the smooth scroll time to finish before checking state
      setTimeout(checkScrollState, 350);
    }
  };

  return (
    <div className="relative mt-6 mb-2 group">
      {/* Scroll Left Button */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -mt-1.5 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Fade masks: Left mask only when scrolled, Right mask only when more to scroll */}
      <div 
        className="relative z-10 w-full"
        style={{
          maskImage: `linear-gradient(to right, ${showLeftArrow ? 'transparent, white 5%' : 'white 0%'}, white ${showRightArrow ? '90%, transparent 100%' : '100%'})`,
          WebkitMaskImage: `linear-gradient(to right, ${showLeftArrow ? 'transparent, white 5%' : 'white 0%'}, white ${showRightArrow ? '90%, transparent 100%' : '100%'})`
        }}
      >
        <div
          ref={scrollRef}
          onScroll={checkScrollState}
          className="flex flex-nowrap gap-2.5 overflow-x-auto pb-3 pt-1 px-1 sm:px-2 scrollbar-hide w-full snap-x scroll-smooth"
        >
          {/* Spacer inside the scroll area to prevent arrows overlapping the very first items */}
          {showLeftArrow && <div className="shrink-0 w-4 md:w-8" />}

          <Link
            href="/productos"
            className={`shrink-0 whitespace-nowrap snap-start px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${!currentCategory
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
              }`}
          >
            Todos
          </Link>

          {categories.map(cat => (
            <Link
              key={cat.value}
              href={getCategoryPath(cat.value)}
              className={`shrink-0 whitespace-nowrap snap-start px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${currentCategory === cat.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                }`}
            >
              {cat.value} {cat.count ? `(${cat.count})` : ''}
            </Link>
          ))}

          {/* Spacer inside the scroll area to prevent arrows overlapping the very last items */}
          {showRightArrow && <div className="shrink-0 w-8 md:w-12" />}
        </div>
      </div>

      {/* Scroll Right Button */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mt-1.5 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all focus:outline-none"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
