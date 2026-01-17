import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lineups } from '../api/client';
import Navbar from '../components/Navbar';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link to="/" className="text-pink-400 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Festival Poster */}
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 rounded-2xl blur-sm opacity-75"></div>

            {/* Poster container */}
            <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden">
              {/* Decorative top border */}
              <div className="h-2 bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500"></div>

              {/* Stars decoration */}
              <div className="absolute top-4 left-4 text-yellow-400 opacity-60">✦</div>
              <div className="absolute top-8 right-8 text-pink-400 opacity-60">✦</div>
              <div className="absolute top-20 left-12 text-purple-400 opacity-40">✦</div>
              <div className="absolute top-16 right-16 text-yellow-400 opacity-40">✦</div>

              <div className="px-8 py-10 text-center">
                {/* Header */}
                <div className="mb-8">
                  <p className="text-yellow-400 uppercase tracking-[0.3em] text-xs font-medium mb-4">
                    ★ Backyard Marquee Presents ★
                  </p>
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
                    {lineup.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-pink-500"></div>
                    <span className="text-pink-400">✦</span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-pink-500"></div>
                  </div>
                </div>

                {lineup.description && (
                  <p className="text-gray-400 text-sm mb-8 italic max-w-md mx-auto">
                    "{lineup.description}"
                  </p>
                )}

                {/* Lineup */}
                <div className="space-y-6 mb-10">
                  {lineup.artists.map((artist, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-300 ${
                        index === 0 ? 'scale-100' : index === 1 ? 'scale-95' : 'scale-90'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-4">
                        {artist.artist_image && (
                          <img
                            src={artist.artist_image}
                            alt={artist.artist_name}
                            className={`rounded-full object-cover ring-2 ring-white/20 ${
                              index === 0 ? 'w-20 h-20' : index === 1 ? 'w-16 h-16' : 'w-12 h-12'
                            }`}
                          />
                        )}
                        <span className={`font-bold uppercase tracking-wide ${
                          index === 0
                            ? 'text-3xl md:text-5xl text-white'
                            : index === 1
                            ? 'text-2xl md:text-3xl text-gray-200'
                            : index === 2
                            ? 'text-xl md:text-2xl text-gray-300'
                            : 'text-lg md:text-xl text-gray-400'
                        }`}>
                          {artist.artist_name}
                        </span>
                      </div>
                      {artist.note && (
                        <p className="text-gray-500 text-xs mt-2 italic max-w-sm mx-auto">
                          "{artist.note}"
                        </p>
                      )}
                      {index < lineup.artists.length - 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
                          <span className="text-xs">•</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer decoration */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs uppercase tracking-widest mb-6">
                    <span>★</span>
                    <span>backyard-marquee.vercel.app</span>
                    <span>★</span>
                  </div>
                </div>
              </div>

              {/* Decorative bottom border */}
              <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={handleShare}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-pink-500/25"
            >
              {copied ? '✓ Link Copied!' : 'Share This Lineup'}
            </button>
            <Link
              to="/create"
              className="border border-white/20 px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition text-center"
            >
              Create Your Own
            </Link>
          </div>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Created on {new Date(lineup.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
