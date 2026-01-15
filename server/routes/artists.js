import { Router } from 'express';

const router = Router();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.json({ artists: [] });
  }

  if (!LASTFM_API_KEY) {
    // Return mock data if no API key configured
    return res.json({
      artists: [
        { name: q, image: null, tags: ['rock'], mbid: null },
      ]
    });
  }

  try {
    const url = new URL('https://ws.audioscrobbler.com/2.0/');
    url.searchParams.set('method', 'artist.search');
    url.searchParams.set('artist', q);
    url.searchParams.set('api_key', LASTFM_API_KEY);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '10');

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Last.fm API error:', data.message);
      return res.status(500).json({ error: 'Search failed' });
    }

    const artists = (data.results?.artistmatches?.artist || []).map(artist => {
      // Get the largest image available
      const images = artist.image || [];
      const largeImage = images.find(img => img.size === 'large') ||
                         images.find(img => img.size === 'medium') ||
                         images[0];

      return {
        name: artist.name,
        mbid: artist.mbid || null,
        image: largeImage?.['#text'] || null,
        listeners: artist.listeners,
      };
    });

    res.json({ artists });
  } catch (err) {
    console.error('Artist search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
