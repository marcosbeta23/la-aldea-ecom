# La Aldea E-Commerce

Full-stack e-commerce platform for La Aldea — a hardware, irrigation, and water pump store in Tala, Uruguay. Built with Next.js App Router, TypeScript, and Supabase.

**Production:** [laaldeatala.com.uy](https://laaldeatala.com.uy)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL + Storage + RLS) |
| **Auth (Admin)** | Clerk |
| **Payments** | MercadoPago Uruguay |
| **Email** | Brevo (transactional) |
| **Background Jobs** | Inngest (event-driven functions) |
| **Rate Limiting / Cache** | Upstash Redis |
| **Error Monitoring** | Sentry |
| **Analytics** | PostHog + Google Analytics 4 |
| **Notifications** | Telegram Bot |
| **Hosting** | Vercel (Edge + Serverless) |

---

## Features

### Storefront
- Product catalog with 700+ products, categories, and brand filtering
- Full-text search with autocomplete (Upstash-cached, 30 req/min rate-limited)
- Product detail pages with image gallery, stock tracking, and JSON-LD structured data
- Product guides/articles (CMS-managed via Supabase)
- Wishlist (localStorage-persisted)
- Partner/brand carousel on homepage
- FAQ and informational pages (Contacto, Nosotros, FAQs, Guias)
- Responsive design, mobile-first

### Cart & Checkout
- Persistent cart with localStorage + Zustand
- Coupon/discount code system with rate limiting
- Multi-step checkout with address, shipping, and payment selection
- Shipping modes: **Pickup** (store), **DAC** (24-72h courier), **Freight/Flete** (coordinated via WhatsApp)
- Freight option always visible for coordination via bus, trusted carrier, or any transport
- MercadoPago integration (redirect to MP checkout)
- Bank transfer payment option (manual verification flow)
- Abandoned cart tracking (`checkout_attempts` table)
- Quote request flow for large/custom orders

### Order Flow
- MercadoPago webhook (`/api/webhooks/mercadopago`) verifies signature and updates order status
- Inventory locked on checkout start, released on expiry if unpaid (`Inngest: stock-reservation-expiry`)
- On payment approval:
  - Order status → `paid`
  - Stock decremented
  - Confirmation email sent (Inngest: `order-confirmation`)
  - Telegram alert to owner
- Abandoned cart recovery emails (Inngest: `abandoned-cart-recovery`, 2h delay)
- Order status change notifications (Inngest: `order-status-notification`)

### Admin Panel (`/admin`)
- Protected by Clerk auth
- **Dashboard** — sales overview, recent orders, quick stats
- **Orders** — list, filter by status, view details, update status, add notes
- **Products** — full CRUD, image upload (Supabase Storage), bulk operations
- **Inventory** — stock levels, low-stock alerts
- **Coupons** — create/edit discount codes (percentage or fixed, per-user limits)
- **Customers** — order history per customer
- **Brands/Partners** — manage the partner carousel
- **Reviews** — moderate and publish product reviews
- **Guides** — CMS for product guides/articles
- **Search Analytics** — track zero-result searches for catalog gaps
- **Reports** — sales reports and insights
- **Ventas Mostrador** — in-store sales (bypass checkout, direct order creation)
- **PostHog Insights** — embedded analytics dashboard

### Security
- CSP nonces per request (Edge middleware + `proxy.ts`)
- CSRF protection middleware on all mutating routes
- MercadoPago webhook signature verification (HMAC-SHA256)
- Upstash rate limiting on search, coupon validation, and quote requests
- RLS policies on all Supabase tables
- Sentry error tracking (client + server + Edge)
- Environment secrets never exposed client-side

### SEO & Performance
- `robots.ts` and `sitemap.ts` auto-generated
- Per-page Open Graph and Twitter Card metadata
- Absolute og:image URLs
- JSON-LD structured data on product pages (`Product` schema with `priceCurrency: "UYU"`)
- Image optimization via Next.js `<Image>` + Supabase CDN
- Vercel Edge caching for exchange rates

---

## Project Structure

```
la-aldea-ecom/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Homepage
│   ├── layout.tsx              # Root layout (fonts, metadata, providers, CSP nonce)
│   ├── globals.css             # Global styles
│   ├── productos/              # Product listing + [slug] detail pages
│   ├── cart/                   # Cart page
│   ├── checkout/               # Checkout page (shipping, payment)
│   ├── gracias/                # Order confirmation page
│   ├── pedido/                 # Order tracking
│   ├── wishlist/               # Wishlist page
│   ├── guias/                  # Product guides/articles
│   ├── blog/                   # Blog (redirects to guides)
│   ├── admin/                  # Admin panel (Clerk-protected)
│   │   ├── page.tsx            # Dashboard
│   │   ├── orders/             # Order management
│   │   ├── products/           # Product CRUD
│   │   ├── inventory/          # Stock tracking
│   │   ├── coupons/            # Discount codes
│   │   ├── customers/          # Customer list
│   │   ├── partners/           # Brand carousel CMS
│   │   ├── reviews/            # Review moderation
│   │   ├── guides/             # Article CMS
│   │   ├── search-analytics/   # Zero-result query dashboard
│   │   ├── reports/            # Sales reports
│   │   ├── ventas-mostrador/   # In-store sales
│   │   └── analytics/          # PostHog embedded dashboard
│   ├── api/                    # API Routes
│   │   ├── checkout-attempt/   # Save abandoned cart attempts
│   │   ├── coupons/validate/   # Coupon validation (rate-limited)
│   │   ├── exchange-rate/      # BCU UYU/USD rate (Upstash-cached)
│   │   ├── inngest/            # Inngest function endpoint
│   │   ├── orders/             # Order creation + management
│   │   ├── products/           # Product API
│   │   ├── quote-request/      # Large order quote form
│   │   ├── search/             # Search API (rate-limited)
│   │   ├── reviews/            # Review submission
│   │   ├── webhooks/mercadopago/ # MP payment webhook
│   │   ├── admin/              # Admin-only API routes
│   │   ├── cron/maintenance    # Daily maintenance job
│   │   └── sentry-tunnel/      # Sentry CSP-compatible tunnel
│   ├── sitemap.ts              # Auto-generated XML sitemap
│   └── robots.ts               # robots.txt rules
│
├── components/
│   ├── Header.tsx              # Site header + nav
│   ├── Footer.tsx              # Site footer
│   ├── Analytics.tsx           # GA4 + PostHog init (nonce-aware)
│   ├── PostHogProvider.tsx     # PostHog React context
│   ├── products/               # Product card, grid, filters, image gallery
│   ├── cart/                   # Cart drawer, cart item, totals
│   ├── admin/                  # Admin UI components
│   ├── ui/                     # Shared UI primitives
│   └── common/                 # Shared layout components
│
├── lib/
│   ├── supabase.ts             # Supabase client (browser + server)
│   ├── mercadopago.ts          # MercadoPago SDK wrapper
│   ├── shipping.ts             # Shipping config + option logic
│   ├── redis.ts                # Upstash Redis + rate limiter instances
│   ├── email.ts                # Brevo email templates + sender
│   ├── telegram.ts             # Telegram alert helpers
│   ├── notifications.ts        # Unified notification dispatch
│   ├── exchange-rate.ts        # BCU API + fallback rate
│   ├── validators.ts           # Zod schemas for all API inputs
│   ├── categories.ts           # Category taxonomy
│   ├── inngest.ts              # Inngest client
│   ├── rate-limit.ts           # Rate limiter helpers
│   ├── admin-auth.ts           # Clerk admin check helper
│   └── whatsapp.ts             # WhatsApp deeplink helpers
│
├── inngest/
│   └── functions/              # Background job definitions
│       ├── order-confirmation.ts       # Post-payment email + Telegram
│       ├── abandoned-cart-recovery.ts  # 2h delay recovery email
│       ├── stock-reservation-expiry.ts # Release held stock if unpaid
│       └── order-status-notification.ts # Status change emails
│
├── stores/                     # Zustand state stores (cart, etc.)
├── types/                      # Shared TypeScript types
├── emails/                     # Email templates (React Email)
├── hooks/                      # Custom React hooks
├── scripts/                    # Historical SQL migration scripts
├── public/                     # Static assets
├── proxy.ts                    # Edge middleware (CSP nonces, CSRF, rate limiting)
├── next.config.ts              # Next.js config (Sentry, CSP headers, image domains)
├── vercel.json                 # Vercel cron config (daily at 03:00 UTC)
└── instrumentation.ts          # Sentry server/edge init
```

---

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm

### Installation

```bash
git clone https://github.com/your-username/la-aldea-ecom.git
cd la-aldea-ecom
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required services:
- **Supabase** — database, storage, auth
- **MercadoPago** — payments (use sandbox keys for development)
- **Clerk** — admin authentication
- **Upstash** — Redis rate limiting and caching
- **Brevo** — transactional emails
- **Inngest** — background jobs
- **Sentry** — error monitoring

For the full list of environment variables and where to get each one, see `PRE_LAUNCH_FINAL.md` (section 2) in the data repo.

### Development

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

---

## Database

All migrations are in `scripts/` (historical) and `sql/` (pre-launch). Run in Supabase Dashboard > SQL Editor.

Key tables:
- `products` — product catalog (700+ items)
- `orders` — orders with full status lifecycle
- `order_items` — line items per order
- `order_logs` — status change history
- `inventory_locks` — stock reservations held during checkout
- `coupons` — discount codes with usage tracking
- `partners` — brands shown in homepage carousel
- `checkout_attempts` — abandoned cart tracking
- `search_analytics` — zero-result query logging
- `guides` — product articles/guides (CMS)
- `reviews` — product reviews

---

## Inngest Background Jobs

| Function | Trigger | Description |
|----------|---------|-------------|
| `order-confirmation` | `order/payment.approved` | Send confirmation email + Telegram alert |
| `abandoned-cart-recovery` | `checkout/attempt.created` (2h delay) | Send recovery email if order not completed |
| `stock-reservation-expiry` | `inventory/lock.created` (30min delay) | Release held stock if payment not completed |
| `order-status-notification` | `order/status.changed` | Send status update email to customer |

Inngest auto-discovers functions at `/api/inngest` after deploy.

---

## Cron Jobs

Defined in `vercel.json`:

| Path | Schedule | Description |
|------|----------|-------------|
| `/api/cron/maintenance` | Daily at 03:00 UTC | Cleanup, stale lock release, etc. |

Protected by `CRON_SECRET` env var.

---

## Deployment

The project is deployed on Vercel. All environment variables must be set in the Vercel Dashboard before deploying to production.

See `PRE_LAUNCH_FINAL.md` for the complete pre-launch checklist including:
- SQL migrations to run in Supabase
- Vercel environment variable setup
- MercadoPago production credentials and webhook
- Clerk production instance setup
- DNS configuration

---

## Security Notes

- `.env.local` is gitignored — never commit credentials
- `SUPABASE_SERVICE_ROLE_KEY` and `MP_ACCESS_TOKEN` are server-side only
- RLS is enabled on all Supabase tables
- CSRF middleware protects all POST/PATCH/DELETE routes
- CSP nonces are generated per request in Edge middleware

---

## Project Owner

- **Business:** La Aldea — Tala, Canelones, Uruguay
- **Contact:** +598 92 744 725 | contacto@laaldeatala.com.uy

---

*Private project. All rights reserved.*
