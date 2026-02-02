// src/api/client.js
// ============================================================
// Axios API Client
// - Automatically attaches the JWT access token to every request
// - Interceptor: if a 401 is received, tries to refresh the token
//   and retries the original request automatically
// ============================================================

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

// ── Request Interceptor ──────────────────────────────────────
// Before every request, attach the access token from localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────────────
// If we get a 401 (token expired), try to refresh automatically
client.interceptors.response.use(
  (response) => response,  // pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh once (prevent infinite loop)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // Call the refresh endpoint
        const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });

        // Save the new tokens
        localStorage.setItem("accessToken",  res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // Retry the original failed request with the new access token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return client(originalRequest);
      } catch (refreshErr) {
        // Refresh failed — user must log in again
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

module.exports = client;
