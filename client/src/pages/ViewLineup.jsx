import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lineups } from '../api/client';

export default function ViewLineup() {
  const { id } = useParams();
  const [lineup, setLineup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        const res = await lineups.getOne(id);
        setLineup(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load lineup');
      } finally {
        setLoading(false);
      }
    };
    fetchLineup();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy this link: ' + url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link to="/" className="text-pink-400 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const slotLabels = ['Going first', 'Second', 'Third', 'Fourth', 'Going last'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="text-gray-400 hover:text-white mb-8 inline-block">
          ← Back to home
        </Link>

        <div className="max-w-2xl mx-auto">
          {/* Festival Poster Style */}
          <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 border border-white/10 text-center">
            <p className="text-pink-400 uppercase tracking-widest text-sm mb-2">
              Backyard Marquee Presents
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              {lineup.title}
            </h1>

            {lineup.description && (
              <p className="text-gray-300 text-lg mb-8 italic">"{lineup.description}"</p>
            )}

            <div className="space-y-8">
              {lineup.artists.map((artist, index) => (
                <div
                  key={index}
                  className={`${
                    index === 0
                      ? 'text-4xl font-bold'
                      : index === 1
                      ? 'text-3xl font-semibold'
                      : index === 2
                      ? 'text-2xl font-medium'
                      : 'text-xl'
                  }`}
                >
                  <div className="flex items-center justify-center gap-4">
                    {artist.artist_image ? (
                      <img
                        src={artist.artist_image}
                        alt={artist.artist_name}
                        className={`rounded-full object-cover ${
                          index === 0 ? 'w-20 h-20' : index < 3 ? 'w-16 h-16' : 'w-12 h-12'
                        }`}
                      />
                    ) : null}
                    <span>{artist.artist_name}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{slotLabels[index]}</p>
                  {artist.note && (
                    <p className="text-gray-400 text-sm mt-2 italic max-w-md mx-auto">
                      "{artist.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10">
              <button
                onClick={handleShare}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
              >
                {copied ? '✓ Link Copied!' : 'Share This Lineup'}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Created on {new Date(lineup.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
