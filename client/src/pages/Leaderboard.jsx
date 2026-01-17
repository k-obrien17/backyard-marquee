import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stats } from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Leaderboard() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 25;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await stats.leaderboard(limit, page * limit);
        setArtists(res.data.artists);
        setTotal(res.data.total);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [page]);

  const slotLabels = ['First', 'Second', 'Third', 'Fourth', 'Last'];

  const getPositionBadge = (avgPosition) => {
    if (avgPosition <= 0.5) return { label: 'Usually first', color: 'from-yellow-400 to-orange-500' };
    if (avgPosition <= 1.5) return { label: 'Usually early', color: 'from-pink-400 to-purple-500' };
    if (avgPosition <= 2.5) return { label: 'Usually middle', color: 'from-blue-400 to-cyan-500' };
    if (avgPosition <= 3.5) return { label: 'Usually late', color: 'from-green-400 to-teal-500' };
    return { label: 'Usually last', color: 'from-purple-400 to-indigo-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Artist Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">
            The most popular artists across all Backyard Marquee lineups
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">No artists on the leaderboard yet</p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Create the First Lineup
            </Link>
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto space-y-4">
              {artists.map((artist, index) => {
                const rank = page * limit + index + 1;
                const badge = getPositionBadge(artist.avg_position);

                return (
                  <Link
                    key={artist.artist_name}
                    to={`/artist/${encodeURIComponent(artist.artist_name)}`}
                    className="group relative block"
                  >
                    {/* Glow effect for top 3 */}
                    {rank <= 3 && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-30 group-hover:opacity-60 blur transition duration-300"></div>
                    )}
                    {/* Regular glow for others */}
                    {rank > 3 && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-40 blur transition duration-300"></div>
                    )}

                    <div className="relative flex items-center gap-4 bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 border border-white/10 group-hover:border-white/20 transition">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30' : 'bg-white/20'
                      }`}>
                        {rank}
                      </div>

                      {artist.artist_image ? (
                        <img
                          src={artist.artist_image}
                          alt={artist.artist_name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl ring-2 ring-white/10">
                          🎵
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="text-xl font-semibold group-hover:text-pink-400 transition">
                          {artist.artist_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{artist.lineup_count} lineup{artist.lineup_count !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{artist.headliner_count}x going first</span>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${badge.color} shadow-lg`}>
                        {badge.label}
                      </div>

                      <div className="text-gray-500 group-hover:text-pink-400 transition">
                        →
                      </div>
                    </div>
                  </Link>
                );
              })}
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

      <Footer />
    </div>
  );
}
