'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SubcategoryChipsProps {
  subcategories: { value: string; label: string; count: number }[];
  categoria: string;
  currentSub?: string;
}

export function SubcategoryChips({ subcategories, categoria, currentSub }: SubcategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [subcategories]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 flex items-center justify-center w-7 h-7 bg-white/95 shadow-md rounded-full border border-slate-200 hover:bg-white transition-colors shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
      )}

      {/* Chips */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1 px-1 w-full"
      >
        <Link
          href={`/productos?categoria=${encodeURIComponent(categoria)}`}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !currentSub
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos
        </Link>
        {subcategories.map(sub => (
          <Link
            key={sub.value}
            href={`/productos?categoria=${encodeURIComponent(categoria)}&sub=${encodeURIComponent(sub.value)}`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentSub === sub.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sub.label}
            <span className="ml-1 text-xs opacity-70">({sub.count})</span>
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 flex items-center justify-center w-7 h-7 bg-white/95 shadow-md rounded-full border border-slate-200 hover:bg-white transition-colors shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      )}
    </div>
  );
}
