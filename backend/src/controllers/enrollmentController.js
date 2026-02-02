// src/controllers/enrollmentController.js
// ============================================================
// Enrollment Controller
// Students can enroll in / drop courses.
// Teachers can see who is enrolled in their courses.
// ============================================================

const { Enrollment, Course, User } = require("../models");

// ── ENROLL IN A COURSE ───────────────────────────────────────
// POST /api/enrollments
// Body: { courseId }
// The studentId comes from req.user (the authenticated student).
const enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required." });
    }

    // 1. Verify the course exists and is published
    const course = await Course.findByPk(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({ message: "Course not found or not published." });
    }

    // 2. Check if already enrolled
    const existing = await Enrollment.findOne({
      where: { studentId: req.user.id, courseId }
    });
    if (existing) {
      return res.status(409).json({ message: "You are already enrolled in this course." });
    }

    // 3. Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user.id,
      courseId,
      status: "active"
    });

    res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (err) {
    console.error("Enroll error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── DROP A COURSE ────────────────────────────────────────────
// DELETE /api/enrollments/:courseId
const drop = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { studentId: req.user.id, courseId: req.params.courseId }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    await enrollment.destroy();
    res.status(200).json({ message: "Dropped course successfully." });
  } catch (err) {
    console.error("Drop error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET MY ENROLLED COURSES (student view) ───────────────────
// GET /api/enrollments/my
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: Course,
          as: "course",
          include: [{ model: User, as: "teacher", attributes: ["name"] }]
        }
      ],
      order: [["enrolledAt", "DESC"]]
    });

    res.status(200).json({ enrollments });
  } catch (err) {
    console.error("Get enrollments error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET ENROLLMENTS FOR A COURSE (teacher view) ──────────────
// GET /api/enrollments/course/:courseId
// Only the course's teacher can see this list.
const getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId: req.params.courseId },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email", "xp", "level"] }
      ]
    });

    res.status(200).json({ enrollments });
  } catch (err) {
    console.error("Get course enrollments error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { enroll, drop, getMyEnrollments, getCourseEnrollments };
