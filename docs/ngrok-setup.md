# ngrok Setup Guide - La Aldea E-Commerce

**Date:** January 16, 2026  
**Purpose:** Local webhook testing for MercadoPago integration

---

## ✅ Installation Status

- **Version:** ngrok 3.24.0-msix
- **Installed via:** Microsoft Store + npm
- **Status:** Installed ✅
- **Authentication:** Pending ⏳

---

## 🔑 Authentication Setup

### Step 1: Create ngrok Account (Free)

1. Visit: https://dashboard.ngrok.com/signup
2. Sign up with email or GitHub
3. Verify your email

### Step 2: Get Your Authtoken

1. Login to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2hR6M9X...`)

### Step 3: Configure ngrok

Run in PowerShell:
```powershell
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**Example:**
```powershell
ngrok config add-authtoken 2hR6M9XpK7YzN8qL3vB4wT5cH1dF0gJ6mS9aE
```

This saves your token to: `C:\Users\marco\AppData\Local\ngrok\ngrok.yml`

---

## 🚀 Testing ngrok

### Start Your Next.js Dev Server

```powershell
pnpm dev
```

Your app runs on: `http://localhost:3000`

### Start ngrok Tunnel (in new terminal)

```powershell
ngrok http 3000
```

You'll see:
```
Session Status                online
Account                       your-email@example.com
Version                       3.24.0-msix
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000
```

**Your public URL:** `https://abc123def456.ngrok-free.app`

---

## 📝 MercadoPago Webhook Configuration

### When Testing Payments

1. Start ngrok: `ngrok http 3000`
2. Copy your ngrok URL (e.g., `https://abc123def456.ngrok-free.app`)
3. Go to: https://www.mercadopago.com.uy/developers/panel/app
4. Select your app → Webhooks
5. Add webhook URL: `https://abc123def456.ngrok-free.app/api/webhooks/mercadopago`

### Events to Subscribe

- ✅ `payment` - Payment status changes
- ✅ `merchant_order` - Order status changes

### Testing Webhook

MercadoPago will send a POST request like:
```json
{
  "action": "payment.created",
  "api_version": "v1",
  "data": {
    "id": "123456789"
  },
  "date_created": "2026-01-16T10:00:00Z",
  "id": 12345678,
  "live_mode": false,
  "type": "payment",
  "user_id": "1234567890"
}
```

---

## 🔍 Inspecting Webhooks

### ngrok Web Interface

Visit: http://127.0.0.1:4040

Features:
- **Request Inspector:** See all incoming requests
- **Replay:** Resend requests for testing
- **Request Details:** Headers, body, response
- **Timeline:** Visual request flow

### Useful Commands

```powershell
# Basic tunnel (HTTP)
ngrok http 3000

# Custom subdomain (requires paid plan)
ngrok http 3000 --subdomain=laaldea

# With authentication
ngrok http 3000 --auth="user:password"

# Different region
ngrok http 3000 --region=sa  # South America

# Save traffic to file
ngrok http 3000 --log=stdout > ngrok.log
```

---

## 🛠️ Common Issues & Solutions

### Issue 1: "ERR_NGROK_108"
**Error:** Your account is limited to 1 online ngrok agent session

**Solution:** 
- Close other running ngrok instances
- Or upgrade to paid plan for multiple tunnels

### Issue 2: "Tunnel not found"
**Error:** Failed to connect to ngrok

**Solution:**
```powershell
# Check if ngrok is running
Get-Process ngrok

# Kill existing processes
Stop-Process -Name ngrok -Force

# Restart
ngrok http 3000
```

### Issue 3: MercadoPago Can't Reach Webhook
**Possible Causes:**
- ngrok tunnel expired (restarts every 2 hours on free plan)
- Firewall blocking ngrok
- Dev server not running

**Solution:**
1. Check ngrok is running: `ngrok http 3000`
2. Verify dev server: `pnpm dev`
3. Test webhook URL manually: `curl https://your-url.ngrok-free.app/api/webhooks/mercadopago`

### Issue 4: Free Plan Limitations
**Limits:**
- 1 online ngrok agent session
- 40 connections/minute
- Random URLs each time (no custom subdomain)

**For Production:** Use paid ngrok or deploy to Vercel/production environment

---

## 📋 Development Workflow

### Daily Workflow

1. **Start Dev Server:**
   ```powershell
   pnpm dev
   ```

2. **Start ngrok (separate terminal):**
   ```powershell
   ngrok http 3000
   ```

3. **Copy ngrok URL** from terminal

4. **Update MercadoPago webhook** (if URL changed)

5. **Test payment flow:**
   - Create order in app
   - Complete payment in sandbox
   - Check webhook received in ngrok inspector

6. **Stop ngrok when done:**
   - Press `Ctrl+C` in ngrok terminal

### Testing Without ngrok

For local testing without webhooks:
1. Use MercadoPago test cards
2. Manually check payment status via API
3. Create mock webhook payloads in tests

---

## 🔐 Security Best Practices

### Don't Expose Sensitive Data
- ✅ Use test credentials only
- ✅ Check webhook signatures
- ✅ Validate webhook origin
- ❌ Never commit authtoken to git

### Webhook Signature Verification

```typescript
// app/api/webhooks/mercadopago/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  const signature = req.headers.get('x-signature');
  const requestId = req.headers.get('x-request-id');
  
  // Verify signature
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const body = await req.text();
  
  const hash = crypto
    .createHmac('sha256', secret!)
    .update(body)
    .digest('hex');
  
  if (hash !== signature) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // Process webhook...
}
```

---

## 📚 Additional Resources

- **ngrok Docs:** https://ngrok.com/docs
- **ngrok Dashboard:** https://dashboard.ngrok.com
- **MercadoPago Webhooks:** https://www.mercadopago.com.uy/developers/es/docs/your-integrations/notifications/webhooks
- **ngrok Pricing:** https://ngrok.com/pricing (if you need advanced features)

---

## ✅ Checklist

### Setup (One-time)
- [x] Install ngrok (Microsoft Store + npm)
- [ ] Create ngrok account
- [ ] Get authtoken
- [ ] Run `ngrok config add-authtoken YOUR_TOKEN`
- [ ] Test basic tunnel: `ngrok http 3000`

### For Each Development Session
- [ ] Start dev server: `pnpm dev`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Copy ngrok URL
- [ ] Update MercadoPago webhook URL (if changed)
- [ ] Test webhook with payment

### Before Production
- [ ] Remove ngrok webhook from MercadoPago
- [ ] Add production webhook URL (e.g., `https://laaldeatala.com.uy/api/webhooks/mercadopago`)
- [ ] Test production webhooks
- [ ] Set up webhook secret verification

---

**Status:** Ready for webhook testing after authentication ✅  
**Next:** Complete authentication and test first webhook
