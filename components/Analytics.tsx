"use client";

import Script from "next/script";

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-K06VE6W4MY";

export function Analytics({ nonce }: { nonce?: string }) {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
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
