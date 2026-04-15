'use client';

import { useLayoutEffect, useRef } from 'react';

export default function HeroSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let lockedWidth = 0;
    let lockedHeight = 0;

    const readViewport = () => {
      const vp = window.visualViewport;

      return {
        width: Math.round(vp ? vp.width : window.innerWidth),
        height: Math.round(vp ? vp.height : window.innerHeight),
      };
    };

    const lockHeight = (width: number, height: number) => {
      lockedWidth = width;
      lockedHeight = height;
      el.style.minHeight = `${height}px`;
    };

    const { width: initialWidth, height: initialHeight } = readViewport();
    lockHeight(initialWidth, initialHeight);

    const onResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        rafId = null;

        const { width: nextWidth, height: nextHeight } = readViewport();
        const widthDelta = Math.abs(nextWidth - lockedWidth);
        const heightDelta = Math.abs(nextHeight - lockedHeight);

        const shouldRelockLayout = widthDelta > 10;
        const shouldGrowForViewport = nextHeight > lockedHeight && heightDelta > 24;

        if (shouldRelockLayout || shouldGrowForViewport) {
          lockHeight(nextWidth, nextHeight);
        }
      });
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  const baseClassName = 'relative overflow-hidden flex w-full touch-pan-y min-h-screen';

  return (
    <section
      ref={sectionRef}
      className={className ? `${baseClassName} ${className}` : baseClassName}
    >
      {children}
    </section>
  );
}