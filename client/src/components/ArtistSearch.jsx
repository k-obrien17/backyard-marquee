import { useState, useEffect } from 'react';
import { artists } from '../api/client';

export default function ArtistSearch({ onSelect, disabled, selectedArtists = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const res = await artists.search(query);
        setResults(res.data.artists || []);
      } catch (err) {
        setError('Failed to search artists');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (artist) => {
    onSelect(artist);
    setQuery('');
    setResults([]);
  };

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? 'Lineup full!' : 'Search for an artist...'}
          disabled={disabled}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 disabled:opacity-50"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="mt-2 bg-black/50 backdrop-blur-lg rounded-lg border border-white/10 max-h-96 overflow-y-auto">
          {results.map((artist) => {
            const isSelected = selectedArtists.includes(artist.name);
            return (
              <button
                key={artist.mbid || artist.name}
                onClick={() => !isSelected && handleSelect(artist)}
                disabled={isSelected}
                className={`w-full flex items-center gap-4 p-3 hover:bg-white/10 transition text-left ${
                  isSelected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{artist.name}</p>
                  {artist.listeners && (
                    <p className="text-gray-400 text-sm">
                      {parseInt(artist.listeners).toLocaleString()} listeners
                    </p>
                  )}
                </div>
                {isSelected && (
                  <span className="ml-auto text-green-400 text-sm">Added</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
