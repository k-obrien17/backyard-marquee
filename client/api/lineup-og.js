// Vercel serverless function. Triggered by a User-Agent-conditional rewrite in
// vercel.json for /lineup/:id, so search-engine and social crawlers (Googlebot,
// Discord, Twitter, Slack, FB, LinkedIn, etc.) land here. Real browsers fall
// through to the SPA.
//
// We fetch the lineup from the API, escape every interpolated value, and return
// a full HTML doc: OG/Twitter meta for social cards PLUS a real, indexable body
// (heading, creator, artist list, tags) and ItemList JSON-LD. The body mirrors
// what a human sees in the SPA, so this is equivalent-content dynamic rendering,
// not cloaking.

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

// JSON-LD must not let a user-supplied "</script>" break out of the script tag.
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
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

  const url = `${SITE_BASE}/lineup/${id}`;

  // Lineup not found: still return a valid, non-empty doc pointing back to discover.
  if (!lineup) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.status(404).send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<title>Lineup not found - Backyard Marquee</title>
<meta name="robots" content="noindex" />
<link rel="canonical" href="${SITE_BASE}/discover" />
</head><body><h1>Lineup not found</h1>
<p><a href="${SITE_BASE}/discover">Browse other lineups</a></p></body></html>`);
    return;
  }

  const title = escapeHtml(lineup.title || 'Backyard Marquee');
  const creator = lineup.creator_username || 'anonymous';
  const creatorEsc = escapeHtml(creator);
  const artists = Array.isArray(lineup.artists) ? lineup.artists : [];
  const artistNames = artists.map(a => a.artist_name).filter(Boolean);

  // Description: prefer the user's, else a content-rich fallback naming the
  // artists so the snippet is useful even with no description.
  const fallbackDesc = artistNames.length
    ? `A dream concert lineup by @${creator}: ${artistNames.join(', ')}.`
    : `A dream concert lineup by @${creator}.`;
  const desc = escapeHtml(lineup.description || fallbackDesc);

  const image = artists[0]?.artist_image ? escapeHtml(artists[0].artist_image) : null;
  const imageMeta = image
    ? `
    <meta property="og:image" content="${image}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />`
    : `
    <meta name="twitter:card" content="summary" />`;

  const tags = Array.isArray(lineup.tags) ? lineup.tags.filter(Boolean) : [];

  // Visible, indexable body that mirrors the SPA's poster.
  const artistListHtml = artists.map((a, i) => {
    const name = escapeHtml(a.artist_name || '');
    const num = String(i + 1).padStart(2, '0');
    const linked = a.artist_spotify_url
      ? `<a href="${escapeHtml(a.artist_spotify_url)}" rel="noopener nofollow">${name}</a>`
      : name;
    return `    <li>${num} ${linked}</li>`;
  }).join('\n');

  const tagsHtml = tags.length
    ? `<p>Genres: ${tags.map(t => escapeHtml(t)).join(', ')}</p>`
    : '';

  // ItemList of the artists (each a MusicGroup). Accurate schema for "a list of
  // 5 artists" without claiming a real ticketed event.
  const ld = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lineup.title || 'Backyard Marquee lineup',
    description: lineup.description || fallbackDesc,
    url,
    numberOfItems: artists.length,
    itemListElement: artists.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicGroup',
        name: a.artist_name || '',
        ...(a.artist_spotify_url ? { sameAs: a.artist_spotify_url } : {}),
      },
    })),
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} - Backyard Marquee</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Backyard Marquee" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />${imageMeta}
  <script type="application/ld+json">${ld}</script>
</head>
<body>
  <main>
    <p>Backyard Marquee presents</p>
    <h1>${title}</h1>
    <p>A dream concert lineup by <a href="${SITE_BASE}/user/${encodeURIComponent(creator)}">@${creatorEsc}</a></p>
    ${lineup.description ? `<p>${desc}</p>` : ''}
    <ol>
${artistListHtml}
    </ol>
    ${tagsHtml}
    <p><a href="${SITE_BASE}/create">Build your own lineup</a> &middot; <a href="${SITE_BASE}/discover">Discover more lineups</a></p>
  </main>
</body>
</html>`);
}
