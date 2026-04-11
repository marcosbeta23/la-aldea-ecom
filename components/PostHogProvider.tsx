'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState, useRef, ReactNode, ComponentType } from 'react';
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

export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [PHProvider, setPHProvider] = useState<ComponentType<{ client: PostHog; children?: ReactNode }> | null>(null);
  const [client, setClient] = useState<PostHog | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !POSTHOG_KEY) return;

    // Never initialize tracking on admin routes.
    if (pathname?.startsWith('/admin')) return;

    if (client || PHProvider) return;

    // We only load PostHog in production to keep dev bundles light
    if (process.env.NODE_ENV !== 'production') return;

    const initPostHog = async () => {
      // Defer loading until after window load to avoid blocking LCP
      if (document.readyState !== 'complete') {
        await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
      }
      
      // Wait another 3s for main thread to settle
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const [
          { default: posthogInstance },
          { PostHogProvider: Provider }
        ] = await Promise.all([
          import('posthog-js'),
          import('posthog-js/react')
        ]);

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

        posthogInstance.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: 'identified_only',
          capture_pageview: false, 
          capture_pageleave: true,
          capture_dead_clicks: true,
          persistence,
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
          loaded: (ph) => {
            // Only start recording on user interaction to save bandwidth/CPU
            const startRecording = () => {
              ph.startSessionRecording();
              window.removeEventListener('pointerdown', startRecording);
              window.removeEventListener('keydown', startRecording);
            };
            window.addEventListener('pointerdown', startRecording, { once: true });
            window.addEventListener('keydown', startRecording, { once: true });
          },
        });

        setClient(posthogInstance);
        setPHProvider(() => Provider as ComponentType<{ client: PostHog; children?: ReactNode }>);
      } catch (err) {
        console.error('Failed to load PostHog async:', err);
      }
    };

    initPostHog();
  }, [pathname, client, PHProvider]);

  return (
    <>
      {PHProvider && client && (
        <PHProvider client={client}>
          <Suspense fallback={null}>
            <PostHogPageview client={client} />
          </Suspense>
        </PHProvider>
      )}
      {children}
    </>
  );
}
