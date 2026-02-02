// src/utils/tokenHelper.js
// ============================================================
// JWT Token Utilities
// Generates access tokens and refresh tokens.
// Handles the refresh token rotation pattern for security.
// ============================================================

const jwt = require("jsonwebtoken");
require("dotenv").config();

// ── Generate Access Token ────────────────────────────────────
// Short-lived token (15 min default). Stored in memory (not cookie).
// Contains user identity info needed by the frontend.
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
};

// ── Generate Refresh Token ───────────────────────────────────
// Long-lived token (7 days default). Used ONLY to obtain new access tokens.
// We store this in the DB (on the User record) for rotation.
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
};

// ── Verify Refresh Token ─────────────────────────────────────
// Returns the decoded payload or throws an error.
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
