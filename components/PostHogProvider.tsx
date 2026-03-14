'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState, ReactNode } from 'react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const COOKIE_CONSENT_KEY = 'laaldea_cookie_consent';

function PostHogPageview({ client }: { client: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && client) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += '?' + search;
      }
      client.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, client]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const [PHProvider, setPHProvider] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !POSTHOG_KEY) return;

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
          persistence,
          disable_session_recording: true,
          disable_surveys: true,
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
        setPHProvider(() => Provider);
      } catch (err) {
        console.error('Failed to load PostHog async:', err);
      }
    };

    initPostHog();
  }, []);

  if (!PHProvider || !client) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={client}>
      <Suspense fallback={null}>
        <PostHogPageview client={client} />
      </Suspense>
      {children}
    </PHProvider>
  );
}
