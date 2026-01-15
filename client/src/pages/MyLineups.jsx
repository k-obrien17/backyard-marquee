import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lineups } from '../api/client';
import Navbar from '../components/Navbar';

export default function MyLineups() {
  const [userLineup, setUserLineup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchLineup = async () => {
      if (!user) return;
      try {
        const res = await lineups.getAll();
        setUserLineup(res.data[0] || null);
      } catch (err) {
        setError('Failed to load lineup');
      } finally {
        setLoading(false);
      }
    };
    fetchLineup();
  }, [user]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your lineup? This cannot be undone.')) return;
    try {
      await lineups.delete(userLineup.id);
      setUserLineup(null);
    } catch {
      alert('Failed to delete lineup');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const slotLabels = ['Going first', 'Second', 'Third', 'Fourth', 'Going last'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">My Lineup</h1>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        {!userLineup ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">You haven't created a lineup yet</p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Create Your Lineup
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Lineup Card */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-center mb-4">{userLineup.title}</h2>

              {userLineup.description && (
                <p className="text-gray-400 text-center mb-6 italic">"{userLineup.description}"</p>
              )}

              <div className="space-y-4 mb-8">
                {userLineup.artists?.map((artist, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500/30 text-yellow-400' :
                      index === 1 ? 'bg-pink-500/30 text-pink-400' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    {artist.artist_image ? (
                      <img
                        src={artist.artist_image}
                        alt={artist.artist_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        🎵
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{artist.artist_name}</p>
                      <p className="text-gray-500 text-sm">{slotLabels[index]}</p>
                      {artist.note && (
                        <p className="text-gray-400 text-sm mt-1 italic">"{artist.note}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Link
                  to={`/lineup/${userLineup.id}`}
                  className="flex-1 text-center bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  View & Share
                </Link>
                <Link
                  to={`/edit/${userLineup.id}`}
                  className="flex-1 text-center bg-white/10 border border-white/20 py-3 rounded-lg font-semibold hover:bg-white/20 transition"
                >
                  Edit Lineup
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
