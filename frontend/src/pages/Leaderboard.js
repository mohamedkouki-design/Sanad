// src/pages/Leaderboard.js
// ============================================================
// Leaderboard Page
// Shows the top 20 students ranked by total XP.
// The current user's row is highlighted.
// ============================================================

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/AuthContext";
import { progressAPI } from "../api/services";

const Leaderboard = () => {
  const { user }                     = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    progressAPI.getLeaderboard()
      .then((res) => setLeaderboard(res.data.leaderboard))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, []);

  // Medal colors for top 3
  const getMedal = (rank) => {
    if (rank === 1) return { emoji: "🥇", bg: "bg-yellow-100",  text: "text-yellow-700" };
    if (rank === 2) return { emoji: "🥈", bg: "bg-gray-100",    text: "text-gray-600"   };
    if (rank === 3) return { emoji: "🥉", bg: "bg-orange-100",  text: "text-orange-600" };
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
          <p className="text-yellow-100 text-sm mt-1">Top students ranked by total XP earned</p>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No students on the leaderboard yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-3 text-center">Level</div>
              <div className="col-span-3 text-right">XP</div>
            </div>

            {/* Rows */}
            {leaderboard.map((entry) => {
              const medal = getMedal(entry.rank);
              const isYou = entry.isYou;

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-gray-50 transition ${
                    isYou ? "bg-indigo-50 border-l-4 border-l-indigo-500" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    {medal ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${medal.bg} text-sm`}>
                        {medal.emoji}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 font-semibold">{entry.rank}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="col-span-5">
                    <p className={`text-sm font-semibold ${isYou ? "text-indigo-700" : "text-gray-800"}`}>
                      {entry.name} {isYou && <span className="text-xs text-indigo-400">(You)</span>}
                    </p>
                  </div>

                  {/* Level */}
                  <div className="col-span-3 text-center">
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                      Lv.{entry.level}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="col-span-3 text-right">
                    <span className={`text-sm font-bold ${isYou ? "text-indigo-600" : "text-gray-700"}`}>
                      {entry.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
