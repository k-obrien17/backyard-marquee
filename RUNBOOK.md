# Runbook

Operational notes for Backyard Marquee.

## Quick checks

```bash
curl -s https://backyard-marquee-api.onrender.com/api/health
curl -sI https://backyardmarquee.thediffraction.com/ | head -5
```

## Deployment split

- Frontend: Vercel
- API: Render
- Database: Turso

## Required env vars

### `server/.env`

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
JWT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
FRONTEND_URL=
PORT=3001
```

### `client`

```bash
VITE_API_URL=https://backyard-marquee-api.onrender.com/api
```

## Local dev

```bash
cd server
npm run dev

cd client
npm run dev
```

## Notes

- If the API is slow, Render may be cold-starting.
- If the frontend or API URL changes, update the matching env var and redeploy.
- Keep this repo public only after write access and secrets handling are reviewed.
