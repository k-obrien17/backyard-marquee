import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stats } from '../api/client';
import Navbar from '../components/Navbar';

export default function Discover() {
  const [lineups, setLineups] = useState([]);
  const [siteStats, setSiteStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lineupsRes, statsRes] = await Promise.all([
          stats.browse(limit, page * limit),
          stats.site()
        ]);
        setLineups(lineupsRes.data.lineups);
        setTotal(lineupsRes.data.total);
        setSiteStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await stats.searchArtists(searchQuery);
        setSearchResults(res.data.artists);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const slotLabels = ['Going first', 'Second', 'Third', 'Fourth', 'Going last'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Discover Lineups
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Explore what others are dreaming up for their backyard concerts
          </p>

          {/* Site Stats */}
          {siteStats && (
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-400">{siteStats.total_lineups}</p>
                <p className="text-gray-500 text-sm">Lineups</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{siteStats.unique_artists}</p>
                <p className="text-gray-500 text-sm">Artists</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{siteStats.total_users}</p>
                <p className="text-gray-500 text-sm">Users</p>
              </div>
            </div>
          )}

          {/* Artist Search */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an artist..."
              className="w-full px-6 py-4 bg-black/50 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />
            {searching && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-lg rounded-xl border border-white/10 max-h-64 overflow-y-auto z-10">
                {searchResults.map(artist => (
                  <Link
                    key={artist.artist_name}
                    to={`/artist/${encodeURIComponent(artist.artist_name)}`}
                    onClick={() => setSearchQuery('')}
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition"
                  >
                    <span className="text-white">{artist.artist_name}</span>
                    <span className="text-gray-500 text-sm">
                      {artist.lineup_count} lineup{artist.lineup_count !== 1 ? 's' : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lineups Grid */}
        <h2 className="text-2xl font-semibold mb-6">Recent Lineups</h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : lineups.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">No public lineups yet</p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Create the First One
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lineups.map(lineup => (
                <Link
                  key={lineup.id}
                  to={`/lineup/${lineup.id}`}
                  className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-pink-500/50 transition group"
                >
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-400 transition">
                    {lineup.title}
                  </h3>
                  {lineup.description && (
                    <p className="text-gray-400 text-sm mb-3 italic line-clamp-2">
                      "{lineup.description}"
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mb-4">
                    {new Date(lineup.created_at).toLocaleDateString()}
                  </p>

                  <div className="space-y-2">
                    {lineup.artists.map((artist, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500/30 text-yellow-400' :
                          index === 1 ? 'bg-pink-500/30 text-pink-400' :
                          'bg-white/10 text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`flex-1 ${index < 2 ? 'font-medium' : 'text-gray-400'}`}>
                          {artist.artist_name}
                        </span>
                        {artist.note && (
                          <span className="text-purple-400 text-xs" title="Has a note">
                            💬
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
