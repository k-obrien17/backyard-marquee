// Vercel serverless function serving a dynamic sitemap at /sitemap.xml (wired
// via a rewrite in vercel.json). It pages the public API for every public
// lineup and every artist, plus derives unique creator profiles, so search
// engines can discover the actual content instead of just five static routes.
//
// Degrades gracefully: if the API is unreachable, it still returns the static
// top-level routes so the sitemap is never broken.

const API_BASE = process.env.VITE_API_URL || 'https://backyard-marquee-api.onrender.com/api';
const SITE_BASE = process.env.SITE_URL || 'https://backyardmarquee.thediffraction.com';

const MAX_URLS = 5000; // safety bound on serverless work + sitemap size
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/discover', changefreq: 'daily', priority: '0.9' },
  { path: '/leaderboard', changefreq: 'daily', priority: '0.8' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function urlEntry(loc, { changefreq, priority, lastmod } = {}) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>` +
    (lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '') +
    (changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : '') +
    (priority ? `\n    <priority>${priority}</priority>` : '') +
    `\n  </url>`;
}

// Page through a list endpoint that returns { [key]: [...], total } until we
// have everything (or hit MAX_URLS). pageSize must be <= the endpoint's clamp.
async function fetchAll(path, key, pageSize, cap) {
  const out = [];
  let offset = 0;
  for (let guard = 0; guard < 200; guard++) {
    const r = await fetch(`${API_BASE}${path}${path.includes('?') ? '&' : '?'}limit=${pageSize}&offset=${offset}`);
    if (!r.ok) break;
    const data = await r.json();
    const rows = data[key] || [];
    out.push(...rows);
    const total = typeof data.total === 'number' ? data.total : out.length;
    offset += pageSize;
    if (out.length >= total || rows.length === 0 || out.length >= cap) break;
  }
  return out.slice(0, cap);
}

export default async function handler(req, res) {
  const entries = STATIC_ROUTES.map(r => urlEntry(`${SITE_BASE}${r.path}`, r));

  try {
    const remaining = () => MAX_URLS - entries.length;

    // Lineups (browse caps limit at 50). Capture creator usernames as we go.
    const lineups = await fetchAll('/stats/browse?sort=recent', 'lineups', 50, Math.max(0, remaining()));
    const creators = new Set();
    for (const l of lineups) {
      if (entries.length >= MAX_URLS) break;
      const lastmod = l.created_at ? new Date(String(l.created_at).replace(' ', 'T') + 'Z').toISOString() : undefined;
      entries.push(urlEntry(`${SITE_BASE}/lineup/${l.id}`, { changefreq: 'weekly', priority: '0.7', lastmod }));
      if (l.creator_username) creators.add(l.creator_username);
    }

    // Artists (leaderboard caps limit at 100).
    const artists = await fetchAll('/stats/leaderboard', 'artists', 100, Math.max(0, remaining()));
    for (const a of artists) {
      if (entries.length >= MAX_URLS) break;
      if (!a.artist_name) continue;
      entries.push(urlEntry(`${SITE_BASE}/artist/${encodeURIComponent(a.artist_name)}`, { changefreq: 'weekly', priority: '0.6' }));
    }

    // Creator profiles derived from lineups (no list-users endpoint exists).
    for (const username of creators) {
      if (entries.length >= MAX_URLS) break;
      entries.push(urlEntry(`${SITE_BASE}/user/${encodeURIComponent(username)}`, { changefreq: 'weekly', priority: '0.5' }));
    }
  } catch {
    // Fall through with whatever static routes we have.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}
