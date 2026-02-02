// src/routes/enrollmentRoutes.js
// ============================================================
// Enrollment Routes
// POST   /api/enrollments              — enroll in a course (student)
// GET    /api/enrollments/my           — get my enrolled courses (student)
// DELETE /api/enrollments/:courseId     — drop a course (student)
// GET    /api/enrollments/course/:courseId — see roster (teacher)
// ============================================================

const express = require("express");
const router  = express.Router();
const { enroll, drop, getMyEnrollments, getCourseEnrollments } = require("../controllers/enrollmentController");
const { verifyToken, requireRole } = require("../middleware/auth");

// Student: enroll, see my courses, drop
router.post("/",           verifyToken, requireRole("student"), enroll);
router.get("/my",          verifyToken, requireRole("student"), getMyEnrollments);
router.delete("/:courseId",verifyToken, requireRole("student"), drop);

// Teacher: see who enrolled in their course
router.get("/course/:courseId", verifyToken, requireRole("teacher", "admin"), getCourseEnrollments);

module.exports = router;
