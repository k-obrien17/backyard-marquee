// Vercel serverless function. Triggered by a User-Agent-conditional rewrite in
// vercel.json for /lineup/:id, so only crawlers (Discord, Twitter, Slack, FB,
// LinkedIn, etc.) land here. Real browsers fall through to the SPA.
//
// We fetch the lineup from the API, escape every interpolated value, and
// return a tiny HTML doc with OG + Twitter Card meta tags.

const API_BASE = process.env.VITE_API_URL || 'https://backyard-marquee-api.onrender.com/api';
const SITE_BASE = process.env.SITE_URL || 'https://backyardmarquee.thediffraction.com';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  const id = (req.query.id || '').toString().replace(/[^0-9]/g, '');
  if (!id) {
    res.status(400).send('bad id');
    return;
  }

  let lineup = null;
  try {
    const r = await fetch(`${API_BASE}/lineups/${id}`);
    if (r.ok) lineup = await r.json();
  } catch {}

  const title = escapeHtml(lineup?.title || 'Backyard Marquee');
  const creator = lineup?.creator_username || 'anonymous';
  const fallbackDesc = lineup
    ? `A 5-artist lineup by @${creator}`
    : 'Build your dream 5-artist concert lineup.';
  const desc = escapeHtml(lineup?.description || fallbackDesc);
  const url = `${SITE_BASE}/lineup/${id}`;

  // First artist image, when present, makes a nicer Discord/Twitter card.
  const image = lineup?.artists?.[0]?.artist_image
    ? escapeHtml(lineup.artists[0].artist_image)
    : null;

  const imageMeta = image
    ? `
    <meta property="og:image" content="${image}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />`
    : `
    <meta name="twitter:card" content="summary" />`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} - Backyard Marquee</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Backyard Marquee" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />${imageMeta}
</head>
<body></body>
</html>`);
}
