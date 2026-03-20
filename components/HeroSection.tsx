'use client';

import { useEffect, useRef } from 'react';

export default function HeroSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const lockHeight = () => {
      if (ref.current) {
        ref.current.style.minHeight = `${window.innerHeight}px`;
      }
    };

    lockHeight(); // lock on mount before any toolbar hide event

    const handleOrientationChange = () => {
      setTimeout(lockHeight, 300);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  return (
    <section
      ref={ref}
      className={className || "relative overflow-hidden flex items-center touch-pan-y"}
      style={{ minHeight: '100svh' }} // CSS fallback before JS runs (same-frame SSR/hydration)
    >
      {children}
    </section>
  );
}