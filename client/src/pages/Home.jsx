import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section with Background Image */}
      <div
        className="relative min-h-[85vh] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Backyard Marquee
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Create your dream 5-artist concert lineup. Pick your headliners,
            build your perfect setlist, and share it with the world.
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition shadow-lg"
              >
                Create New Lineup
              </Link>
              <Link
                to="/my-lineups"
                className="inline-block border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition"
              >
                My Lineup
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="/discover"
                className="inline-block border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition"
              >
                Browse Lineups
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-black to-purple-900/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur">
              <div className="text-5xl mb-4">🎸</div>
              <h3 className="text-xl font-semibold mb-2">Search Artists</h3>
              <p className="text-gray-400">Find your favorite bands and artists from millions in our database</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur">
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="text-xl font-semibold mb-2">Build Your Lineup</h3>
              <p className="text-gray-400">Pick 5 artists for your dream backyard concert</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Share It</h3>
              <p className="text-gray-400">Get a shareable link to show off your perfect lineup</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              to="/leaderboard"
              className="text-pink-400 hover:text-pink-300 text-lg font-medium"
            >
              See the most popular artists →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
