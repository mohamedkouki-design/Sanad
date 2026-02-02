// src/server.js
// ============================================================
// LearnTn Backend — Main Express Server
// This is the entry point. It:
//   1. Loads environment variables
//   2. Sets up middleware (CORS, JSON parsing, logging)
//   3. Mounts all API routes
//   4. Connects to PostgreSQL
//   5. Starts listening on the configured port
// ============================================================

require("dotenv").config();                    // Load .env variables
const express    = require("express");
const cors       = require("cors");
const sequelize  = require("./utils/database");

// Import route modules
const authRoutes       = require("./routes/authRoutes");
const courseRoutes      = require("./routes/courseRoutes");
const lessonRoutes     = require("./routes/lessonRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const progressRoutes   = require("./routes/progressRoutes");

// ── App Initialization ───────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────

// CORS: allow frontend to talk to this API
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Simple request logger (shows method + URL for every request)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────
// All routes are prefixed with /api
app.use("/api/auth",        authRoutes);
app.use("/api/courses",     courseRoutes);
// Lesson routes are nested: /api/courses/:courseId/lessons
app.use("/api/courses/:courseId/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress",    progressRoutes);

// ── 404 Handler (catches unmatched routes) ───────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

// ── Database Connection + Server Start ────────────────────────
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to PostgreSQL database.");

    // Sync all models (create tables if they don't exist)
    // In production, replace with proper migrations!
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 LearnTn API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  });

module.exports = app; // export for testing
