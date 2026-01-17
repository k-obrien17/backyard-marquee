import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              Backyard Marquee
            </Link>
            <p className="text-gray-400 mt-4 max-w-md">
              Create your dream concert lineup with 5 artists. Share it with friends and see what lineups others are building.
            </p>
            <div className="flex gap-4 mt-6">
              <span className="text-yellow-400">✦</span>
              <span className="text-pink-400">✦</span>
              <span className="text-purple-400">✦</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/discover" className="text-gray-400 hover:text-pink-400 transition">
                  Discover Lineups
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-400 hover:text-pink-400 transition">
                  Artist Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-400 hover:text-pink-400 transition">
                  Create Lineup
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-pink-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-pink-400 transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/my-lineups" className="text-gray-400 hover:text-pink-400 transition">
                  My Lineup
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Backyard Marquee. Built for music lovers.
          </p>
          <p className="text-gray-600 text-xs">
            Artist data powered by Last.fm
          </p>
        </div>
      </div>
    </footer>
  );
}
