# trypack.app — Pack waitlist landing

Next.js 14 (App Router) + Tailwind. Lives at `trypack.app`.

## Local dev

```bash
cd apps/landing
cp .env.example .env.local
# fill in Supabase URL + service-role key
npm install
npm run dev
```

Opens at http://localhost:3000.

## Deploy

Vercel:

1. Import this directory as a Vercel project (root: `apps/landing`).
2. Set env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_STORE_URL` (when iOS is live)
   - `NEXT_PUBLIC_PLAY_STORE_URL` (when Android is live)
3. Bind `trypack.app` as the production domain.

## Routes

| Path             | What                                                       |
|------------------|------------------------------------------------------------|
| `/`              | Marketing landing + waitlist form                          |
| `/r/[code]`      | Referral capture (e.g. `/r/PCK-W-XK7P9A`)                  |
| `/api/join`      | POST waitlist signup. Per-IP rate-limited.                 |
| `/api/rank`      | GET `?email=` → current rank + total                       |

## Schema dependency

Requires `scripts/m27a-waitlist.sql` applied to Supabase. The route handlers
call the `join_waitlist(...)` and `waitlist_rank_for(...)` RPCs.

## Honesty notes

- Waitlist count shown to users is **real** (no fake "1,247 already joined").
- Tote promise text says "we'll ship within ~4 weeks" — keep this accurate.
- App store badges are placeholders until apps are live in their stores.
