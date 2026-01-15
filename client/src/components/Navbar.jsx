import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            Backyard Marquee
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/discover"
              className={`transition ${isActive('/discover') ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`}
            >
              Discover
            </Link>
            <Link
              to="/leaderboard"
              className={`transition ${isActive('/leaderboard') ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`}
            >
              Leaderboard
            </Link>
            {user && (
              <>
                <Link
                  to="/create"
                  className={`transition ${isActive('/create') ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`}
                >
                  Create
                </Link>
                <Link
                  to="/my-lineups"
                  className={`transition ${isActive('/my-lineups') ? 'text-pink-400' : 'text-gray-300 hover:text-white'}`}
                >
                  My Lineups
                </Link>
              </>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
