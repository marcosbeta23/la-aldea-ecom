'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const COOKIE_CONSENT_KEY = 'laaldea_cookie_consent';

// Initialize PostHog once (production only — avoids remote config fetch errors in dev)
if (typeof window !== 'undefined' && POSTHOG_KEY && process.env.NODE_ENV === 'production') {
  // Check cookie consent before initializing
  let persistence: 'localStorage+cookie' | 'memory' = 'memory';
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) {
      const parsed = JSON.parse(consent);
      if (parsed.analytics) {
        persistence = 'localStorage+cookie';
      }
    }
  } catch {}

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We capture manually for SPA navigation
    capture_pageleave: true,
    persistence,
  });
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && POSTHOG_KEY && process.env.NODE_ENV === 'production') {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += '?' + search;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// Export posthog instance for direct use in event tracking
export { posthog };
