// src/components/Navbar.js
// ============================================================
// Navbar Component
// Shows different links based on whether the user is logged in
// and their role (student vs teacher).
// Displays the user's XP and level badge when logged in.
// ============================================================

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Logo / Brand */}
      <Link to="/" className="text-xl font-bold tracking-tight hover:text-indigo-200 transition">
        🎓 LearnTn
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-4">
        {/* Always visible */}
        <Link to="/courses" className="text-sm hover:text-indigo-200 transition">
          Courses
        </Link>
        <Link to="/leaderboard" className="text-sm hover:text-indigo-200 transition">
          🏆 Leaderboard
        </Link>

        {/* Logged-in links */}
        {user && (
          <>
            {/* Student-specific */}
            {user.role === "student" && (
              <Link to="/my-courses" className="text-sm hover:text-indigo-200 transition">
                My Courses
              </Link>
            )}

            {/* Teacher-specific */}
            {user.role === "teacher" && (
              <Link to="/teacher" className="text-sm hover:text-indigo-200 transition">
                Dashboard
              </Link>
            )}

            {/* User badge: shows name, XP, level */}
            <div className="flex items-center gap-2 bg-indigo-600 rounded-full px-3 py-1">
              <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">
                Lv.{user.level}
              </span>
              <span className="text-xs text-indigo-200">{user.xp} XP</span>
              <span className="text-sm font-semibold">{user.name}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="text-sm bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </>
        )}

        {/* Not logged in */}
        {!user && (
          <>
            <Link to="/login"    className="text-sm hover:text-indigo-200 transition">Login</Link>
            <Link to="/register" className="text-sm bg-white text-indigo-700 font-semibold px-3 py-1 rounded hover:bg-indigo-100 transition">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
