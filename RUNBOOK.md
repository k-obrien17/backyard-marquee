# Runbook

Operational playbook for backyard-marquee. Read first when something is broken.

Architecture in one line: **client on Vercel → API on Render → Turso DB.** Anything red below means one of those three. Triangulate before deeper investigation.

---

## 0. Where to look first

| Symptom | First check |
|---|---|
| Site won't load | https://www.vercel-status.com + Vercel dashboard |
| Site loads, every action says "Failed to..." | API health (below) + Render dashboard |
| API health 200 but `/api/lineups` returns 500 | Turso status + Render logs |
| Google sign-in button doesn't appear | `VITE_GOOGLE_CLIENT_ID` in Vercel env vars |
| Artist search empty / "Failed to search" | `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` on Render |

### Quick health checks
```bash
curl -s https://backyard-marquee-api.onrender.com/api/health
# → {"status":"ok","timestamp":"..."}

curl -sI https://backyardmarquee.thediffraction.com/ | head -5
# → HTTP/2 200
```

If `/api/health` is slow (>3s) the API is cold-starting (Render free tier sleeps after 15min idle). Wait 30s, retry.

---

## 1. Rollback

### Frontend (Vercel)
1. https://vercel.com → backyard-marquee project → Deployments
2. Find the last known-good deployment, click `...` → **Promote to Production**
3. Or: `vercel rollback` from the CLI (must be authenticated)

Vercel rollback is near-instant. Use it. Do not try to "fix forward" if the site is down.

### Backend (Render)
1. https://dashboard.render.com → backyard-marquee-api → **Manual Deploy** → pick a previous commit
2. ~2-3 min before it's live
3. There is no instant rollback — the deploy queue is sequential

If you need to take the API offline entirely while you fix it: Settings → Suspend Service.

---

## 2. Kill switches (during abuse / spam / incidents)

### Throttle anonymous lineup creation
In `server/routes/lineups.js`, drop the anon rate limit:
```js
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: (req) => (req.user ? 20 : 0), // ← was 5; 0 blocks all anon creates
  message: { error: 'Too many lineups created, try again later' },
});
```
Deploy. Anon-create is effectively off without disabling signups.

### Block new signups
Drop `authLimiter` max to 0 in `server/routes/auth.js`. Existing users keep working; nobody new gets in.

### Wipe abusive content
Direct SQL via `turso db shell backyard-marquee`:
```sql
-- find recent suspicious lineups
SELECT id, title, created_at, user_id FROM lineups ORDER BY id DESC LIMIT 50;

-- delete one
DELETE FROM lineups WHERE id = <id>;

-- nuke a user (CASCADE cleans up their lineups, comments, likes)
DELETE FROM users WHERE id = <id>;
```

### Force-logout everyone
Rotate `JWT_SECRET` in Render env vars. All existing tokens become invalid; users see "Invalid or expired token" and must re-sign-in. **Use only as last resort.**

---

## 3. Guest user reaper

Manual today (TODO: schedule on Render Cron).

```bash
cd server
npm run reap-guests          # dry run, prints what would delete
npm run reap-guests:commit   # actually delete
```

Runs against whichever DB is in `server/.env`. Verify `TURSO_DATABASE_URL` before `--commit`.

Safe to run anytime: only deletes `password_hash='guest'` rows with zero lineups.

---

## 4. Smoke test (run after every deploy)

5 steps, ~2 minutes:

1. `curl -s https://backyard-marquee-api.onrender.com/api/health` → `{"status":"ok",...}`
2. Open https://backyardmarquee.thediffraction.com — hero loads, no console errors
3. Open `/discover` — lineup grid renders
4. Sign in with a test account → land on `/create` without error
5. Create a 1-artist lineup, click SAVE → land on `/lineup/:id`, share URL works

If any step fails, roll back (section 1).

---

## 5. First-24-hour watchlist (post-launch)

Watch these on day 1. Decide thresholds before you start so you don't spiral.

| Signal | Where | Soft alert |
|---|---|---|
| New users / hour | `SELECT COUNT(*) FROM users WHERE created_at > datetime('now','-1 hour')` | > 100 = suspect spam |
| Guest user accumulation | `SELECT COUNT(*) FROM users WHERE password_hash='guest'` | > 500 in 24h = check honeypot |
| New lineups / hour | `SELECT COUNT(*) FROM lineups WHERE created_at > datetime('now','-1 hour')` | none |
| API 5xx rate | Render logs (search `Error:`) | any sustained = investigate |
| Spotify search 5xx | Render logs (search `Spotify API error`) | > 10% = consider mock fallback |
| GA page views | https://analytics.google.com | reality check vs deploy expectations |

---

## 6. Third-party dependencies

| Service | What it does | If it's down |
|---|---|---|
| **Vercel** | Hosts SPA + OG-card edge function | Site is dark. No fallback. Wait it out. |
| **Render** | Hosts Express API | Every API call fails. Frontend stays up but read/write all break. |
| **Turso** | Hosted SQLite (lineups, users, comments, likes) | API returns 500. Render stays up but useless. |
| **Spotify Web API** | Artist search | `/api/artists/search` returns empty/mock. UX degrades; site stays up. |
| **Google OAuth** | Google sign-in | Google button fails. Username/password sign-in still works. |
| **Google Analytics** | Page-view tracking | No data captured; everything else works. |

### Support links
- Vercel status: https://www.vercel-status.com
- Vercel support: dashboard → bottom-right chat
- Render status: https://status.render.com
- Render support: https://render.com/support
- Turso status: https://status.turso.tech
- Turso support: Discord / hello@turso.tech
- Spotify dev status: https://developer.spotify.com/community/news

---

## 7. Environment variable map

| Var | Lives where | Required |
|---|---|---|
| `TURSO_DATABASE_URL` | Render | Yes |
| `TURSO_AUTH_TOKEN` | Render | Yes |
| `JWT_SECRET` | Render | Yes — server refuses to boot without it |
| `SPOTIFY_CLIENT_ID` | Render | Yes (otherwise mock artist data) |
| `SPOTIFY_CLIENT_SECRET` | Render | Yes |
| `GOOGLE_CLIENT_ID` | Render + Vercel (as `VITE_GOOGLE_CLIENT_ID`) | Yes for Google sign-in |
| `FRONTEND_URL` | Render | Yes — CORS lock |
| `PORT` | Render (auto-injected) | No (auto) |
| `VITE_API_URL` | Vercel | Yes (baked into client bundle at build time) |

### Critical pairings
- `FRONTEND_URL` (Render) must equal the canonical origin: `https://backyardmarquee.thediffraction.com`. If it drifts, all browser API calls fail with CORS.
- `VITE_API_URL` is baked into the client bundle. Changing it requires a Vercel redeploy.
- `JWT_SECRET` rotation invalidates every active session.

---

## 8. Logs and observability

**Right now: minimal.** Add Sentry and UptimeRobot before launch (separate task).

- **Render logs:** Dashboard → backyard-marquee-api → Logs. Persisted for ~7 days on free tier.
- **Vercel logs:** Dashboard → backyard-marquee → Logs / Runtime Logs. Useful for the `/api/lineup-og` function.
- **Vercel build logs:** Dashboard → Deployments → click any deployment → Build Logs.
- **Google Analytics:** https://analytics.google.com (property `G-GMRWNMWY9F`).
- **Browser console (production):** open dev tools on the live site; React Router warnings are noise, anything else is a clue.

---

## 9. Known footguns

- **Render free tier sleeps after 15min idle.** First request takes ~20-30s. This looks like the site is broken; it isn't. UptimeRobot pinging `/api/health` every 5 min keeps it warm.
- **Vercel rewrites for crawlers depend on UA string.** If you change the regex in `client/vercel.json`, test with `curl -H "User-Agent: facebookexternalhit/1.1"` before deploying.
- **Two domains.** Canonical is `backyardmarquee.thediffraction.com`. The Vercel default `backyard-marquee.vercel.app` also resolves. CORS is locked to the canonical only — the vercel.app SPA cannot make API calls. Don't share that URL.
- **JWT in localStorage carries `user.id`, not `user.username`.** `AuthContext` sets the visible user state only when both `token` AND `username` are stored. Guest users have a token but no username, so they appear logged-out in the UI even though the JWT works against the API.
- **Migrations live in code, not files.** `server/db/index.js` runs them on every boot. They are idempotent and silently swallow errors — if you change one, redeploy and grep the Render boot log for "Database initialized" before assuming success.

---

## 10. Incident log

Append-only. Format: date, symptom, root cause, fix, lesson.

_(empty — first incident goes here)_
