// src/hooks/AuthContext.js
// ============================================================
// Authentication Context
// Provides login/logout state and user info to the entire app.
// Any component can call useAuth() to access:
//   - user          → the current user object (or null)
//   - loading       → true while checking auth on page load
//   - login(data)   → logs in and saves tokens
//   - logout()      → clears everything
//   - register(data)→ creates account and logs in
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);  // true on first load

  // ── On app mount: check if we already have a valid token ──
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Try to fetch the user profile to verify the token is still valid
      authAPI.profile()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token is invalid — clear everything
          localStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);  // No token at all — not logged in
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    // Save tokens to localStorage
    localStorage.setItem("accessToken",  res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  // ── Register ──────────────────────────────────────────────
  const register = async (name, email, password, role) => {
    const res = await authAPI.register({ name, email, password, role });
    localStorage.setItem("accessToken",  res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
