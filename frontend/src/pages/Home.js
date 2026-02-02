// src/pages/Home.js
// ============================================================
// Home Page (Landing)
// Shows a hero banner, then a grid of featured (published) courses.
// If the user is logged in, shows their XP and a quick-stats bar.
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { courseAPI } from "../api/services";
import CourseCard from "../components/CourseCard";

const Home = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getAll()
      .then((res) => setCourses(res.data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">
            {user ? `Welcome back, ${user.name}! 👋` : "Learn Smarter. Grow Faster. 🎓"}
          </h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            {user
              ? "Continue your learning journey with personalized courses."
              : "LearnTn is Tunisia's adaptive learning platform. Explore courses, earn XP, and level up!"}
          </p>

          {/* Stats bar for logged-in users */}
          {user && (
            <div className="flex justify-center gap-6 mt-6">
              <div className="bg-indigo-500 rounded-xl px-5 py-2">
                <p className="text-xs text-indigo-200">Level</p>
                <p className="text-xl font-bold">{user.level}</p>
              </div>
              <div className="bg-indigo-500 rounded-xl px-5 py-2">
                <p className="text-xs text-indigo-200">Total XP</p>
                <p className="text-xl font-bold">{user.xp}</p>
              </div>
              <div className="bg-indigo-500 rounded-xl px-5 py-2">
                <p className="text-xs text-indigo-200">Role</p>
                <p className="text-xl font-bold capitalize">{user.role}</p>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          {!user && (
            <div className="flex justify-center gap-3 mt-6">
              <Link to="/register" className="bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-50 transition">
                Get Started
              </Link>
              <Link to="/courses" className="border border-indigo-300 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-500 transition">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {user ? "Explore Courses" : "Featured Courses"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">Browse all available courses on the platform</p>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No courses available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Link to full courses page */}
        <div className="text-center mt-8">
          <Link to="/courses" className="text-indigo-600 font-semibold hover:underline text-sm">
            View all courses →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
