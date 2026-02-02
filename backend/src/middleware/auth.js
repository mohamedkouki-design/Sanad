// src/middleware/auth.js
// ============================================================
// Authentication & Authorization Middleware
//
// verifyToken  — checks the JWT access token on every protected route
// requireRole  — factory that returns middleware checking user.role
// ============================================================

const jwt = require("jsonwebtoken");
require("dotenv").config();

// ── verifyToken ──────────────────────────────────────────────
// Extracts the Bearer token from the Authorization header,
// verifies it, and attaches the decoded payload (user info) to req.user.
const verifyToken = (req, res, next) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2. Extract the token (format: "Bearer <token>")
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 3. Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 4. Attach decoded user info to the request object
    // decoded contains: { id, email, role, iat, exp }
    req.user = decoded;

    // 5. Continue to the next middleware/route handler
    next();
  } catch (err) {
    // Token expired or tampered with
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please refresh." });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ── requireRole ──────────────────────────────────────────────
// Factory function: returns a middleware that checks if the
// authenticated user has one of the allowed roles.
//
// Usage: requireRole("teacher", "admin")
//   → Only teachers and admins can access that route.
const requireRole = (...roles) => {
  return (req, res, next) => {
    // req.user is set by verifyToken (must run first)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission for this action."
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
