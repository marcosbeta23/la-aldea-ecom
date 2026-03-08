'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Capture height ONCE on mount, before any scroll happens
    // Never update on scroll — this is what Safari does natively
    if (ref.current) {
      ref.current.style.minHeight = `${window.innerHeight}px`;
    }

    // Only update on orientation change (rotating phone), not scroll
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
      className="relative overflow-hidden flex items-center touch-pan-y"
      style={{ minHeight: '100svh' }} // fallback before JS runs
    >
      {children}
    </section>
  );
}