'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const MAX_PROGRESS = 88;

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startProgress = () => {
    clearTimers();
    setVisible(true);
    setProgress(12);

    progressTimerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= MAX_PROGRESS) return current;
        const remaining = MAX_PROGRESS - current;
        const increment = Math.max(1, Math.ceil(remaining / 6));
        return Math.min(MAX_PROGRESS, current + increment);
      });
    }, 160);
  };

  const completeProgress = () => {
    if (!visible) return;

    clearTimers();
    setProgress(100);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (destination.origin !== current.origin) return;
      if (destination.pathname === current.pathname && destination.search === current.search) return;

      startProgress();
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    completeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${Math.max(0, Math.min(100, progress)) / 100})` }}
      />
    </div>
  );
}
