# La Aldea — E-Commerce Platform

Full-stack e-commerce platform for [La Aldea](https://laaldeatala.com.uy), a hardware, irrigation, and water pump store in Tala, Uruguay. Built from the ground up — storefront, checkout, payments, fulfillment, inventory, and a complete admin panel — production-ready and live.

**→ [laaldeatala.com.uy](https://laaldeatala.com.uy)**

---

## Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript |
| **Database** | Supabase — PostgreSQL with pgvector, pg_trgm, unaccent |
| **Auth** | Clerk |
| **Payments** | MercadoPago Uruguay |
| **Background Jobs** | Inngest — event-driven and scheduled functions |
| **Cache / Rate Limiting** | Upstash Redis |
| **Email** | Brevo (transactional, React Email templates) |
| **Notifications** | Telegram Bot · WhatsApp Business API |
| **Error Monitoring** | Sentry (browser + server + Edge, with session replay) |
| **Analytics** | PostHog · Google Analytics 4 (via Partytown worker) · Vercel Analytics |
| **CDN / Security** | Cloudflare — WAF, Bot Fight Mode, Email Routing, Workers |
| **AI — Reasoning** | Claude Sonnet (`claude-sonnet-4-6`) — Anthropic |
| **AI — Fast Inference** | Groq (`llama-3.3-70b-versatile`) — free tier |
| **AI — Embeddings** | OpenAI `text-embedding-3-small` |
| **Hosting** | Vercel (Edge + Serverless) |
| **Styling** | Tailwind CSS v4 |

---

## Features

### Storefront

The product catalog supports 400+ SKUs with category/subcategory taxonomy, brand filtering, price range, stock availability, and sort by popularity, price, or recency.

**Search** is a five-layer pipeline:

1. **Synonym resolution** — DB-managed `search_synonyms` table maps colloquial terms to catalog terms. Editable without a deploy.
2. **AI query expansion** — Groq expands the query with regional Spanish synonyms before hitting the DB. Cached in Upstash with output sanitization against injection.
3. **Full-text search** — `search_vector` tsvector with `pg_trgm` and `unaccent`, accent-insensitive, `websearch` mode.
4. **Fuzzy trigram fallback** — `search_products_fuzzy` RPC with similarity threshold 0.2, catches typos and partial matches.
5. **Semantic fallback** — pgvector cosine similarity on `text-embedding-3-small` embeddings. Re-ranks keyword results and provides a pure semantic fallback for zero-result queries. Query embeddings cached in Upstash (1h TTL).

Zero-result searches get AI-suggested categories via Groq. Question-intent queries (detected by heuristic + Groq classifier) route to a conversational prompt instead of a product grid.

### Checkout

Multi-step flow: personal details → shipping → invoice type → payment. Shipping options: store pickup, DAC courier (24–72h), and freight coordination via WhatsApp. MercadoPago redirect checkout and manual bank transfer are both supported.

Prices are **never trusted from the frontend** — all totals are recalculated server-side from the database on every order. Products priced in USD are converted at the live BROU sell rate (fetched from DolarAPI, 4h Upstash cache, env var fallback). The exchange rate used is recorded on the order at time of purchase.

The invoice step supports `consumer_final` (no tax ID) and `invoice_rut` (requires a 12-digit Uruguayan RUT + business name), validated by Zod.

### Order Lifecycle

```
pending → paid_pending_verification → ready_to_invoice → invoiced → processing → shipped → delivered
                                    ↘ awaiting_stock ↗
                       cancelled / refunded (reachable from most states)
```

MercadoPago payments are processed by a webhook that verifies the HMAC-SHA256 signature, checks idempotency against the stored `mp_payment_id`, validates the paid amount against the order total, and atomically reserves stock via a `FOR UPDATE` RPC. Amount mismatches auto-cancel the order, log the event to `order_logs`, and send a Telegram fraud alert.

Bank transfers follow a separate path: confirmation email on creation, 24h Inngest-scheduled reminder, 48h auto-cancel via maintenance cron.

Refunds call the MercadoPago Refunds API, optionally restore stock via RPC, update order status, and notify the customer by WhatsApp and email.

Every status transition triggers the `order-status-notification` Inngest function, which dispatches to three independent channels — email (Brevo), WhatsApp (Business API), Telegram admin alert — as separate steps with independent retry logic.

### Admin Panel

Protected by Clerk with `owner` and `staff` roles. Route-level RBAC enforced in Edge middleware. All actions logged to `admin_audit_log`.

| Section | Description |
|---|---|
| **Dashboard** | Revenue in UYU + USD combined with live exchange rate, order counts by status, low-stock alerts, recent orders |
| **Analytics** | Revenue trends, department geography, payment method distribution, shipping breakdown, inventory runway (days of stock remaining at current sales velocity), hourly order heatmap, PostHog conversion funnel |
| **AI Reports** | Executive analysis of any time period via Groq (default, free) or Claude Sonnet (opt-in). Includes trend summary, geographic insights, peak hours, top products, and actionable recommendations |
| **Admin Assistant** | Natural language chat backed by Claude Sonnet with Supabase tool calls. Answers ad-hoc questions about orders, inventory, sales, customers, abandoned carts, and catalog gaps in real time |
| **Orders** | Full lifecycle management — status transitions, notes, invoice fields (number, type, RUT, PDF upload), refund initiation, linked MercadoPago IDs, one-click WhatsApp and email dispatch |
| **Products** | Full CRUD with Supabase Storage image upload, related product management (similar / accessory / upgrade), discount scheduling with end-date |
| **Inventory** | Stock levels, low-stock threshold configuration, change log |
| **Customers** | Order history and lifetime value per customer |
| **Search Analytics** | Zero-result query feed — the direct catalog gap identification view |
| **Coupons** | Percentage and fixed-amount codes with per-use limits, minimum purchase, validity window |
| **Guides** | CMS for product articles — section editor, SEO metadata, publish/draft workflow |
| **Reviews** | Moderation queue with verified-purchase flag |
| **Partners** | Homepage brand carousel management |

### Automated Background Jobs (Inngest)

| Function | Trigger | Description |
|---|---|---|
| `order-confirmation` | `order/payment.approved` | Confirmation email + Telegram alert |
| `abandoned-cart-recovery` | `checkout/attempt.created` + 2h | Recovery email if no completed order |
| `stock-reservation-expiry` | `order/stock.reserved` → `reserved_until` | Per-order precise stock release |
| `order-status-notification` | `order/status.changed` | Email + WhatsApp + Telegram, independent retry per channel |
| `low-stock-alert` | `order/payment.approved` | Telegram alert when any ordered item drops to ≤3 units |
| `review-request` | `order/status.changed` + 7d | Review solicitation after delivery |
| `bank-transfer-reminder` | `order/transfer.created` + 24h | Payment reminder before auto-cancel |
| `generate-embedding` | `product/embedding.needed` | Compute and persist pgvector embedding |
| `daily-maintenance` | Cron 3 AM (Montevideo) | Release expired stock locks, cancel stale orders, Monday weekly report |

---

## Database

### Design Notes

The `orders` table carries the full lifecycle in a single row: 12 status values, dual-currency fields with exchange rate snapshot, invoice fields (number, type, RUT, business name, PDF URL), refund fields, email delivery timestamps, and the MercadoPago payment ID. `order_logs` is an append-only audit trail of every state transition and notification event.

Stock is reserved atomically in `inventory_locks` using `FOR UPDATE OF` row locks — preventing race conditions when concurrent buyers compete for the last unit. Locks expire after 24h, released by Inngest with per-order precision, with the maintenance cron as a safety net.

`monthly_revenue_snapshots` pre-aggregates revenue at month close for O(1) historical reporting without scanning `orders`.

### PostgreSQL Extensions

| Extension | Schema | Purpose |
|---|---|---|
| `pg_trgm` | `extensions` | Trigram similarity search, GIN index on `products.name` |
| `pgvector` | `extensions` | `products.embedding vector(1536)`, IVFFlat index (lists = 20) |
| `unaccent` | `extensions` | Accent-insensitive tsvector for `search_vector` |

### Key RPC Functions

| Function | Purpose |
|---|---|
| `reserve_stock_for_order(order_id, hours)` | Atomic stock lock with `FOR UPDATE OF`, returns per-item success/failure |
| `release_expired_reservations()` | Batch release of expired `inventory_locks` |
| `restore_stock_for_order(order_id)` | Stock restoration on cancellation or refund |
| `search_products_fuzzy(query, threshold, limit)` | pg_trgm trigram similarity search |
| `search_products_semantic(embedding, threshold, limit)` | pgvector cosine similarity search |

### Row-Level Security

RLS enabled on all 17 tables. PII and business-sensitive tables (`orders`, `addresses`, `admin_users`, `order_items`, `discount_coupons`, `admin_audit_log`, `inventory_log`, `checkout_attempts`, `inventory_locks`, `order_logs`, and others) are `service_role`-only — zero anon access. `products` allows anon `SELECT` on active rows only (required for `sitemap.ts`). `guides` allows anon `SELECT` on published rows only. All policies defined in `scripts/rls-complete.sql`.

---

## Security

| Vector | Implementation |
|---|---|
| **XSS** | Per-request CSP nonces in Edge middleware (`'nonce-{n}' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`). `sanitize-html` strips all tags from user-submitted review text before storage. Zod drops unexpected fields on every API input. |
| **CSRF** | `Origin` vs `Host` check in Edge middleware on all mutating routes. Explicitly exempt: MP webhook (HMAC-verified independently), Inngest (cryptographically signed), cron routes (secret-authenticated). |
| **SQL injection** | Supabase JS client parameterizes all queries. Groq expansion terms validated by `sanitizeExpansionTerms` (strips `<>{}[]\`, length bounds, hard cap at 4) before reaching the DB. All RPCs compiled with `SET search_path = public`. `pg_trgm` extension lives in `extensions` schema, not `public`. |
| **Price manipulation** | Frontend prices ignored entirely. Unit prices fetched from DB at order creation; totals fully recalculated server-side. |
| **Payment fraud** | MercadoPago webhook HMAC-SHA256 verification. Payment amount validated against stored total — mismatch auto-cancels order, logs event, sends Telegram alert. Idempotency check on `mp_payment_id` prevents double-processing. |
| **Bot / DDoS** | Cloudflare: Bot Fight Mode, WAF rule blocking no-`User-Agent` requests, rate limit on checkout endpoints. Upstash sliding-window limiters: search (30/min), orders (5/min), coupon validation, quote requests, reviews (3/min per IP + per email), AI assistant (20/min). Cloudflare Turnstile CAPTCHA on checkout with server-side verification and graceful degradation. Honeypot field on review forms. |
| **Auth & authorization** | Clerk with short-lived JWTs and PKCE. Route-level RBAC in Edge middleware. Admin actions logged to `admin_audit_log` with IP and user-agent. |
| **Order enumeration** | Public order lookup requires an HMAC-signed token bound to `order_id + customer_email` — valid order number alone is not sufficient. |
| **AI prompt injection** | Fixed-identity block in customer assistant system prompt with explicit refusal patterns for "ignore instructions", "developer mode", and roleplay attacks. Product context wrapped in `[DATOS DEL SISTEMA]` markers; `description` excluded from context queries (primary injection surface if external product data is ever imported). |
| **AI output validation** | `containsSensitiveData()` scans responses for price (7 regex patterns) and stock claim (4 patterns) before returning to client. Filtered responses substitute a safe fallback message. |
| **AI cost attacks** | Input capped at 500 chars/message, 10-turn history limit, role normalization on all messages. |
| **Secrets** | `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`, all AI keys — server-side only, never `NEXT_PUBLIC_`-prefixed. `.env.local` gitignored. |

---

## Project Structure

```
la-aldea-ecom/
├── app/
│   ├── (storefront)               # productos, cart, checkout, gracias, pedido,
│   │                              # wishlist, guias, faq, contacto, nosotros
│   ├── admin/                     # Clerk-protected, role-gated
│   │   ├── analytics/             # Revenue, geography, inventory health, PostHog funnel
│   │   ├── orders/                # Lifecycle management, refund, invoice
│   │   ├── products/ inventory/   # CRUD, related products, stock log
│   │   ├── customers/ coupons/    # Customer history, discount codes
│   │   ├── reviews/ guides/       # Content moderation and CMS
│   │   ├── partners/              # Brand carousel
│   │   ├── search-analytics/      # Zero-result query feed
│   │   └── reports/               # AI-powered sales reports
│   └── api/
│       ├── webhooks/mercadopago/  # HMAC-verified, idempotent, fraud-detected
│       ├── admin/assistant/       # Claude + Supabase tool calls
│       ├── admin/reports/insights/# Groq / Claude report generation
│       ├── search/suggestions/    # 5-layer search pipeline
│       ├── orders/                # Server-side price recalc, Turnstile, Zod
│       ├── cron/maintenance/      # Daily safety net
│       └── sentry-tunnel/         # CSP-compatible Sentry relay
│
├── inngest/functions/             # 9 background functions
│
├── lib/
│   ├── ai.ts                      # callClaude() / callGroq() — raw fetch, no SDK overhead
│   ├── exchange-rate.ts           # DolarAPI → Upstash cache → env var fallback
│   ├── validators.ts              # Zod schemas for all API inputs
│   ├── schema.ts                  # Centralized JSON-LD schema helpers
│   ├── notifications.ts           # Typed WhatsApp message templates
│   ├── analytics.ts               # PostHog event helpers
│   └── search/                    # ai-fallback, query-expansion, intent-detection,
│                                  # embedding-cache
├── scripts/
│   ├── backfill-embeddings.ts     # One-time pgvector bulk embed
│   ├── rls-complete.sql           # Full RLS policy set for all 17 tables
│   └── security-fixes.sql         # pg_trgm schema hardening, RPC search_path fix
│
└── proxy.ts                       # Edge middleware: CSP nonces, CSRF, Clerk, rate limiting
```

---

## Getting Started

**Prerequisites:** Node.js ≥ 20.9, pnpm

```bash
git clone https://github.com/your-username/la-aldea-ecom.git
cd la-aldea-ecom
pnpm install
cp .env.example .env.local   # fill in all values
pnpm dev
```

Required services: Supabase · Clerk · MercadoPago · Upstash · Brevo · Inngest · Sentry · Anthropic · Groq · OpenAI

**First-time database setup:**

```bash
# Run in Supabase Dashboard → SQL Editor, in order:
# scripts/rls-complete.sql
# scripts/security-fixes.sql
# (any remaining scripts/)

# Seed pgvector embeddings — run locally, not on Vercel (~$0.04 for 400 products, ~4 min)
npx tsx scripts/backfill-embeddings.ts
```

New products auto-embed via the `generate-embedding` Inngest function on create/update.

---

## AI Cost Reference

| Feature | Model | Monthly |
|---|---|---|
| Search expansion, fallback, intent detection | Groq Llama 3.3 70B | **$0** (free tier) |
| Report analysis (default / opt-in) | Groq / Claude Sonnet | $0 / ~$0.004 per run |
| Admin assistant | Claude Sonnet 4.6 | ~$8–12 |
| Semantic search query embeddings | OpenAI text-embedding-3-small | < $0.10 |
| **Total** | | **~$10–16 / month** |

---

*Private project. All rights reserved.*