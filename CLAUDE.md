# CLAUDE.md

Collaborative festival/event lineup builder. Users create, share, and vote on musical lineups. Spotify integration for artist data. Social discovery features: comments, voting, leaderboards, OG meta tags for link previews.

## Stack

- **Frontend:** React 18 + Vite 5.4 + Tailwind CSS 3.4 + React Router 6
- **Backend:** Express 5.1 (Node.js)
- **Database:** Turso (hosted SQLite via @libsql/client), local `file:./db/backyard-marquee.db` for dev
- **Auth:** JWT + bcryptjs + Google OAuth (google-auth-library)
- **Deployment:** Vercel (vercel.json at root)
- **Package manager:** npm (separate package.json in client/ and server/)

## Structure

```
backyard-marquee/
├── server/
│   ├── index.js          # Express setup, OG meta tag injection for crawlers
│   ├── db/index.js       # Turso/SQLite connection
│   ├── middleware/auth.js # JWT verification
│   ├── routes/           # auth, lineups, artists, stats, users
│   └── .env              # secrets (not committed)
├── client/
│   ├── src/
│   │   ├── pages/        # CreateLineup, EditLineup, ViewLineup, Discover, UserProfile, Leaderboard, ArtistDetail
│   │   ├── components/   # ArtistSearch, LineupSlot, Comments, Navbar, TagInput
│   │   ├── context/      # AuthContext, ThemeContext
│   │   └── api/          # Request logic
│   ├── vite.config.js    # Proxies /api to localhost:3001
│   └── tailwind.config.js
└── vercel.json
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
JWT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
FRONTEND_URL=
PORT=3001
```

## Key patterns

- **Monorepo:** Client and server are separate npm projects. No shared workspace.
- **Guest accounts:** Unregistered users get guest JWTs to create lineups, then upgrade via claim token flow.
- **OG meta tags:** Server injects meta tags for social crawlers (Discord, Twitter) with HTML entity escaping for XSS protection.
- **Rate limiting:** express-rate-limit on sensitive endpoints.
- **Lineup export:** html-to-image for shareable lineup images.

## Don't

- **Don't run `npm install` at root.** Each subfolder (client/, server/) has its own package.json. Install separately.
- **Don't hardcode the backend port.** Vite proxy config in `client/vite.config.js` assumes port 3001. If you change PORT in server/.env, update the proxy too.
- **Don't skip HTML escaping in OG tags.** The server injects user-provided lineup titles into meta tags for crawlers. Always escape.
- **Don't commit .env or .db files.** The .gitignore uses a whitelist model (ignores everything by default, explicitly allows client/ and server/ trees).
