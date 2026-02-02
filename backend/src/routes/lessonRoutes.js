// src/routes/lessonRoutes.js
// ============================================================
// Lesson Routes (nested under /api/courses/:courseId/lessons)
// GET    /                           — list lessons for a course
// POST   /                           — create lesson (teacher)
// GET    /:lessonId                  — get single lesson
// PUT    /:lessonId                  — update lesson (teacher)
// DELETE /:lessonId                  — delete lesson (teacher)
// POST   /:lessonId/summarize        — AI-generate summary
// ============================================================

const express = require("express");
// mergeParams: true lets us access :courseId from the parent router
const router  = express.Router({ mergeParams: true });
const { createLesson, getLessons, getLesson, updateLesson, deleteLesson, summarizeLesson } = require("../controllers/lessonController");
const { verifyToken, requireRole } = require("../middleware/auth");

// Public: read lessons
router.get("/",           getLessons);
router.get("/:lessonId",  getLesson);

// Protected + Teacher: create, update, delete
router.post("/",           verifyToken, requireRole("teacher", "admin"), createLesson);
router.put("/:lessonId",   verifyToken, requireRole("teacher", "admin"), updateLesson);
router.delete("/:lessonId",verifyToken, requireRole("teacher", "admin"), deleteLesson);

// Protected: AI summarize (any logged-in user can request a summary)
router.post("/:lessonId/summarize", verifyToken, summarizeLesson);

module.exports = router;
