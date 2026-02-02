// src/components/ProtectedRoute.js
// ============================================================
// ProtectedRoute Component
// Wraps any route that requires authentication.
// If the user is not logged in, redirects to /login.
// Optionally accepts a `role` prop to restrict access.
//
// Usage:
//   <Route path="/dashboard" element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   } />
//
//   <Route path="/teacher" element={
//     <ProtectedRoute role="teacher">
//       <TeacherPanel />
//     </ProtectedRoute>
//   } />
// ============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // While we're checking auth on first load, show nothing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check: if a specific role is required and user doesn't have it
  if (role && user.role !== role && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // All checks passed — render the protected content
  return children;
};

export default ProtectedRoute;
