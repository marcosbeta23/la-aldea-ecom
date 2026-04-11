'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState, useRef, ComponentType } from 'react';
import type { PostHog } from 'posthog-js';
import { trackPageView } from '@/lib/analytics';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
const POSTHOG_HOST = '/ingest';
const COOKIE_CONSENT_KEY = 'laaldea_cookie_consent';

function PostHogPageview({ client }: { client: PostHog }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    if (pathname && client) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += '?' + search;
      }

      // Avoid duplicate captures when React re-renders with the same URL.
      if (lastUrlRef.current === url) return;
      lastUrlRef.current = url;

      client.capture('$pageview', { $current_url: url });
      trackPageView(pathname, search);
    }
  }, [pathname, searchParams, client]);

  return null;
}

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return false;
    const parsed = JSON.parse(consent) as { analytics?: boolean };
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function PostHogProvider() {
  const pathname = usePathname();
  const [PHProvider, setPHProvider] = useState<ComponentType<{ client: PostHog; children?: React.ReactNode }> | null>(null);
  const [client, setClient] = useState<PostHog | null>(null);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateConsent = () => {
      setAnalyticsConsent(hasAnalyticsConsent());
    };

    updateConsent();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) {
        updateConsent();
      }
    };

    const handleConsentGranted = () => updateConsent();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('laaldea:analytics-consent-granted', handleConsentGranted as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('laaldea:analytics-consent-granted', handleConsentGranted as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !POSTHOG_KEY) return;

    // Never initialize tracking on admin routes.
    if (pathname?.startsWith('/admin')) return;

    // Respect cookie consent: avoid loading PostHog runtime before opt-in.
    if (!analyticsConsent) return;

    if (client || PHProvider) return;

    // We only load PostHog in production to keep dev bundles light
    if (process.env.NODE_ENV !== 'production') return;

    const initPostHog = async () => {
      // Defer loading until after window load to avoid blocking LCP
      if (document.readyState !== 'complete') {
        await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
      }

      // Prefer browser idle time so scripts don't compete with first interactions.
      await new Promise<void>((resolve) => {
        if ('requestIdleCallback' in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
            .requestIdleCallback(() => resolve(), { timeout: 3500 });
        } else {
          setTimeout(resolve, 1800);
        }
      });

      try {
        const [
          { default: posthogInstance },
          { PostHogProvider: Provider }
        ] = await Promise.all([
          import('posthog-js'),
          import('posthog-js/react')
        ]);

        posthogInstance.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: 'identified_only',
          capture_pageview: false,
          capture_pageleave: false,
          capture_dead_clicks: false,
          autocapture: false,
          persistence: 'localStorage+cookie',
          disable_session_recording: true,
          disable_surveys: true,
          before_send: (event) => {
            const maybeUrl =
              (event?.properties?.$current_url as string | undefined) ||
              (typeof window !== 'undefined' ? window.location.href : undefined);

            if (maybeUrl?.includes('/admin')) {
              return null;
            }

            return event;
          },
        });

        setClient(posthogInstance);
        setPHProvider(() => Provider as ComponentType<{ client: PostHog; children?: React.ReactNode }>);
      } catch (err) {
        console.error('Failed to load PostHog async:', err);
      }
    };

    initPostHog();
  }, [pathname, client, PHProvider, analyticsConsent]);

  return (
    PHProvider && client ? (
      <PHProvider client={client}>
        <Suspense fallback={null}>
          <PostHogPageview client={client} />
        </Suspense>
      </PHProvider>
    ) : null
  );
}
