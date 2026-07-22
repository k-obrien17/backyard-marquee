# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Positioning

Backyard Marquee is a concert lineup builder: users create, share, and discuss 5-artist bills, with Spotify-backed artist search and social features (comments, likes, leaderboards). This directory is the **public-facing checkout**: it shares its GitHub remote with `backyard-marquee` (the internal working copy, which also carries GSD planning docs, audits, and a HANDOFF.md), but its own recent history is public-repo hygiene work rather than feature work. When in doubt, treat this directory as the one that should stay safe to make public: no internal planning docs, no secrets, no `.env` files.

**Relationship to `backyard-marquee`:** both directories point at the same GitHub repo and share history up to a common ancestor commit (`d234071`). They have since diverged: this directory added public README/screenshots and hardened its public-repo notes; the other directory has unpushed design-system-adoption work on a branch called `design-system-te`. Because both track the same remote, whichever one pushes to `origin/main` next will not carry the other's post-divergence commits. Reconcile before pushing from either side; don't assume this directory is automatically up to date with feature work happening in `backyard-marquee`.

## Current state

- **Stable:** artist search (Spotify-backed), lineup creation, comments/likes, leaderboard, OG-image share previews
- **In-flight:** none
- **Migrating:** none

## Commands

```bash
cd server
npm install
npm run dev              # node --watch index.js

cd client
npm install
npm run dev               # vite dev server
npm run build
```

## Environment variables

| Var | Used by | Notes |
|---|---|---|
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | server | Turso/SQLite connection |
| `JWT_SECRET` | server | auth token signing |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | server | artist search |
| `GOOGLE_CLIENT_ID` | server | Google OAuth |
| `FRONTEND_URL` | server | CORS allowlist |
| `VITE_API_URL` | client (build time) | API base URL baked into the static bundle |

## Architecture

### Stack

- Client: React 18, Vite 5, Tailwind CSS 3, React Router 6
- Server: Express 5, `@libsql/client` (Turso), `jsonwebtoken`, `bcryptjs`, `google-auth-library`, `helmet`, `express-rate-limit`
- Deployment: client on Vercel, server on Render, per `RUNBOOK.md`

### Key directories

| Path | Purpose |
|---|---|
| `client/src/pages/` | route-level views: Home, Discover, CreateLineup, EditLineup, ViewLineup, Leaderboard, MyLineups, ArtistDetail, auth pages |
| `client/src/components/`, `client/src/context/` | shared UI and React context (auth, theme) |
| `client/api/` | Vercel serverless functions |
| `server/routes/` | `auth.js`, `lineups.js`, `artists.js`, `stats.js`, `users.js` |
| `server/db/` | Turso/SQLite connection layer |
| `server/scripts/reap-guest-users.js` | scheduled cleanup of disposable guest accounts (`npm run reap-guests`, `--commit` to actually delete) |

## Conventions

- Guest accounts are intentional and rate-limited; `reap-guests` cleans them up periodically. Don't treat guest-account growth as a bug to silently suppress.
- Server-side secrets (Spotify, Turso, JWT) never reach the client bundle; only `VITE_API_URL` is baked in at build time.

## Don't

- Don't commit `.env` files, real API keys, OAuth secrets, database tokens, private user exports, logs, or moderation/admin data. This is the public-facing repo.
- Don't push to `origin/main` from here without first checking whether `backyard-marquee`'s `design-system-te` branch has work that needs reconciling first; the two directories can silently diverge (see Positioning).
- Don't add a bundler/build step beyond Vite, or introduce a second database. The stack is deliberately small.

## Reference

- `README.md`, public-facing project overview and live URLs
- `RUNBOOK.md`, deploy split, health checks, required env vars
- `SECURITY.md`, threat model, accepted risks, required secrets
