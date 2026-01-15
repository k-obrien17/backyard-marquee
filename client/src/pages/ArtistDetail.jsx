import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { stats } from '../api/client';
import Navbar from '../components/Navbar';

export default function ArtistDetail() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await stats.artist(name);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Artist not found');
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [name]);

  const slotLabels = ['Going first', 'Second', 'Third', 'Fourth', 'Going last'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link to="/leaderboard" className="text-pink-400 hover:underline">
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const { stats: artistStats, lineups, pairings } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Artist Header */}
        <div className="text-center mb-12">
          {artistStats.artist_image ? (
            <img
              src={artistStats.artist_image}
              alt={artistStats.artist_name}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-pink-500"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-5xl mx-auto mb-6 border-4 border-pink-500">
              🎵
            </div>
          )}
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {artistStats.artist_name}
          </h1>
          <p className="text-gray-400 text-lg">
            Featured in {artistStats.lineup_count} lineup{artistStats.lineup_count !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Position Breakdown</h2>

              <div className="space-y-4">
                {[
                  { label: 'First', count: artistStats.headliner_count, color: 'from-yellow-400 to-orange-500' },
                  { label: 'Second', count: artistStats.coheadliner_count, color: 'from-pink-400 to-purple-500' },
                  { label: 'Third', count: artistStats.special_guest_count, color: 'from-blue-400 to-cyan-500' },
                  { label: 'Fourth', count: artistStats.opener_count, color: 'from-green-400 to-teal-500' },
                  { label: 'Last', count: artistStats.local_opener_count, color: 'from-purple-400 to-indigo-500' },
                ].map(slot => (
                  <div key={slot.label} className="flex items-center justify-between">
                    <span className="text-gray-300">{slot.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${slot.color}`}
                          style={{ width: `${(slot.count / artistStats.lineup_count) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8 text-right">{slot.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">Average Position</p>
                <p className="text-2xl font-bold">
                  {slotLabels[Math.round(artistStats.avg_position)] || 'N/A'}
                </p>
              </div>
            </div>

            {/* Commonly Paired With */}
            {pairings.length > 0 && (
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mt-6">
                <h2 className="text-xl font-semibold mb-4">Often Paired With</h2>
                <div className="space-y-2">
                  {pairings.map(pair => (
                    <Link
                      key={pair.artist_name}
                      to={`/artist/${encodeURIComponent(pair.artist_name)}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition"
                    >
                      <span className="text-gray-300 hover:text-pink-400">{pair.artist_name}</span>
                      <span className="text-gray-500 text-sm">{pair.pair_count}x</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lineups List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Featured In These Lineups</h2>
            <div className="space-y-4">
              {lineups.map(lineup => (
                <Link
                  key={lineup.id}
                  to={`/lineup/${lineup.id}`}
                  className="block bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-pink-500/50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{lineup.title}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(lineup.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lineup.slot_position === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      lineup.slot_position === 1 ? 'bg-pink-500/20 text-pink-400' :
                      'bg-white/10 text-gray-300'
                    }`}>
                      {slotLabels[lineup.slot_position]}
                    </span>
                  </div>

                  {lineup.artist_note && (
                    <p className="text-purple-300 text-sm mb-3 italic bg-purple-500/10 px-3 py-2 rounded-lg">
                      "{lineup.artist_note}"
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {lineup.all_artists.map((a, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-sm ${
                          a.artist_name.toLowerCase() === artistStats.artist_name.toLowerCase()
                            ? 'bg-pink-500/30 text-pink-300 font-medium'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {a.artist_name}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
