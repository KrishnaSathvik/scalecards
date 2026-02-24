# ScaleCards

**See the numbers. Feel the scale.**

Unit-based data visualizations that make big numbers tangible, shareable, and sourced. Each dot tells a story.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What is ScaleCards?

ScaleCards turns overwhelming statistics into interactive dot-grid visualizations. Each card represents a real-world dataset — from global CO₂ emissions to live Bitcoin prices — rendered as a grid where **every dot represents a unit** (e.g., 1 dot = 10M people).

**26 cards** across 5 categories:

| Category | Examples |
|----------|----------|
| 🔴 **Live Data** | Bitcoin price, Ethereum, flights in the air, earthquakes today |
| 💰 **Finance** | US National Debt, Trillion Dollar Club, market mood |
| 🌍 **Environment** | CO₂ emissions, renewable energy, ocean plastic, deforestation |
| 👥 **Humanity** | World population growth, poverty line, water access, food waste |
| 💻 **Technology** | Active satellites, internet access, smartphone adoption, AI adoption |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/KrishnaSathvik/scalecards.git
cd scalecards
npm install
```

### 2. Set up database

Create a free Postgres database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).

```bash
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
```

### 3. Push schema & seed data

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
scalecards/
├── app/
│   ├── page.tsx                 # Gallery — filterable card grid
│   ├── v/[slug]/page.tsx        # Card detail page
│   ├── api/
│   │   ├── refresh/             # Data refresh endpoints (auth-protected)
│   │   ├── watchdog/            # Annual data publication detector
│   │   ├── og/[slug]/           # OG image generation (Satori → PNG)
│   │   ├── export/[slug]/       # SVG export
│   │   └── inngest/             # Background job handler
│   ├── robots.ts                # SEO: robots.txt
│   ├── sitemap.ts               # SEO: dynamic sitemap
│   └── manifest.ts              # PWA manifest
├── components/                  # React components
├── lib/
│   ├── grid.ts                  # Core grid math (shared by all renderers)
│   ├── db.ts                    # Prisma singleton
│   └── datasets/
│       ├── registry.ts          # 26 dataset fetchers (APIs → snapshots)
│       ├── freshness.ts         # Data freshness badges
│       ├── card-knowledge.ts    # Per-card educational content
│       ├── data-context.ts      # "Why this data year?" context
│       └── watchdog.ts          # Annual data publication probes
├── inngest/                     # Scheduled background functions
├── prisma/schema.prisma         # Database schema
└── scripts/                     # Seed, refresh, test utilities
```

### Grid Algorithm

- Total cells = rows × cols (e.g., 50×50 = 2,500 dots)
- Dots per category = `value / dotValue`, rounded via **largest-remainder method**
- Fill order: row-major (deterministic — same data always produces same visual)
- OG mode uses a smaller grid (20×25) for thumbnail readability

---

## Data Sources

All 26 datasets pull from **real, public APIs** — no hardcoded data:

| Source | Datasets | Refresh |
|--------|----------|---------|
| CoinGecko / Coinlore | Bitcoin, Ethereum | Hourly |
| US Treasury | National Debt | Daily |
| OpenSky Network | Flights in the air | Hourly |
| USGS | Earthquakes today | Hourly |
| NASA NeoWs | Near-Earth asteroids | Daily |
| Worldometer | Population growth | Daily |
| Wikimedia | Wikipedia pageviews | Daily |
| Finnhub | Trillion Dollar Club, Market Mood | Hourly |
| Our World in Data | CO₂, EVs, energy, poverty, water | Weekly |
| World Bank API | Military, internet, smartphones | Weekly |
| Ember Energy | Renewable energy mix | Weekly |
| UCS / Celestrak | Active satellites | Weekly |
| Various estimates | AI adoption, cyber threats, food, plastic, forests | Weekly |

---

## Stack

- **Next.js 15** (App Router, ISR 60s)
- **TypeScript** (strict mode)
- **Tailwind CSS** (dark/light theme)
- **PostgreSQL** via Neon/Supabase
- **Prisma** ORM
- **Inngest** for scheduled jobs
- **Vercel** for hosting + OG images

---

## Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="https://scalecards.dev"

# Security (required in production)
CRON_SECRET=""                  # Protects /api/refresh + /api/watchdog

# Optional
FINNHUB_API_KEY=""              # Live market caps
INNGEST_EVENT_KEY=""            # Background jobs
INNGEST_SIGNING_KEY=""          # Background jobs
```

---

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:seed      # Seed 26 datasets + cards
npm run db:reset     # Wipe + re-seed
npm run db:studio    # Prisma Studio (browse data)
```

---

## Security

- Admin API routes (`/api/refresh`, `/api/watchdog`) require `CRON_SECRET`
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- `X-Powered-By` header disabled
- `.env` / `.env.local` gitignored

---

## License

MIT
