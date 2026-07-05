# Backyard Marquee

Backyard Marquee is a concert lineup builder for creating, sharing, and discussing 5-artist bills.

## Project Layout

- `client/` - Vite React frontend
- `server/` - Express API
- `client/public/screenshots/` - public screenshots used in the README

## Local Development

```bash
cd server
npm install
npm run dev

cd client
npm install
npm run dev
```

## Environment

- Server uses Turso, JWT auth, Spotify, and Google OAuth env vars
- Client uses `VITE_API_URL` at build time

## Notes

- Keep secrets out of the repo.
- Keep the README and screenshots current when the UI changes.
