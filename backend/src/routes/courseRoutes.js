// src/routes/courseRoutes.js
// ============================================================
// Course Routes
// GET    /api/courses          — browse all published courses (public)
// POST   /api/courses          — create course (teacher only)
// GET    /api/courses/:id      — get single course with lessons
// PUT    /api/courses/:id      — update course (teacher only)
// DELETE /api/courses/:id      — delete course (teacher only)
// ============================================================

const express = require("express");
const router  = express.Router();
const { createCourse, getAllCourses, getCourse, updateCourse, deleteCourse } = require("../controllers/courseController");
const { verifyToken, requireRole } = require("../middleware/auth");

// Public: browse published courses
router.get("/", getAllCourses);

// Public: view a single course (includes lessons)
router.get("/:id", getCourse);

// Protected + Teacher only: create, update, delete
router.post("/",    verifyToken, requireRole("teacher", "admin"), createCourse);
router.put("/:id",  verifyToken, requireRole("teacher", "admin"), updateCourse);
router.delete("/:id", verifyToken, requireRole("teacher", "admin"), deleteCourse);

module.exports = router;
