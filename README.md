# ScaleCards

**See the numbers. Feel the scale.**

Unit-based data visualizations that make big numbers tangible, shareable, and sourced.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up database

Create a Postgres database on [Neon](https://neon.tech) (free tier works) or [Supabase](https://supabase.com).

```bash
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
```

### 3. Push schema + seed data

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
Gallery (/) → 10 curated cards with mini grid previews
Card Page (/v/:slug) → Full SVG grid + legend + sources + share/export
OG Image (/api/og/:slug) → Satori-rendered 1200x630 preview
Export (/api/export/:slug) → Downloadable SVG
Inngest (hourly cron) → Auto-refresh Bitcoin + Wikipedia data
```

### Two render paths (shared math)

| Component | Use | Tech |
|-----------|-----|------|
| `CardGridSvg` | Card page + SVG export | Pure SVG `<rect>` elements |
| OG route | Social previews | Satori JSX → PNG (fewer dots, bigger) |
| `lib/grid.ts` | Both | Grid spec generator (shared) |

### Grid algorithm

- Total cells = rows × cols
- Dots per category = `round(value / dotValue)` using largest-remainder method
- Fill row-major (deterministic: same data → same visual)
- OG mode uses smaller grid (20×25 vs 50×50) for thumbnail readability

---

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** (dark theme)
- **Postgres** via Neon/Supabase
- **Prisma** ORM
- **Inngest** for scheduled dataset refresh
- **Vercel** for hosting + OG image generation

---

## Dataset Auto-Refresh

Only 2 datasets auto-refresh in MVP:

| Dataset | Source | Frequency |
|---------|--------|-----------|
| Bitcoin price | CoinGecko API | Hourly |
| Wikipedia pageviews | Wikimedia API | Daily |

All others are seeded as manual snapshots. Add more fetchers in `lib/datasets/registry.ts`.

---

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:seed      # Seed 10 datasets + cards
npm run db:reset     # Wipe + re-seed
npm run db:studio    # Prisma Studio (browse data)
```

---

## Future (post-traction)

- [ ] User accounts + custom datasets
- [ ] PNG export (headless Chromium)
- [ ] Embed `<iframe>` mode
- [ ] Stacked waffle grids
- [ ] Timeline playback (snapshot history)
- [ ] Pro tier: custom branding, private cards
