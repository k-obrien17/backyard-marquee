# Security Policy

Backyard Marquee is public for browsing, but lineup management is authenticated.

## What Is Intended

- Public users can browse lineups, artists, and social previews.
- Signed-in users can create, edit, like, comment on, and manage their own lineups.
- Guest creation exists intentionally and is rate-limited.
- Spotify credentials and other server-side secrets stay on the API side only.

## Required Secrets

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `JWT_SECRET`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `FRONTEND_URL`

## Do Not Commit

- `.env` files
- logs
- exports
- database dumps
- private user data
- moderation/admin data

## Accepted Risks

- The SPA and JWT model is intentionally pragmatic, not enterprise IAM.
- Guest accounts can create junk data, but they are rate-limited and disposable.

## Reporting

Please report security issues privately through the public contact link on https://www.keithrobrien.com rather than opening exploit details in a GitHub issue.
