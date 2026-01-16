# La Aldea E-Commerce

E-commerce platform for La Aldea - Tala, Uruguay. Built with Next.js 16, TypeScript, Tailwind CSS, Supabase, and MercadoPago.

## 🚀 Tech Stack

- **Frontend:** Next.js 16 + React + TypeScript + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Payments:** MercadoPago Uruguay
- **Hosting:** Vercel
- **Analytics:** Google Analytics 4

## 📋 Pre-Development Setup (COMPLETED ✅)

### Card 1: Repository & Environment ✅
- [x] Node.js v20.20.0 installed
- [x] pnpm 10.28.0 installed
- [x] Next.js 16.1.2 project initialized
- [x] Git repository created and connected to GitHub
- [x] VS Code extensions configured (ESLint, Prettier, Tailwind IntelliSense)

### Card 2: Supabase Database ✅
- [x] Supabase project created (laaldea-prod, São Paulo region)
- [x] Complete database schema executed (9 tables)
- [x] Row Level Security (RLS) policies enabled
- [x] Test products inserted
- [x] Connection verified

### Card 3: MercadoPago Setup ✅
- [x] Developer account created
- [x] Test/sandbox credentials obtained
- [x] Test users created (TESTUSER3327, TESTUSER5624)
- [x] Payment flow tested successfully (Operation #141682243149)
- [x] Preference creation script working (`test-mp.js`)

### Card 4: Environment Variables ✅
- [x] `.env.local` created with all credentials
- [x] `.env.example` template created (safe for git)
- [x] `.gitignore` configured to exclude sensitive files
- [x] Environment variables validated with `test-env.js`
- [x] All critical variables loading successfully

## 🔧 Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm (recommended) or npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/la-aldea-ecom.git
cd la-aldea-ecom
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your real credentials:
# - Supabase URL and keys (from https://supabase.com/dashboard)
# - MercadoPago tokens (from https://www.mercadopago.com.uy/developers)
```

4. Test environment variables:
```bash
node test-env.js
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

### Test Environment Variables
```bash
node test-env.js
```

### Test MercadoPago Integration
```bash
node test-mp.js
```
This will create a test payment preference and return a checkout URL.

### Test Documentation
See [TESTING.md](./TESTING.md) for complete testing procedures including:
- Test users credentials
- Test cards for Uruguay
- Payment flow testing
- Troubleshooting guide

## 📁 Project Structure

```
la-aldea-ecom/
├── app/                    # Next.js 16 App Router
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components (to be created)
├── lib/                   # Utilities and helpers (to be created)
├── types/                 # TypeScript type definitions (to be created)
├── public/                # Static assets
├── test-mp.js            # MercadoPago testing script
├── test-env.js           # Environment variables validator
├── TESTING.md            # Testing documentation
├── .env.local            # Environment variables (not in git)
├── .env.example          # Environment template (safe for git)
└── README.md             # This file
```

## 🔒 Security

- Never commit `.env.local` to git (already in `.gitignore`)
- Use `NEXT_PUBLIC_*` prefix only for variables safe to expose in browser
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `MP_ACCESS_TOKEN` server-side only
- Rotate keys immediately if accidentally exposed

## 📚 Documentation

- [Testing Guide](./TESTING.md) - Complete testing procedures
- [Tech Guide](../la-aldea-ecom-data/nextjs_tech_guide.md) - Full technical documentation
- [Supabase Credentials](../la-aldea-ecom-data/supabase_cred.md) - Database credentials reference

## 🗺️ Development Roadmap

**Week 1: Foundation** (Cards 1-4) ✅ COMPLETED
- [x] Repository & Environment Setup
- [x] Database Configuration
- [x] Payment Gateway Setup
- [x] Environment Variables

**Week 2: Core E-Commerce** (Cards 5-8)
- [ ] Project structure setup
- [ ] Product listing page
- [ ] Product detail pages
- [ ] Shopping cart functionality

**Week 3: Backend & Testing** (Cards 9-12)
- [ ] API routes (orders, payments)
- [ ] MercadoPago webhook
- [ ] End-to-end testing
- [ ] Admin panel

**Week 4: Production Launch** (Cards 13-16)
- [ ] Production credentials
- [ ] Domain configuration
- [ ] Analytics setup
- [ ] Go live! 🚀

## 🛠️ Scripts

```bash
# Development
pnpm dev          # Start dev server (with Turbopack)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Testing
node test-env.js  # Validate environment variables
node test-mp.js   # Test MercadoPago integration
```

## 🌐 Environment Variables

See `.env.example` for complete list. Required variables:

```bash
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-only!

# MercadoPago (Payments)
MP_PUBLIC_KEY=                    # Frontend-safe
MP_ACCESS_TOKEN=                  # Server-only!

# App Config
NEXT_PUBLIC_URL=
NODE_ENV=

# Analytics
NEXT_PUBLIC_GA_ID=
```

## 📞 Support

- **Project Owner:** Marcos Betancor
- **Business:** La Aldea - Tala, Uruguay
- **Repository:** [GitHub](https://github.com/your-username/la-aldea-ecom)

## 📄 License

Private project. All rights reserved.

---

**Last Updated:** January 16, 2026  
**Current Status:** Week 1 Complete ✅ | Ready for Week 2 Development
