// src/routes/authRoutes.js
// ============================================================
// Auth Routes
// POST   /api/auth/register   — create new account
// POST   /api/auth/login      — sign in
// POST   /api/auth/refresh    — get new access token
// GET    /api/auth/profile    — get current user (protected)
// ============================================================

const express = require("express");
const router  = express.Router();
const { register, login, refresh, getProfile } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// Public routes (no auth needed)
router.post("/register", register);
router.post("/login",    login);
router.post("/refresh",  refresh);

// Protected route (must be logged in)
router.get("/profile", verifyToken, getProfile);

module.exports = router;
