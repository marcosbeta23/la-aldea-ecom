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

    const vp = window.visualViewport;
    const height = Math.round(vp ? vp.height : window.innerHeight);

    // Lock once on mount; do not update on browser chrome changes.
    el.style.minHeight = `${height}px`;
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