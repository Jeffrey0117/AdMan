# AdMan

Ad management platform with embeddable widgets + built-in site analytics (瘦版 GA).

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Config data: JSON files (data/projects.json, data/ads.json, data/sites.json)
- Event data: SQLite (data/events.db, better-sqlite3 + WAL)
- esbuild for embed bundles (adman.js + track.js)
- Port: 4003

## Run

```bash
pnpm dev          # dev server
pnpm build        # build (embeds + next)
pnpm start        # production
```

Required env: `ADMAN_ADMIN_TOKEN` (all write APIs + admin UI login; secure by default — missing token rejects everything).

## Key Files

```
src/app/api/projects/route.ts     — Project CRUD
src/app/api/ads/route.ts          — Ad CRUD (list, create)
src/app/api/ads/[adId]/route.ts   — Ad update, delete
src/app/api/serve/[adId]/route.ts — Public ad serving (CORS)
src/app/api/upload/route.ts       — Image upload (auth, magic-bytes, no SVG)
src/app/api/track/route.ts        — Public event collector (CORS, zod, origin whitelist)
src/app/api/stats/route.ts        — Analytics aggregates (auth)
src/app/api/sites/route.ts        — Site registry CRUD (auth)
src/lib/storage.ts                — JSON file operations
src/lib/events-db.ts              — SQLite event store + aggregates
src/lib/models.ts                 — Zod schemas (SafeUrlSchema blocks javascript: etc)
src/lib/auth.ts                   — withAuth Bearer middleware
src/lib/api-client.ts             — Admin UI fetch wrapper (token in localStorage)
src/components/layout/auth-gate.tsx — Admin UI login gate
src/embed/adman-embed.ts          — Ad widget bundle (auto impression/click tracking)
src/embed/track.ts                — Site analytics SDK (2.5kb, one-line install)
```

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/projects`, `/api/ads`, `/api/ads/:id` | — | Reads |
| POST/PUT/DELETE | `/api/projects*`, `/api/ads*` | Bearer | Admin writes |
| POST | `/api/upload` | Bearer | Upload image (max 5MB, jpeg/png/gif/webp) |
| GET | `/api/serve/:adId` | — | Serve ad (public, CORS) |
| POST | `/api/track` | — | Collect events (public, CORS) |
| GET | `/api/stats?adId=\|siteKey=&days=` | Bearer | Ad CTR / site funnel analytics |
| GET/POST | `/api/sites` · PUT/DELETE `/api/sites/:id` | Bearer | Site keys for track.js |
| GET | `/api/auth/check` | Bearer | Token probe for UI login |

## Events

- ad scope: `ad_impression` / `ad_click` (auto from adman.js)
- site scope: `page_view` / `section_view` / `cta_click` / `dwell` (track.js; sections/ctas via `data-track-section` / `data-track-cta` attributes, arbitrary strings)

## CloudPipe

- Manifest: `data/manifests/adman.json`
- Auth: Bearer via `ADMAN_ADMIN_TOKEN` (gateway injects from data/manifests/auth.json)
- Entry: `index.js`
