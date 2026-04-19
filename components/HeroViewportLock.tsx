'use client';

import { useLayoutEffect } from 'react';

export default function HeroViewportLock({ lockId }: { lockId: string }) {
  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-hero-lock-id="${lockId}"]`);
    if (!el) return;

    const vp = window.visualViewport;
    const height = Math.round(vp ? vp.height : window.innerHeight);

    // Lock once on mount; do not update on browser chrome changes.
    el.style.minHeight = `${height}px`;
  }, [lockId]);

  return null;
}
