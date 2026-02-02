// src/controllers/authController.js
// ============================================================
// Authentication Controller
// Handles: Register, Login, Refresh Token, Get Profile
// ============================================================

const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/tokenHelper");

// ── REGISTER ─────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, role? }
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // 2. Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // 3. Hash the password (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create the user
    // Only allow 'student' or 'teacher' on registration (never 'admin')
    const safeRole = (role === "teacher") ? "teacher" : "student";
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: safeRole
    });

    // 5. Generate tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 6. Save refresh token to DB for rotation
    await user.update({ refreshToken });

    // 7. Send response (never send passwordHash to the client!)
    res.status(201).json({
      message: "Registration successful",
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        xp:    user.xp,
        level: user.level
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ── LOGIN ────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 1. Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 2. Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3. Generate tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 4. Update refresh token in DB
    await user.update({ refreshToken });

    res.status(200).json({
      message: "Login successful",
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        xp:    user.xp,
        level: user.level
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ── REFRESH TOKEN ────────────────────────────────────────────
// POST /api/auth/refresh
// Body: { refreshToken }
// When the access token expires, the frontend sends its refresh token here.
// We verify it, rotate it (issue a new one), and return a new access token.
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    // 1. Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Find the user and check the stored refresh token matches
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid or revoked refresh token." });
    }

    // 3. Generate new tokens (rotation)
    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 4. Save the new refresh token
    await user.update({ refreshToken: newRefreshToken });

    res.status(200).json({
      accessToken:  newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({ message: "Failed to refresh token." });
  }
};

// ── GET PROFILE ──────────────────────────────────────────────
// GET /api/auth/profile   (protected — requires valid access token)
// Returns the currently logged-in user's info.
const getProfile = async (req, res) => {
  try {
    // req.user is populated by verifyToken middleware
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "xp", "level", "language", "createdAt"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

module.exports = { register, login, refresh, getProfile };
