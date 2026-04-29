# CLAUDE.md

Collaborative festival/event lineup builder. Users create, share, and vote on musical lineups. Spotify integration for artist data. Social discovery features: comments, voting, leaderboards, OG meta tags for link previews.

## Stack

- **Frontend:** React 18 + Vite 5.4 + Tailwind CSS 3.4 + React Router 6
- **Backend:** Express 5.1 (Node.js)
- **Database:** Turso (hosted SQLite via @libsql/client), local `file:./db/backyard-marquee.db` for dev
- **Auth:** JWT + bcryptjs + Google OAuth (google-auth-library)
- **Deployment:**
  - Frontend: Vercel, canonical at `https://backyardmarquee.thediffraction.com` (also reachable at `backyard-marquee.vercel.app`). Config in `client/vercel.json`.
  - API: Render at `https://backyard-marquee-api.onrender.com`. Built from `server/`.
  - Frontend bundle hardcodes the API URL via `VITE_API_URL` set in the Vercel build env.
- **Package manager:** npm (separate package.json in client/ and server/)

## Structure

```
backyard-marquee/
├── server/                # Deployed to Render (Express, long-running Node)
│   ├── index.js           # Express setup, OG meta tag injection (only hit by crawlers via Vercel rewrite — see below)
│   ├── db/index.js        # Turso/SQLite connection
│   ├── middleware/auth.js # JWT verification
│   ├── routes/            # auth, lineups, artists, stats, users
│   └── .env               # secrets (not committed)
├── client/                # Deployed to Vercel (static SPA)
│   ├── api/               # Vercel Edge/serverless functions (e.g. crawler OG proxy)
│   ├── src/
│   │   ├── pages/         # CreateLineup, EditLineup, ViewLineup, Discover, UserProfile, Leaderboard, ArtistDetail
│   │   ├── components/    # ArtistSearch, LineupSlot, Comments, Navbar, TagInput
│   │   ├── context/       # AuthContext, ThemeContext
│   │   └── api/           # Request logic
│   ├── vercel.json        # SPA rewrites + crawler-UA rewrite for /lineup/:id
│   ├── vite.config.js     # Dev-only proxy of /api to localhost:3001
│   └── tailwind.config.js
```

## Commands

```bash
# Server (from server/)
npm run dev              # node --watch index.js, port 3001

# Client (from client/)
npm run dev              # Vite dev server, port 5173
npm run build            # Production build
```

No tests or linting configured.

## Environment

`server/.env` requires:

```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
JWT_SECRET=                  # required — server fails to boot if unset
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
FRONTEND_URL=                # CORS lock — must match the canonical frontend origin (prod: https://backyardmarquee.thediffraction.com)
PORT=3001
```

`client/` build env (set in Vercel):

```
VITE_API_URL=https://backyard-marquee-api.onrender.com/api
```

## Key patterns

- **Monorepo:** Client and server are separate npm projects. No shared workspace.
- **Guest accounts:** Unregistered users get guest JWTs to create lineups, then upgrade via claim token flow.
- **OG meta tags:** Vercel rewrites `/lineup/:id` for crawler User-Agents to a Vercel function (`client/api/lineup-og.js`) that injects OG meta tags with HTML entity escaping. Without this, crawlers would hit the static SPA and see no OG data.
- **Rate limiting:** express-rate-limit on sensitive endpoints.
- **Lineup export:** html-to-image for shareable lineup images.

## Don't

- **Don't run `npm install` at root.** Each subfolder (client/, server/) has its own package.json. Install separately.
- **Don't hardcode the backend port.** Vite proxy config in `client/vite.config.js` assumes port 3001. If you change PORT in server/.env, update the proxy too.
- **Don't skip HTML escaping in OG tags.** The server injects user-provided lineup titles into meta tags for crawlers. Always escape.
- **Don't commit .env or .db files.** The .gitignore uses a whitelist model (ignores everything by default, explicitly allows client/ and server/ trees).
