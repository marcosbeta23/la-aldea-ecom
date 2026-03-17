
function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return; // SSR guard
  if (process.env.NODE_ENV !== "production") {
    // Log in dev so you can see events without needing PostHog running
    console.log(`[Analytics] ${event}`, properties);
    return;
  }
  import("posthog-js").then(({ default: ph }) => {
    if (ph.__loaded) {
      ph.capture(event, properties);
    }
    // If not loaded yet, event is intentionally dropped
  });
}

// Checkout funnel
export function trackCheckoutStarted(itemCount: number, subtotal: number) {
  capture("checkout_started", { item_count: itemCount, subtotal_uyu: subtotal });
}
export function trackCheckoutStepCompleted(
  step: "datos_personales" | "envio" | "facturacion" | "pago",
  data?: Record<string, unknown>
) {
  capture("checkout_step_completed", { step, ...data });
}
export function trackOrderSubmitted(
  paymentMethod: "mercadopago" | "transfer",
  shippingType: "pickup" | "dac" | "freight",
  total: number,
  currency: "UYU" | "USD",
  itemCount: number
) {
  capture("order_submitted", {
    payment_method: paymentMethod,
    shipping_type: shippingType,
    total,
    currency,
    item_count: itemCount,
  });
}

// Search
export function trackSearch(query: string, resultCount: number, clickedResult: boolean) {
  capture("search", {
    query,
    result_count: resultCount,
    zero_results: resultCount === 0,
    clicked_result: clickedResult,
  });
}

// Product events
export function trackProductView(
  productId: string,
  productName: string,
  price: number,
  category: string
) {
  capture("product_viewed", { productId, productName, price, category });
}
export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number
) {
  capture("product_added_to_cart", { productId, productName, price, quantity });
}
export function trackRemoveFromCart(productId: string, productName: string) {
  capture("product_removed_from_cart", { productId, productName });
}

// Payment & shipping
export function trackPaymentSelected(method: "mercadopago" | "transfer") {
  capture("payment_method_selected", { method });
}
export function trackShippingSelected(method: "pickup" | "dac" | "freight") {
  capture("shipping_method_selected", { method });
}

// Coupon
export function trackCouponApplied(code: string, discountAmount: number) {
  capture("coupon_applied", { code, discount_amount: discountAmount });
}
export function trackCouponFailed(code: string, reason: string) {
  capture("coupon_failed", { code, reason });
}

// Stock collision
export function trackStockCollision(productId: string, productName: string) {
  capture("stock_collision", { productId, productName });
}

// AI Assistant
export function trackAssistantMessage(
  resolved: boolean,
  messageCount: number,
  topic?: string
) {
  capture("assistant_message", { resolved, message_count: messageCount, topic });
}

/*
// Wishlist
export function trackWishlistAdd(productId: string, productName: string) {
  capture("wishlist_add", { productId, productName });
}
*/