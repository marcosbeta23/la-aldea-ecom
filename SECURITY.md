# Security Operations - Secret Rotation

This document defines secret inventory and rotation procedures for La Aldea Ecom.

## Secret Inventory

- Supabase service role key: SUPABASE_SERVICE_ROLE_KEY. Used in server API routes and admin operations. Rotation every 90 days.
- Supabase anon key: NEXT_PUBLIC_SUPABASE_ANON_KEY. Used in frontend client with RLS. Rotation every 180 days.
- Supabase project URL: NEXT_PUBLIC_SUPABASE_URL. Used in frontend and server client initialization. Rotate only on project migration.
- Clerk server key: CLERK_SECRET_KEY. Used in admin authentication. Rotation every 90 days.
- Clerk publishable key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Used in Clerk frontend SDK. Rotation every 180 days.
- MercadoPago access token: MP_ACCESS_TOKEN. Used in payment preference creation and refunds. Rotation every 90 days.
- MercadoPago public key: MP_PUBLIC_KEY. Used in frontend checkout SDK. Rotation every 180 days.
- MercadoPago webhook secret: MP_WEBHOOK_SECRET. Used in webhook signature verification. Rotation every 90 days.
- Brevo API key: BREVO_API_KEY. Used in transactional emails. Rotation every 90 days.
- Sentry DSN: SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN. Used in error monitoring. Rotation every 180 days.
- Inngest keys: INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY. Used in event delivery and webhook validation. Rotation every 90 days.
- Upstash Redis credentials: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN. Used in distributed rate limiting and cache. Rotation every 90 days.
- Cron auth secret: CRON_SECRET. Used in protected cron endpoints. Rotation every 90 days.
- Order token HMAC secret: ORDER_TOKEN_SECRET. Used in signed customer order access links. Rotation every 90 days.
- Turnstile secret: TURNSTILE_SECRET_KEY. Used in bot protection verification. Rotation every 90 days.

## Standard Rotation Procedure

1. Create a new secret in the provider dashboard (Supabase, Clerk, MercadoPago, etc.).
2. Store the new value in the team secret manager.
3. Update Vercel environment variables for Production, Preview, and Development.
4. Redeploy application.
5. Run smoke tests for auth, checkout, webhooks, cron, and admin panel.
6. Revoke old secret in the provider dashboard.
7. Record rotation date, owner, and evidence in the security log.

## Provider-Specific Rotation Steps

### Supabase

1. Create/regenerate keys in Supabase project settings.
2. Update SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.
3. Redeploy.
4. Validate critical APIs: orders, webhooks, admin routes, cron routes.
5. Revoke old key.

### Clerk

1. Regenerate CLERK_SECRET_KEY in Clerk dashboard.
2. Update CLERK_SECRET_KEY in Vercel.
3. Redeploy.
4. Validate admin login and role-protected routes.
5. Rotate NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY if required and redeploy.

### MercadoPago

1. Generate a new MP_ACCESS_TOKEN.
2. Create/update MP_WEBHOOK_SECRET for the webhook endpoint.
3. Update MP_ACCESS_TOKEN and MP_WEBHOOK_SECRET in Vercel.
4. Redeploy.
5. Validate payment creation and webhook signature verification.
6. Revoke old token.

### Brevo

1. Generate new BREVO_API_KEY.
2. Update in Vercel.
3. Redeploy.
4. Validate quote emails, order confirmations, and invoice notifications.
5. Revoke old key.

### Upstash Redis

1. Regenerate REST token in Upstash.
2. Update UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN if changed.
3. Redeploy.
4. Validate rate-limited endpoints return expected 429 behavior.
5. Revoke old token.

## Emergency Rotation

Rotate immediately if any of the following occurs:

- Secret appears in logs, screenshots, tickets, or commit history.
- Third-party credential leak notification is received.
- Unauthorized access is detected in provider audit logs.

Emergency steps:

1. Revoke compromised secret immediately.
2. Apply new secret in all environments.
3. Redeploy and validate critical flows.
4. Review logs for abuse window and create incident report.

## Ownership and Audit

- Owner: Engineering lead on duty.
- Minimum evidence per rotation: timestamp, rotated secret name, provider action screenshot or audit event ID, post-rotation smoke test results.
- Keep rotation log in internal security tracker.
