// Vercel Edge Function: generates a 1200x630 PNG "festival poster" share card
// for /lineup/:id, used as the og:image so social/link unfurls (Twitter, Discord,
// iMessage, LinkedIn, Slack) show a real poster instead of one Spotify thumbnail.
//
// Uses @vercel/og (Satori). No JSX: elements are plain { type, props } objects,
// which Satori consumes directly, so this stays a plain .js file. Fonts are
// subset to exactly the glyphs we render (covers accents like Bjork/ROSALIA).

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const API_BASE = process.env.VITE_API_URL || 'https://backyard-marquee-api.onrender.com/api';

// Hyperscript: returns a Satori-compatible element.
function el(type, style, children) {
  return { type, props: { style, ...(children !== undefined ? { children } : {}) } };
}

// Load a Google font, subset to the exact glyphs we render. A non-woff2 UA makes
// Google return a TTF, which Satori requires.
async function loadFont(family, weight, text) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1)' },
  })).text();
  const m = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!m) throw new Error('font url not found');
  return await (await fetch(m[1])).arrayBuffer();
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = (searchParams.get('id') || '').replace(/[^0-9]/g, '');

  let lineup = null;
  if (id) {
    try {
      const r = await fetch(`${API_BASE}/lineups/${id}`);
      if (r.ok) lineup = await r.json();
    } catch {}
  }

  const title = (lineup?.title || 'BACKYARD MARQUEE').toUpperCase();
  const creator = lineup?.creator_username || 'anonymous';
  const artists = (Array.isArray(lineup?.artists) ? lineup.artists : []).slice(0, 5);
  const names = artists.map(a => (a.artist_name || '').toUpperCase());

  // Glyph coverage for the subset font: everything we draw.
  const allText =
    'BACKYARD MARQUEE PRESENTS BY @ 0123456789 . / : ' +
    'backyardmarquee.thediffraction.com ' +
    title + ' ' + creator.toUpperCase() + ' ' + names.join(' ');

  let fonts;
  try {
    const [bold, reg] = await Promise.all([
      loadFont('Archivo', 800, allText),
      loadFont('Archivo', 500, allText),
    ]);
    fonts = [
      { name: 'Archivo', data: bold, weight: 800, style: 'normal' },
      { name: 'Archivo', data: reg, weight: 500, style: 'normal' },
    ];
  } catch {
    fonts = undefined; // fall back to Satori default rather than 500ing
  }

  // Scale the title down as it gets longer so a wrapped title never crowds the
  // footer. The middle band is deliberately small: ~19-28 char titles wrap to
  // two lines, so they need the smaller size to keep the poster balanced.
  const titleSize = title.length > 22 ? 56 : title.length > 13 ? 74 : 96;

  const artistRows = names.map((name, i) =>
    el('div', {
      display: 'flex',
      alignItems: 'baseline',
      width: '100%',
      marginBottom: i === names.length - 1 ? 0 : 14,
    }, [
      el('span', { fontSize: 30, fontWeight: 500, color: '#666', width: 70 }, String(i + 1).padStart(2, '0')),
      el('span', {
        fontSize: i === names.length - 1 ? 52 : 40,
        fontWeight: 800,
        color: i === names.length - 1 ? '#fff' : '#d4d4d4',
      }, name),
    ])
  );

  const tree = el('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    padding: 32,
    fontFamily: 'Archivo',
  }, [
    el('div', {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      border: '6px solid #fff',
      padding: '44px 56px',
      justifyContent: 'space-between',
    }, [
      // Header
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { fontSize: 24, fontWeight: 500, letterSpacing: 8, color: '#888' }, 'BACKYARD MARQUEE PRESENTS'),
        el('div', { fontSize: titleSize, fontWeight: 800, color: '#fff', lineHeight: 1.05, marginTop: 12 }, title),
      ]),
      // Artists
      el('div', { display: 'flex', flexDirection: 'column' }, artistRows),
      // Footer
      el('div', {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTop: '3px solid #fff',
        paddingTop: 20,
      }, [
        el('span', { fontSize: 30, fontWeight: 800, color: '#fff' }, `BY @${creator.toUpperCase()}`),
        el('span', { fontSize: 22, fontWeight: 500, letterSpacing: 2, color: '#888' }, 'BACKYARDMARQUEE.THEDIFFRACTION.COM'),
      ]),
    ]),
  ]);

  return new ImageResponse(tree, { width: 1200, height: 630, ...(fonts ? { fonts } : {}) });
}
