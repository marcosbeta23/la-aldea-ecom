'use client';

import { useEffect, useRef } from 'react';
import { trackUiInteraction } from '@/lib/analytics';

interface GuideInteractionTrackerProps {
  slug: string;
}

function isInteractiveElement(element: HTMLElement): boolean {
  return Boolean(
    element.closest('a, button, input, select, textarea, summary, [role="button"], [data-clickable="true"]')
  );
}

function getContextLabel(target: HTMLElement): string {
  const heading = target.closest('section, article, div')?.querySelector('h2, h3, h4');
  if (heading?.textContent?.trim()) {
    return heading.textContent.trim().slice(0, 80);
  }

  if (target.textContent?.trim()) {
    return target.textContent.trim().slice(0, 80);
  }

  return target.tagName.toLowerCase();
}

export default function GuideInteractionTracker({ slug }: GuideInteractionTrackerProps) {
  const lastTrackedAt = useRef(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const root = target.closest('[data-guide-content="true"]') as HTMLElement | null;
      if (!root) return;

      const now = Date.now();
      if (now - lastTrackedAt.current < 1200) return;

      if (isInteractiveElement(target)) {
        const link = target.closest('a') as HTMLAnchorElement | null;
        if (link?.href) {
          trackUiInteraction('guide_link_click', {
            slug,
            href: link.getAttribute('href') || link.href,
            context: getContextLabel(target),
          });
          lastTrackedAt.current = now;
        }
        return;
      }

      trackUiInteraction('guide_dead_click_candidate', {
        slug,
        tag: target.tagName.toLowerCase(),
        context: getContextLabel(target),
      });
      lastTrackedAt.current = now;
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [slug]);

  return null;
}
