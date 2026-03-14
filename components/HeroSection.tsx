'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    // Only update on orientation change (rotating phone), not on mount
    // CSS 100svh handles the initial sizing without forcing a layout read
    const handleOrientationChange = () => {
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.minHeight = `${window.innerHeight}px`;
        }
      }, 300);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);


  return (
    <section
      ref={ref}
      className={className || "relative overflow-hidden flex items-center touch-pan-y"}
      style={{ minHeight: '100svh' }} // fallback before JS runs
    >
      {children}
    </section>
  );
}