// src/App.js
// ============================================================
// Root Application Component
// Sets up:
//   - AuthProvider (global auth state)
//   - React Router with all page routes
//   - Navbar (shown on every page)
//   - ProtectedRoute wrappers for authenticated pages
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Page imports
import Home            from "./pages/Home";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Courses         from "./pages/Courses";
import CourseDetail    from "./pages/CourseDetail";
import MyCourses       from "./pages/MyCourses";
import TeacherDashboard from "./pages/TeacherDashboard";
import Leaderboard     from "./pages/Leaderboard";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar is always visible */}
        <Navbar />

        {/* Route definitions */}
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses"  element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Student-only routes */}
          <Route path="/my-courses" element={
            <ProtectedRoute role="student">
              <MyCourses />
            </ProtectedRoute>
          } />

          {/* Teacher-only routes */}
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
