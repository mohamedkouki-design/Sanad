// src/routes/progressRoutes.js
// ============================================================
// Progress Routes
// POST   /api/progress/start                — mark lesson started
// POST   /api/progress/complete             — mark lesson completed + award XP
// GET    /api/progress/course/:courseId      — get my progress for a course
// GET    /api/progress/leaderboard          — top students by XP
// ============================================================

const express = require("express");
const router  = express.Router();
const { startLesson, completeLesson, getCourseProgress, getLeaderboard } = require("../controllers/progressController");
const { verifyToken, requireRole } = require("../middleware/auth");

// All progress routes require authentication
router.post("/start",              verifyToken, requireRole("student"), startLesson);
router.post("/complete",           verifyToken, requireRole("student"), completeLesson);
router.get("/course/:courseId",     verifyToken, requireRole("student"), getCourseProgress);
router.get("/leaderboard",         verifyToken, getLeaderboard);  // any logged-in user can view

module.exports = router;
