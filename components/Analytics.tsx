"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-K06VE6W4MY";
const COOKIE_CONSENT_KEY = "laaldea_cookie_consent";
const CRAZY_EGG_SRC = "//script.crazyegg.com/pages/scripts/0132/5723.js";
const CLOUDFLARE_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
const CLOUDFLARE_BEACON_DATA = '{"token": "21ea1d19b9c54b8c9007050f4de4edc8"}';

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return false;
    const parsed = JSON.parse(consent) as { analytics?: boolean };
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function Analytics({ nonce }: { nonce?: string }) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateConsent = () => {
      setAnalyticsEnabled(hasAnalyticsConsent());
    };

    updateConsent();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) {
        updateConsent();
      }
    };

    const handleConsentGranted = () => updateConsent();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("laaldea:analytics-consent-granted", handleConsentGranted as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("laaldea:analytics-consent-granted", handleConsentGranted as EventListener);
    };
  }, []);

  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  if (!analyticsEnabled) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="lazyOnload"
        nonce={nonce}
      />
      <Script id="google-analytics" strategy="lazyOnload" nonce={nonce}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>

      {/* Non-essential trackers are consent-gated to avoid extra script cost on first load. */}
      <Script
        id="crazy-egg"
        type="text/javascript"
        src={CRAZY_EGG_SRC}
        strategy="lazyOnload"
        nonce={nonce}
      />
      <Script
        id="cloudflare-web-analytics"
        strategy="lazyOnload"
        src={CLOUDFLARE_BEACON_SRC}
        data-cf-beacon={CLOUDFLARE_BEACON_DATA}
        nonce={nonce}
      />
    </>
  );
}

// Helper functions for e-commerce tracking
export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item", {
      currency: "UYU",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category,
          item_brand: product.brand,
        },
      ],
    });
  }
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "UYU",
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
          item_category: product.category,
          item_brand: product.brand,
        },
      ],
    });
  }
}

export function trackBeginCheckout(items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, total: number) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "UYU",
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

export function trackPurchase(
  transactionId: string,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>,
  total: number,
  shipping?: number,
  tax?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      currency: "UYU",
      value: total,
      shipping: shipping || 0,
      tax: tax || 0,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: "event" | "config" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
