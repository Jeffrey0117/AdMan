# AdMan

Ad management platform with embeddable widgets.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- File-based JSON storage (data/projects.json, data/ads.json)
- esbuild for embed bundle
- Port: 4003

## Run

```bash
pnpm dev          # dev server
pnpm build        # build (embed + next)
pnpm start        # production
```

## Key Files

```
src/app/api/projects/route.ts    — Project CRUD
src/app/api/ads/route.ts         — Ad CRUD (list, create)
src/app/api/ads/[adId]/route.ts  — Ad update, delete
src/app/api/serve/[adId]/route.ts — Public ad serving (CORS)
src/app/api/upload/route.ts      — Image upload
src/lib/storage.ts               — JSON file operations
src/lib/models.ts                — Zod schemas
src/embed/adman-embed.ts         — Embeddable widget bundle
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/ads` | List ads (?projectId filter) |
| POST | `/api/ads` | Create ad |
| GET | `/api/ads/:adId` | Get ad |
| PUT | `/api/ads/:adId` | Update ad |
| DELETE | `/api/ads/:adId` | Delete ad |
| POST | `/api/upload` | Upload image (max 5MB) |
| GET | `/api/serve/:adId` | Serve ad (public, CORS) |

## CloudPipe

- Manifest: `data/manifests/adman.json` (8 tools)
- Auth: none
- Entry: `index.js`
