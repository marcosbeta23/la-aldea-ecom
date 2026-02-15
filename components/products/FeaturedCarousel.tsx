'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import type { Product } from '@/types/database';

interface FeaturedCarouselProps {
  products: Product[];
  autoSlideInterval?: number; // ms, default 4000
}

function getProductBadge(product: Product): string {
  if (product.sold_count >= 20) return 'Más Vendido';
  if (product.sold_count >= 10) return 'Popular';
  return 'Destacado';
}

function getCategoryColor(category: string[] | string | null): string {
  const colors: Record<string, string> = {
    Bombas: 'from-blue-400 to-blue-600',
    Riego: 'from-green-400 to-green-600',
    Filtros: 'from-teal-400 to-teal-600',
    Tanques: 'from-cyan-400 to-cyan-600',
    Piscinas: 'from-sky-400 to-sky-600',
    Químicos: 'from-purple-400 to-purple-600',
    Herramientas: 'from-orange-400 to-orange-600',
    Droguería: 'from-violet-400 to-violet-600',
    Accesorios: 'from-amber-400 to-amber-600',
    Hidráulica: 'from-blue-400 to-blue-600',
    'Energía Solar': 'from-yellow-400 to-yellow-600',
  };
  const key = Array.isArray(category) ? category[0] || '' : category || '';
  return colors[key] || 'from-blue-400 to-blue-600';
}

function formatPrice(price: number, currency: string = 'UYU') {
  if (currency === 'USD') {
    return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function FeaturedCarousel({
  products,
  autoSlideInterval = 4000,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use refs for drag state to avoid stale closures in touch handlers
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const isHorizontalRef = useRef<boolean | null>(null);
  const [isDraggingVisual, setIsDraggingVisual] = useState(false);

  const total = products.length;

  // How many cards visible at once based on viewport
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisible = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 768) setVisibleCount(2);
      else if (w < 1024) setVisibleCount(3);
      else setVisibleCount(4);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  // Seamless loop: when reaching cloned region, snap back instantly
  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= total) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    } else if (currentIndex < 0) {
      setIsTransitioning(false);
      setCurrentIndex(total - 1);
    }
  }, [currentIndex, total]);

  // Re-enable transition after snap-back
  useEffect(() => {
    if (!isTransitioning) {
      // Allow the DOM to paint at the snapped position, then re-enable transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
  }, [isTransitioning]);

  // Auto-slide
  const slideNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (total <= visibleCount) return;
    intervalRef.current = setInterval(slideNext, autoSlideInterval);
  }, [total, visibleCount, autoSlideInterval, slideNext]);

  useEffect(() => {
    if (!isHovered) {
      startAutoSlide();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, startAutoSlide]);

  const prev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);
  
  const next = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  // Touch/drag support — store next/prev in refs updated via effect
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  useEffect(() => {
    nextRef.current = next;
    prevRef.current = prev;
  }, [next, prev]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      setIsDraggingVisual(true);
      dragStartXRef.current = e.touches[0].clientX;
      dragStartYRef.current = e.touches[0].clientY;
      dragOffsetRef.current = 0;
      isHorizontalRef.current = null; // unknown direction yet
      setDragOffset(0);
      // Pause auto-slide
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      const dx = e.touches[0].clientX - dragStartXRef.current;
      const dy = e.touches[0].clientY - dragStartYRef.current;

      // Determine direction once we have enough movement
      if (isHorizontalRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
      }

      if (isHorizontalRef.current) {
        e.preventDefault(); // Lock page scroll
        dragOffsetRef.current = dx;
        setDragOffset(dx);
      }
    };

    const onTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDraggingVisual(false);

      const offset = dragOffsetRef.current;
      const threshold = 50;
      if (offset < -threshold) nextRef.current();
      else if (offset > threshold) prevRef.current();

      dragOffsetRef.current = 0;
      isHorizontalRef.current = null;
      setDragOffset(0);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // stable — everything uses refs

  // Mouse drag (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDraggingVisual(true);
    dragStartXRef.current = e.clientX;
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    dragOffsetRef.current = dx;
    setDragOffset(dx);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDraggingVisual(false);
    const offset = dragOffsetRef.current;
    const threshold = 60;
    if (offset < -threshold) next();
    else if (offset > threshold) prev();
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  if (total === 0) return null;

  // Build the visible items with infinite loop wrapping
  const cardWidthPercent = 100 / visibleCount;

  // Clone last visibleCount items at beginning + first visibleCount at end for seamless loop
  const extendedProducts = [
    ...products.slice(-visibleCount),
    ...products,
    ...products.slice(0, visibleCount),
  ];

  // Offset by visibleCount (because of prepended clones)
  const translateIndex = currentIndex + visibleCount;
  const baseTranslate = -(translateIndex * cardWidthPercent);

  // Normalized index for progress indicator
  const normalizedIndex = ((currentIndex % total) + total) % total;

  // Progress bar: how far through the carousel we are
  const progressPercent = total <= visibleCount ? 100 : ((normalizedIndex + visibleCount) / total) * 100;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Track */}
      <div className="overflow-hidden rounded-xl">
        <div
          ref={trackRef}
          className={`flex select-none ${isDraggingVisual ? '' : isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            transform: `translateX(calc(${baseTranslate}% + ${dragOffset}px))`,
          }}
          onTransitionEnd={handleTransitionEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {extendedProducts.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="shrink-0 px-2"
              style={{ width: `${cardWidthPercent}%` }}
            >
              <Link
                href={`/productos/${product.sku}`}
                className="group block overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg"
                draggable={false}
              >
                {/* Badge */}
                <div className="relative">
                  <div className="absolute left-2 top-2 z-10 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-slate-700">
                    {getProductBadge(product)}
                  </div>

                  {/* Product Image or Gradient Fallback */}
                  <div
                    className={`aspect-[4/3] overflow-hidden ${
                      product.images?.[0]
                        ? 'bg-white'
                        : `bg-gradient-to-br ${getCategoryColor(product.category)}`
                    } flex items-center justify-center`}
                  >
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={300}
                        height={225}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        draggable={false}
                      />
                    ) : (
                      <Droplets className="h-12 w-12 text-white/40" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <p className="text-[10px] font-medium text-blue-600">
                    {Array.isArray(product.category)
                      ? product.category.join(', ')
                      : product.category || 'Producto'}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  {product.availability_type === 'on_request' ? (
                    <p className="mt-1 text-sm font-semibold text-blue-600">Consultar</p>
                  ) : (
                    <div className="mt-1 flex items-baseline gap-2">
                      {product.original_price_numeric && product.discount_percentage ? (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.original_price_numeric, product.currency)}
                          </span>
                          <span className="text-base font-bold text-green-700">
                            {formatPrice(product.price_numeric, product.currency)}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-bold text-slate-900">
                          {formatPrice(product.price_numeric, product.currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow Buttons — only if there are more products than visible */}
      {total > visibleCount && (
        <>
          <button
            onClick={prev}
            aria-label="Producto anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 sm:-translate-x-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Producto siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 sm:translate-x-3"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Progress bar indicator */}
      {total > visibleCount && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            {normalizedIndex + 1}/{total}
          </span>
          <div className="w-24 sm:w-32 h-1 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
