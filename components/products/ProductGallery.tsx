'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
    setIsLoading(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setIsLoading(true);
  };

  const handleThumbnailClick = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setIsZoomed(false);
      setIsLoading(true);
    }
  };

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
    setIsLoading(false);
  }, []);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-slate-100 flex items-center justify-center">
        <span className="text-slate-400">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div
        className="relative aspect-square bg-slate-100 cursor-zoom-in overflow-hidden"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {imageErrors.has(currentIndex) ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-400">Error al cargar imagen</span>
          </div>
        ) : (
          <Image
            key={images[currentIndex]}
            src={images[currentIndex]}
            alt={`${name} - Imagen ${currentIndex + 1}`}
            fill
            className={`object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
            priority={currentIndex === 0}
            fetchPriority={currentIndex === 0 ? 'high' : undefined}
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
            onLoad={() => setIsLoading(false)}
            onError={() => handleImageError(currentIndex)}
          />
        )}

        {/* Loading overlay */}
        {isLoading && !imageErrors.has(currentIndex) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/60 z-10">
            <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 p-2 bg-white/80 rounded-lg">
          <ZoomIn className="h-5 w-5 text-slate-600" />
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-6 w-6 text-slate-700" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={`thumb-${index}-${image}`}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${index === currentIndex
                ? 'border-blue-600'
                : 'border-transparent hover:border-slate-300'
                }`}
            >
              {imageErrors.has(index) ? (
                <div className="flex items-center justify-center h-full bg-slate-100">
                  <span className="text-slate-400 text-[10px]">Error</span>
                </div>
              ) : (
                <Image
                  src={image}
                  alt={`${name} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  priority={index === 0}
                  fetchPriority="low"
                  onError={() => handleImageError(index)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
